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
		let strRepr: string | undefined = undefined;
		try {
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: `str(${variable.evaluateName})`,
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
			const exprName = variable.evaluateName;
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

	public async getArray2DRepr(variable: Variable): Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			const expr = `chr(10).join(map(lambda elRepr: '|-|'.join(map(str, elRepr if elRepr is not None else [])), ${name} if ${name} is not None else []))`;
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
				const childVariables = await this.getVariables(variable, "named");
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
			const content = "0x" + Number(currNodeId.result).toString(16).toUpperCase();
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
		if (variable.name.startsWith("<__main__.")) {
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

	public getDefaultLayout(type: string, _value: string): string | undefined {
		if (type.endsWith('[][][]')) {
			return "array3D";
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
		return "Extractor.register_attrs()";
	}

	public isIndexed(variable: Variable, parent: Variable): boolean {
		const parts = variable.name.split(" ");
		if ((parts[0].startsWith("[") && parts[0].endsWith("]"))
			|| (parts[0].startsWith("'") && parts[0].endsWith("'"))) {
			const val = parts[0].substring(1, parts[0].length - 1);
			const valParts = val.split(":");
			if (valParts.length == 1 && !isNaN(parseInt(valParts[0]))) {
				// val in integral
				return true;
			} else if (valParts.length == 2
				&& !isNaN(parseInt(valParts[0]))
				&& !isNaN(parseInt(valParts[1]))) {
				// val in brackets is a range ie subarray of ndarray 
				return true;
			}
		}
		return super.isIndexed(variable, parent);
	}

	public async getArray3DRepr(variable: Variable):
		Promise<string[][][] | undefined> {
		// for python numpy ndarray we need to convert to list 
		// to properly extract the subarrays
		if (variable.type === 'ndarray') {
			const listVariable = await this.getVariable("list(" + variable.evaluateName + ")");
			if (listVariable) {
				return await super.getArray3DRepr(listVariable);
			}
		}
		return await super.getArray3DRepr(variable);
	}

	public async getExtractCall(variable: Variable, type: string, attr: string, root: Variable): Promise<string> {
		return `Extractor.extract_${attr}(
			${variable.evaluateName},
			${root.evaluateName}
		)`;
	}
}