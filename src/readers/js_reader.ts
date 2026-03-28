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

export class JsReader extends Reader {
	private static NODE_ID_LENGTH = 4;
	private static excludeVariableTypes = new Set([""]);
	constructor() {
		super();
	}

	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		let exprName = variable.evaluateName;
		// extractor toString
		if (this.registeredTypes.has(variable.type)) {
			try {
				const expr = "Extractor.toString(" + exprName + ")";
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

		// object toString()
		try {
			const expr = exprName + ".toString()";
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			return result.result;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getVariableStrRepr2 Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}

		// if the field is private we try it's getter
		if (!variable.evaluateName.includes('%s') && variable.evaluateName.includes(".")) {
			const index = variable.evaluateName.indexOf(".");
			if (index >= 0) {
				const parent = variable.evaluateName.substring(0, index);
				const field = variable.evaluateName.substring(index + 1, index + 2).toUpperCase()
					+ variable.evaluateName.substring(index + 2);
				const getterName = parent + ".get" + field + "()";
				try {
					const result = await debug.activeDebugSession?.
						customRequest("evaluate", {
							expression: getterName + ".toString()",
							frameId: (debug.activeStackItem as DebugStackFrame).frameId,
							context: 'repl',
						});
					return result.result;
				} catch (ex: Error | unknown) {
					if (ex instanceof Error) {
						console.error("getVariableStrRepr3 Error: " + variable.evaluateName + ": " + ex.message);
					} else {
						console.error(ex);
					}
				}
			}
		}
	}

	public async getUserDefNodes(variable: Variable, rootVariable: Variable
	): Promise<Variable[] | undefined> {
		try {
			let expr = variable.evaluateName;
			expr = "Extractor.getNodes(" + expr + "," + rootVariable.name + ")";
			const nodesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (nodesListVar.type.endsWith('Exception')) {
				throw new Error(nodesListVar.result);
			}
			if (nodesListVar.result === 'null') {
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
			expr = "Extractor.getEdges(" + expr + "," + rootVariable.name + ")";
			const edgesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (edgesListVar.type.endsWith('Exception')) {
				throw new Error(edgesListVar.result);
			}
			if (edgesListVar.result === 'null') {
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
				// this.trackErrors(ex, type, "userDefEdges");
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
			const method = layout === "plotpoints" ? "getPlotPoints" : "getPlotLines";
			expr = "Extractor." + method + "(" + expr + "," + rootVariable.name + ")";
			const plotListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (plotListVar.type.endsWith('Exception')) {
				throw new Error(plotListVar.result);
			}
			if (plotListVar.result === 'null') {
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

	public async getEdgeValues(variable: Variable, property: string): Promise<string[] | undefined> {
		try {
			const edgeValues: string[] = [];
			let exprName = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			let expr = `{
			let edgeRepr = "";
			for(let edgeObjRepr of ${exprName}.${property}) {
				if(edgeRepr.length > 0)
					edgeRepr += "|-|";
				edgeRepr += String(edgeObjRepr);
			}
			edgeRepr;
			}`;
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

	public async getArrayRepr(variable: Variable):
		Promise<string[] | undefined> {

		try {
			const name = variable.evaluateName;
			let expr = `{
				let arrRepr = "";
				let varRepr = ${name};
				for(const elRepr of varRepr) {
					arrRepr += String(elRepr);
					arrRepr += "|-|";
				}
				arrRepr.toString();
				}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const arr: string[] = [];
			const parts = content.split('|-|');
			for (let i = 0; i < parts.length - 1; i++) {
				arr.push(parts[i]);
			}
			return arr;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getArray2DRepr(variable: Variable):
		Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			let expr = `{
				let arr2DRepr = "";
				let varRepr = ${name};
				for(let idxRepr = 0; idxRepr < varRepr.length; idxRepr++) {
					if(varRepr[idxRepr]) {
						for(let idx2Repr = 0; idx2Repr < varRepr[idxRepr].length; idx2Repr++) {
							arr2DRepr += String(varRepr[idxRepr][idx2Repr]);
							arr2DRepr += "|-|";
						}
					}
					arr2DRepr += String.fromCodePoint(10);
				}
				arr2DRepr.toString();
				}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const arr2D: string[][] = [];
			const lines = content.split('\n');
			for (let i = 0; i < lines.length - 1; i++) {
				const row: string[] = [];
				const parts = lines[i].split("|-|");
				for (let j = 0; j < parts.length - 1; j++) {
					row.push(parts[j]);
				}
				arr2D.push(row);
			}
			return arr2D;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getArrayRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getMapRepr(variable: Variable): Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			let expr = `{
let mapRepr = "";
for(const [kRepr,vRepr] of ${name}) {
	mapRepr += kRepr;
	mapRepr += "|-|";
	mapRepr += vRepr;
	mapRepr += String.fromCodePoint(10);
}
mapRepr;
}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const entries: string[][] = [];
			const lines = content.split('\n');
			for (let i = 0; i < lines.length - 1; i++) {
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

	public filterVariable(variable: Variable) {
		if (JsReader.excludeVariableTypes.has(variable.type)) {
			return true;
		}
		// exclude built-in variables
		if (variable.name === undefined
			|| variable.name === "__dirname"
			|| variable.name === "__filename"
			|| variable.name === "module"
			|| variable.name === "require"
			|| variable.name === "exports"
			|| (variable.name.includes("VSID")
				&& variable.presentationHint 
				&& variable.presentationHint.visibility === "internal")
			|| variable.name.includes("[[Prototype]]")
			|| variable.name.includes("[[Scopes]]")
			|| variable.name.includes("[[FunctionLocation]]")
			|| (variable.value.startsWith("f ")
				&& variable.value.endsWith(")"))
			|| variable.value === "undefined"
		) {
			return true;
		}
		return false;
	}

	public async expandVariables(variables: Variable[]): Promise<Variable[]> {
		const expVariables: Variable[] = [];
		for (const variable of variables) {
			if (variable.name === 'this') {
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

	public async getCurrentNodeId(variable: Variable):
		Promise<string | undefined> {

		try {
			const name = variable.evaluateName;
			let expr = `${name}.VSID`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const currNodeId = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (currNodeId.result === "undefined") {
				return undefined;
			}
			const content = currNodeId.result.substring(1, currNodeId.result.length - 1);
			return content;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getCurrentNodeId  of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getNodeId(variable: Variable): Promise<string> {
		let id: string | undefined = variable.value;
		id = await this.getCurrentNodeId(variable);
		if (!id) {
			id = await this.generateNodeId(variable);
			await this.setNodeId(variable, id);
		}
		return id;
	}

	public async generateNodeId(variable: Variable): Promise<string> {
		let bytes = new Uint8Array(JsReader.NODE_ID_LENGTH);
		crypto.getRandomValues(bytes);
		return "0x" + this.toHex(bytes);
	}

	toHex(data: Uint8Array): string {
		let hexString = "";
		for (let i = 0; i < data.length; i++) {
			hexString += data[i].toString(16).padStart(2, "0");
		}
		return hexString;
	}

	public async setNodeId(variable: Variable, vsID: string):
		Promise<void> {
		try {
			const name = variable.evaluateName;
			let expr = `{
			Object.defineProperty(${name}, "VSID", 
				{enumerable: false, writable: true});
			${name}.VSID = "${vsID}";
			}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: setNodeId " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public isList(type: string): boolean {
		return type === 'Array' || type.endsWith('[]');
	}

	public isArray(type: string): boolean {
		return type === 'Array' || type.endsWith('[]');
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
		return type.endsWith('Set');
	}

	public async getNodeType(variable: Variable): Promise<string> {
		let type = variable.type;

		if (variable.type === 'Array' && variable.value.includes("Array")) {
			const is3D = await this.isArray3D(variable);
			if (is3D) {
				type += "[][][]";
			} else {
				type += "[][]";
			}
		} else if (type === "Array") {
			type += "[]";
		}
		return type;
	}

	async isArray3D(variable: Variable): Promise<boolean> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			let expr = `{
				let varRepr = ${name};
				let found = false;
				for(let idxRepr = 0; idxRepr < varRepr.length; idxRepr++) {
					if(varRepr[idxRepr]) {
						for(let idx2Repr = 0; idx2Repr < varRepr[idxRepr].length; idx2Repr++) {
							if(varRepr[idxRepr][idx2Repr] instanceof Array) {
								found = true;
								break;
							}
						}
					}
					if(found)
						break;
				}
				found;
				}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			return arrRepr.result === "true";
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getArrayRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return false;
	}

	public getDefaultLayout(type: string, value: string): string | undefined {
		if (type.endsWith('[][][]')) {
			return "array3D";
		} else if (type.endsWith('[][]')) {
			return "array2D";
		} else if (type.endsWith('[]')) {
			return "array";
		} else if (type.endsWith('LinkedList')) {
			return "linkedlist";
		} else if (type.endsWith('Map')) {
			return "map";
		} else if (type.endsWith('Set')) {
			return "set";
		} else if (type.endsWith('Queue')) {
			return "queue";
		} else if (type.endsWith('Stack')) {
			return "stack";
		} else if (type.endsWith('Tree')) {
			return "tree";
		} else if (type.endsWith('Graph')) {
			return "graph";
		}
	}

	public hasChildren(ch: Variable): boolean {
		return ch.value.startsWith("(")
			&& ch.value.endsWith("]");
	}

	public getRegisterMethod() {
		return "Extractor.registerTypes()";
	}
}
