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

export class CsReader extends Reader {
	private static excludeVariableTypes = new Set([
		"object", "object[]"
	]);
	constructor() {
		super();
	}

	public filterVariable(variable: Variable): boolean {
		if (CsReader.excludeVariableTypes.has(variable.type)) {
			return true;
		}
		// exclude built-in variables
		if (variable.name === "null"
			|| variable.value === "null"
			|| variable.name === "Raw View"
			|| !variable.type
			|| variable.type.includes("DebugViewDictionaryItem")
			|| variable.type.endsWith("Exception")) {
			return true;
		}
		return false;
	}

	public processVariable(variable: Variable): Variable {
		if (variable.name.includes(" ")) {
			variable.name = variable.name.split(" ")[0];
		}
		return variable;
	}

	public async getNodeId(variable: Variable): Promise<string> {
		let id = variable.value;
		if (variable.memoryReference) {
			id = variable.memoryReference;
		}
		return id;
	}

	public getVarNodeId(variable: Variable) {
		let id = variable.name;
		if (id.includes(" ")) {
			id = id.split(" ")[0];
		}
		return id;
	}

	public async getNodeType(variable: Variable): Promise<string> {
		let type = variable.type;
		if (type.startsWith("object {") && type.endsWith("}")) {
			type = type.split(" ")[1];
			type = type.substring(1,type.length-1);
		}
		return type;
	}

	public async getNodeName(variable: Variable): Promise<string> {
		let name = variable.name;
		if (name.startsWith("[") && name.endsWith("]"))
			name = name.substring(1, name.length - 1);
		return name;
	}

	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		const exprName = variable.evaluateName;
		const type = (await this.getNodeType(variable));

