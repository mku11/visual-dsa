/*
MIT License

Copyright (c) 2026 Max Kas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { debug, DebugStackFrame } from "vscode";
import { Reader, Variable } from "./reader";

export class PythonReader extends Reader {
	private static excludeVariableNames = new Set([
		"special variables", "function variables", "class variables", "_is_protocol"
	]);
	private static excludeVariableTypes = new Set([
		"NoneType", "method"
	]);
	constructor() {
		super();
	}

	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		let exprName = variable.evaluateName;
		// extractor toString
		if (this.registeredTypes.has(variable.type)) {
			try {
				const expr = "Extractor.__str__(" + exprName + ")";
				const result = await debug.activeDebugSession?.customRequest("evaluate", {
					expression: expr,
					frameId: (debug.activeStackItem as DebugStackFrame).frameId,
					context: 'repl',
				});
				const content = result.result.substring(1, result.result.length - 1);
				return content;
			} catch (ex: Error | unknown) {
				if (ex instanceof Error) {
					console.error("getVariableStrRepr1 Error: " + variable.evaluateName + ": " + ex.message);
				} else {
					console.error(ex);
				}
			}
		}

		let strRepr: string | undefined = undefined;
		try {
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: "str(" + variable.evaluateName + ")",
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			strRepr = result.result.substring(1, result.result.length - 1).replaceAll("\\n", "\n");
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getVariableStrRepr2 Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}

		// if the field is private we try it's getter
		if (!strRepr && !variable.evaluateName.includes('%s') && variable.evaluateName.includes(".")) {
			const index = variable.evaluateName.indexOf(".");
			if (index >= 0) {
				const parent = variable.evaluateName.substring(0, index);
				const field = variable.evaluateName.substring(index + 1, index + 2)
					+ variable.evaluateName.substring(index + 2);
				const getterName = parent + ".get_" + field + "()";
				try {
					const result = await debug.activeDebugSession?.
						customRequest("evaluate", {
							expression: "str(" + getterName + ")",
							frameId: (debug.activeStackItem as DebugStackFrame).frameId,
							context: 'repl',
						});
					strRepr = result.result;
				} catch (ex: Error | unknown) {
					if (ex instanceof Error) {
						console.error("getVariableStrRepr3 Error: " + variable.evaluateName + ": " + ex.message);
					} else {
						console.error(ex);
					}
				}
			}
		}
		return strRepr;
	}

	public async getEdgeValues(variable: Variable, property: string): Promise<string[] | undefined> {
		try {
			const edgeValues: string[] = [];
			let exprName = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			let expr = `'|-|'.join(map(str, ${exprName}.${property}))`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const edgesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (edgesListVar.type.endsWith('Exception')) {
				throw new Error(edgesListVar.result);
			}
			const edgeVars: string[] = edgesListVar.result.substring(1, edgesListVar.result.length - 1).split("|-|");
			for (const edgeVar of edgeVars) {
				edgeValues.push(edgeVar);
			}
			return edgeValues;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				// this.trackErrors(ex, type, "userDefEdges");
				console.error("getEdgeValues Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async getUserDefNodes(variable: Variable, rootVariable: Variable
	): Promise<Variable[] | undefined> {
		try {
			let expr = variable.evaluateName;
			expr = "Extractor.get_nodes(" + expr + "," + rootVariable.name + ")";
			const nodesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (nodesListVar.type.endsWith('Exception')) {
				throw new Error(nodesListVar.result);
			}
			if (nodesListVar.result === 'None') {
				return undefined;
			}
			if (nodesListVar.variablesReference == 0) {
				return [];
			}
			const nodes: Variable[] = [];
			const children = await this.getVariables(nodesListVar.variablesReference);
			let idx = 0;
			for (const child of children) {
				if (isNaN(parseInt(child.name))) {
					continue;
				}
				child.evaluateName = expr + "[" + idx + "]";
				child.name = String(idx);
				nodes.push(child);
				idx++;
			}
			return nodes;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				// this.trackErrors(ex, type, "userDefEdges");
				console.error("getUserDefNodes Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async getUserDefEdges(variable: Variable, rootVariable: Variable
	): Promise<Variable[] | undefined> {
		try {
			let expr = variable.evaluateName;
			expr = "Extractor.get_edges(" + expr + "," + rootVariable.name + ")";
			const edgesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (edgesListVar.type.endsWith('Exception')) {
				throw new Error(edgesListVar.result);
			}
			if (edgesListVar.result === 'None') {
				return undefined;
			}
			if (edgesListVar.variablesReference == 0) {
				return [];
			}
			const children = await this.getVariables(edgesListVar.variablesReference);
			const edges = [];
			let idx = 0;
			for (const child of children) {
				if (isNaN(parseInt(child.name))) {
					continue;
				}
				child.evaluateName = expr + "[" + idx + "]";
				child.name = String(idx);
				edges.push(child);
				idx++;
			}
			return edges;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				// this.trackErrors(ex, type, "getUserDefEdges");
				console.error("getUserDefEdges Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}


	public async getUserDefPlot(variable: Variable,
		rootVariable: Variable,
		layout: string
	): Promise<number[][] | undefined> {
		try {
			let expr = variable.evaluateName;
			const method = layout === "plotpoints" ? "get_plot_points" : "get_plot_lines";
			expr = "Extractor." + method + "(" + expr + "," + rootVariable.name + ")";
			const plotListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (plotListVar.type.endsWith('Exception')) {
				throw new Error(plotListVar.result);
			}
			if (plotListVar.result === 'None') {
				return undefined;
			}
			if (plotListVar.variablesReference == 0) {
				return [];
			}
			const children = await this.getVariables(plotListVar.variablesReference);
			const els: number[][] = [];
			let idx = 0;
			for (const child of children) {
				if (isNaN(parseInt(child.name))) {
					continue;
				}
				let gels: number[] = [];
				let gchildren = await this.getVariables(child.variablesReference);
				for (const gchild of gchildren) {
					if (isNaN(parseInt(gchild.name))) {
						continue;
					}
					gels.push(parseInt(gchild.value));
				}
				els.push(gels);
				idx++;
			}
			return els;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				// this.trackErrors(ex, type, "getUserDefPlot");
				console.error("getUserDefPlot Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async getArray2DRepr(variable: Variable): Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			const expr = `chr(10).join(map(lambda elRepr: '|-|'.join(map(str, elRepr if elRepr else [])), ${name} if ${name} else []))`;
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const arr2D: string[][] = [];
			const lines = content.split('\\n');
			for (let i = 0; i < lines.length; i++) {
				const row: string[] = [];
				const parts = lines[i].split("|-|");
				for (let j = 0; j < parts.length; j++) {
					row.push(parts[j]);
				}
				arr2D.push(row);
			}
			return arr2D;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getArray2DRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getArrayRepr(variable: Variable): Promise<string[] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			const expr = `'|-|'.join(map(str, ${name}))`;
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const arr: string[] = [];
			const parts = content.split('|-|');
			for (let i = 0; i < parts.length; i++) {
				arr.push(parts[i]);
			}
			return arr;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getArrayRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getQueueRepr(variable: Variable): Promise<string[] | undefined> {
		try {
			const name = variable.evaluateName;
			const expr = `'|-|'.join(map(str, ${name}.queue))`;
			const queueRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = queueRepr.result.substring(1, queueRepr.result.length - 1);
			const arr: string[] = [];
			const parts = content.split('|-|');
			// eslint-disable-next-line @typescript-eslint/prefer-for-of
			for (let i = 0; i < parts.length; i++) {
				arr.push(parts[i]);
			}
			return arr;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getQueueRepr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async getMapRepr(variable: Variable): Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			let expr = `chr(10).join(map(lambda xRepr: str(xRepr[0]) 
				+ '|-|' 
				+ (','.join(map(str,xRepr[1])) if isinstance(xRepr[1], list) else str(xRepr[1])), ${name}.items()))`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const entries: string[][] = [];
			const lines = content.split('\\n');
			for (let i = 0; i < lines.length; i++) {
				const parts = lines[i].split('|-|');
				entries.push(parts);
			}
			return entries;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getMapRepr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async expandVariables(variables: Variable[]): Promise<Variable[]> {
		const expVariables: Variable[] = [];
		for (const variable of variables) {
			if (variable.name === 'self') {
				const childVariables = await this.getVariables(variable.variablesReference, "named");
				for (const child of childVariables) {
					if (child.name === 'Class has no fields') {
						continue;
					}
					child.name = child.evaluateName;
					expVariables.push(child);
				}
			}
		}
		variables = variables.concat(expVariables);
		return variables;
	}

	public async getNodeId(variable: Variable): Promise<string> {
		try {
			const name = variable.evaluateName;
			let expr = `id(${name})`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const currNodeId = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = "0x" + Number(currNodeId.result).toString(16).toUpperCase()
			return content;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getCurrentNodeId  of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return "";
	}

	public filterVariable(variable: Variable) {
		if (PythonReader.excludeVariableNames.has(variable.name)) {
			return true;
		}
		if (PythonReader.excludeVariableTypes.has(variable.type)) {
			return true;
		}
		if (variable.name === undefined) {
			return true;
		}
		// exclude built-in variables
		if (variable.name.startsWith("__") && variable.name.endsWith("__")) {
			return true;
		}
		if (variable.name.endsWith("()")) {
			return true;
		}
		if (variable.name.startsWith("(return)")) {
			return true;
		}
		return false;
	}

	public isList(type: string): boolean {
		return type.startsWith('list');
	}

	public isArray(type: string): boolean {
		return type.endsWith('array');
	}

	public isLinkedList(type: string): boolean {
		return type.endsWith('LinkedList');
	}

	public isIterable(type: string): boolean {
		return this.isList(type)
			|| this.isArray(type)
			|| this.isLinkedList(type)
			|| this.isSet(type);
	}

	public isSet(type: string): boolean {
		return type.endsWith('set');
	}

	public async getNodeType(variable: Variable): Promise<string> {
		let type = variable.type;
		if (variable.type === "bytearray") {
			type += "[]";
		} else if (variable.type === "list") {
			if (variable.value.startsWith("[[[")) {
				type += "[][][]";
			} else if (variable.value.startsWith("[[")) {
				type += "[][]";
			} else if (variable.value.startsWith("[")) {
				type += "[]";
			}
		} else {
			if (variable.type === "ndarray") {
				if (variable.value.startsWith("array([[[")) {
					type += "[][][]";
				} else if (variable.value.startsWith("array([[")) {
					type += "[][]";
				} else if (variable.value.startsWith("array([")) {
					type += "[]";
				}
			}
		}
		return type;
	}

	public getDefaultLayout(type: string, value: string): string | undefined {
		if (type.endsWith('[][][]')) {
			return "graph";
		} else if (type.endsWith('[][]')) {
			return "array2D";
		} else if (type.endsWith('[]')) {
			return "array";
		} else if (type.toLowerCase().includes('linkedlist')) {
			return "linkedlist";
		} else if (type.toLowerCase().includes('list')) {
			return "array";
		} else if (type.toLowerCase().includes('dict')) {
			return "map";
		} else if (type.toLowerCase().includes('set')) {
			return "set";
		} else if (type.toLowerCase().includes('queue')) {
			return "queue";
		} else if (type.toLowerCase().includes('stack')) {
			return "stack";
		} else if (type.toLowerCase().includes('tree')) {
			return "tree";
		} else if (type.toLowerCase().includes('graph')) {
			return "graph";
		}
	}

	public hasChildren(ch: Variable): boolean {
		return this.isList(ch.type) || this.isArray(ch.type);
	}

	public getRegisterMethod() {
		return "Extractor.register_types()";
	}
}