		try {
			const expr = `((${type}) ${exprName}).ToString()`;
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((result.result.startsWith('error '))
				|| (result.type && result.type.includes('Exception'))) {
				throw new Error(result.result);
			}
			return result.result;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getVariableStrRepr2 Error: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async getEdgeValues(variable: Variable, property: string): Promise<string[] | undefined> {
		try {
			const edgeValues: string[] = [];
			const exprName = variable.evaluateName;
			let expr = `string.Join("|-|",System.Linq.Enumerable.Select(${exprName}.${property}, (xRepr)=>xRepr!=null?xRepr.ToString():"null"));`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const edgesListVar = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((edgesListVar.result.startsWith('error '))
				|| (edgesListVar.type && edgesListVar.type.endsWith('Exception'))) {
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
			let expr = `string.Join("|-|",System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr!=null?xRepr.ToString():"null"));`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((arrRepr.result.startsWith('error '))
				|| (arrRepr.type && arrRepr.type.includes('Exception'))) {
				throw new Error(arrRepr.result);
			}
			const content = arrRepr.result.substring(1, arrRepr.result.length - 1);
			const arr: string[] = [];
			const parts = content.split('|-|');
			for (let i = 0; i < parts.length; i++) {
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
			let expr = `string.Join((char) 10,System.Linq.Enumerable.Select(${name}, 
            (xRepr)=> xRepr!=null?string.Join("|-|",System.Linq.Enumerable.Select(xRepr, (yRepr)=>yRepr!=null?yRepr.ToString():"null")):new string((char) 10,1)));`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
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
				console.error("getArrayRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getQueueRepr(variable: Variable): Promise<string[] | undefined> {
		try {
			let name = variable.evaluateName;
			let expr = `string.Join("|-|",System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr!=null?xRepr.ToString():"null"))`;
			let queueRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((queueRepr.result.startsWith('error '))
				|| (queueRepr.type && queueRepr.type.includes('Exception'))) {
				if (variable.type.includes("PriorityQueue")) {
					name += ".UnorderedItems";
					expr = `string.Join("|-|", System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr).OrderBy((xRepr1)=>xRepr1.Item2).ToList())`;
					queueRepr = await debug.activeDebugSession?.customRequest("evaluate", {
						expression: expr,
						frameId: (debug.activeStackItem as DebugStackFrame).frameId,
						context: 'repl',
					});
				}
			}

			if ((queueRepr.result.startsWith('error '))
				|| (queueRepr.type && queueRepr.type.includes('Exception'))) {
				throw new Error(queueRepr.result);
			}
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
			let expr = `string.Join((char) 10,System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr.Key.ToString() + "|-|" + xRepr.Value.ToString()));`;
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

	public async getQueueNodes(variable: Variable): Promise<Variable[] | undefined> {
		try {
			let name = variable.evaluateName;
			let expr = `System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr!=null?xRepr.ToString():"null")`;
			let queueNodesList = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((queueNodesList.result.startsWith('error '))
				|| (queueNodesList.type && queueNodesList.type.includes('Exception'))) {
				if (variable.type.includes("PriorityQueue")) {
					name += ".UnorderedItems";
					expr = `System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr).OrderBy((xRepr1)=>xRepr1.Item2).ToList()`;
					queueNodesList = await debug.activeDebugSession?.customRequest("evaluate", {
						expression: expr,
						frameId: (debug.activeStackItem as DebugStackFrame).frameId,
						context: 'repl',
					});
				}
			}
			const nodes = await this.getVariables(queueNodesList);
			return nodes;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getQueueNodes of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public async expandVariables(variables: Variable[]): Promise<Variable[]> {
		const expVariables: Variable[] = [];
		for (const variable of variables) {
			if (variable.name === 'this') {
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

	public isList(type: string): boolean {
		return type.startsWith('System.Collections.Generic.IList')
			|| type.startsWith('System.Collections.Generic.List');
	}

	public isArray(type: string): boolean {
		return type.endsWith(']');
	}

	public isLinkedList(type: string): boolean {
		return type.startsWith('System.Collections.Generic.LinkedList');
	}

	public isIterable(type: string): boolean {
		return this.isList(type)
			|| this.isArray(type)
			|| this.isLinkedList(type)
			|| this.isSet(type);
	}

	public isSet(type: string): boolean {
		return type.startsWith('System.Collections.Generic.HashSet');
	}

	getRawType(variable: Variable) {
		const idx = variable.type.indexOf("[");
		const rawType = variable.type.substring(0, idx);
		return rawType;
	}

	public getDefaultLayout(type: string, _value: string): string | undefined {
		if (type.endsWith('[][][]')) {
			return "array3D";
		} else if (type.endsWith('[][]')) {
			return "array2D";
		} else if (type.endsWith('[]')) {
			return "array";
		} else if (type.includes('Dictionary')) {
			return "map";
		} else if (type.includes('Set')) {
			return "set";
		} else if (type.includes('Queue')) {
			return "queue";
		} else if (type.includes('Stack')) {
			return "stack";
		} else if (type.includes('Tree')) {
			return "tree";
		} else if (type.includes('Graph')) {
			return "graph";
		} else if (type.includes('LinkedList')) {
			return "linkedlist";
		} else if (type.includes('List')) {
			return "array";
		}
	}

	public getRegisterMethod() {
		return "Extractor.RegisterAttrs()";
	}

	public hasChildren(ch: Variable): boolean {
		return ch.value.includes("Count = ");
	}

	public isIndexed(variable: Variable, parent: Variable): boolean {
		const parts = variable.name.split(" ");
		if (parts.length > 0 && parts[0].startsWith("[")
			&& parts[0].endsWith("]")) {
			if (!isNaN(parseInt(parts[0].substring(1, parts[0].length - 1)))) {
				return true;
			}
		}
		return super.isIndexed(variable, parent);
	}

	public getExtractCall(variable: Variable, type: string, attr: string, root: Variable): string {
		const exprName = variable.evaluateName;
		return `Extractor.Extract("${type}"
				, "${attr}"
				, ${exprName}
				, ${root.evaluateName}
				)`;
	}
}
