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

export class JavaReader extends Reader {
	private static excludeVariableTypes = new Set([
		"Class",
	]);
	constructor() {
		super();
	}

	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		let exprName = variable.evaluateName;
		// workaround 
		if (exprName.includes('.get(%s)')) {
			const index = exprName.indexOf('.get(%s)');
			exprName = exprName.substring(0, index) + ").get(" + variable.name + ")";
		}
		const type = variable.type.replaceAll("$", ".");

		// object toString()
		try {
			const expr = `((${type}) ${exprName}).toString()`;
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
				const getterName = `${parent}.get${field}()`;
				try {
					const result = await debug.activeDebugSession?.
						customRequest("evaluate", {
							expression: `${getterName}.toString()`,
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

	public async getEdgeValues(variable: Variable, property: string): Promise<string[] | undefined> {
		try {
			const edgeValues: string[] = [];
			let exprName = variable.evaluateName;
			// workaround 
			if (exprName.includes('.get(%s)')) {
				const index = exprName.indexOf('.get(%s)');
				exprName = exprName.substring(0, index) + ").get(" + variable.name + ")";
			}
			const type = variable.type.replaceAll("$", ".");

			let expr = `
			StringBuilder edgeRepr = new StringBuilder();
			for(Object edgeObjRepr : ((${type}) ${exprName}).${property}) {
				if(edgeRepr.length() > 0)
					edgeRepr.append("|-|");
				edgeRepr.append(String.valueOf(edgeObjRepr));
			}
			return edgeRepr.toString();
			`;
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
		if (this.isArray(variable.type)) {
			return this.getArrRepr(variable);
		} else {
			return this.getListRepr(variable);
		}
	}

	public async getListRepr(variable: Variable):
		Promise<string[] | undefined> {

		try {
			const name = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			let expr = `{
				StringBuilder arrRepr = new StringBuilder();
				${type} varRepr = ((${type}) new java.util.Optional(${name}).get());
				for(Object elRepr : varRepr) {
					arrRepr.append(String.valueOf(elRepr));
					arrRepr.append("|-|");
				}
				return arrRepr.toString();
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
				console.error("getListRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getArrRepr(variable: Variable):
		Promise<string[] | undefined> {

		try {
			const name = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			let expr = `{
				StringBuilder arrRepr = new StringBuilder();
				${type} varRepr = ((${type}) new java.util.Optional(${name}).get());
				for(int idxRepr = 0; idxRepr < varRepr.length; idxRepr++) {
					arrRepr.append(String.valueOf(varRepr[idxRepr]));
					arrRepr.append("|-|");
				}
				return arrRepr.toString();
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
				console.error("getArrRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getArray2DRepr(variable: Variable):
		Promise<string[][] | undefined> {
		if (this.isArray(variable.type)) {
			return this.getArr2DRepr(variable);
		} else {
			return this.getList2DRepr(variable);
		}
	}

	public async getArr2DRepr(variable: Variable):
		Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			const type = variable.type.replaceAll("$", ".");
			let expr = `{
				StringBuilder arr2DRepr = new StringBuilder();
				${type} varRepr = ((${type}) new java.util.Optional(${name}).get());
				for(int idxRepr = 0; idxRepr < varRepr.length; idxRepr++) {
					if(varRepr[idxRepr] != null) {
						for(int idx2Repr = 0; idx2Repr < varRepr[idxRepr].length; idx2Repr++) {
							arr2DRepr.append(String.valueOf(varRepr[idxRepr][idx2Repr]));
							arr2DRepr.append("|-|");
						}
					}
					arr2DRepr.append((char) 10);
				}
				return arr2DRepr.toString();
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

	public async getList2DRepr(variable: Variable):
		Promise<string[][] | undefined> {
		try {
			const name = variable.evaluateName;
			// workaround: DAP complains about types when variable is a member of 
			// an object ie: this.arr so we box into an optional to type cast
			const type = variable.type.replaceAll("$", ".");
			let expr = `{
				StringBuilder arr2DRepr = new StringBuilder();
				${type} varRepr = ((${type}) new java.util.Optional(${name}).get());
				for(Object rowRepr : varRepr) {
					if(rowRepr != null) {
						for(Object elRepr : (java.util.List) rowRepr) {
							arr2DRepr.append(String.valueOf(elRepr));
							arr2DRepr.append("|-|");
						}
					}
					arr2DRepr.append((char) 10);
				}
				return arr2DRepr.toString();
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
				const parts = lines[i].split('|-|');
				for (let j = 0; j < parts.length - 1; j++) {
					row.push(parts[j]);
				}
				arr2D.push(row);
			}
			return arr2D;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("getList2DRepr Error: Array Repr of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return undefined;
	}

	public async getQueueRepr(variable: Variable): Promise<string[] | undefined> {
		try {
			const name = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			const expr = `
			java.util.List<String> queueListRepr = new java.util.ArrayList<>();
            ${type}<Object> queueCloneRepr = new ${type}<>(${name});
            while(queueCloneRepr.size() > 0) {
                queueListRepr.add(String.valueOf(queueCloneRepr.remove()));
        	}
        	String queueRepr = String.join("|-|", queueListRepr);
			return queueRepr;
			`;
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
			let expr = `{
StringBuilder mapRepr = new StringBuilder();
for(java.util.Map.Entry<?,?> mapObjRepr : ${name}.entrySet()) {
	mapRepr.append(mapObjRepr.getKey());
	mapRepr.append("|-|");
	mapRepr.append(mapObjRepr.getValue());
	mapRepr.append((char) 10);
}
return mapRepr.toString();
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

	public async getQueueNodes(variable: Variable): Promise<Variable[] | undefined> {
		try {
			const name = variable.evaluateName;
			const type = variable.type.replaceAll("$", ".");
			const expr = `
			java.util.List<Object> queueListRepr = new java.util.ArrayList<>();
            ${type}<Object> queueCloneRepr = new ${type}<>(${name});
            while(queueCloneRepr.size() > 0) {
                queueListRepr.add(queueCloneRepr.remove());
        	}
        	return queueListRepr;
			`;
			const queueNodesList = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
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

	public filterVariable(variable: Variable): boolean {
		if (JavaReader.excludeVariableTypes.has(variable.type)) {
			return true;
		}
		// exclude built-in variables
		if (variable.type.startsWith("Class$")
			|| variable.type.startsWith("ClassLoaders$")
			|| variable.type.startsWith("ImmutableCollections$")
			|| variable.type.endsWith("Exception")
			|| variable.type === "null"
			|| variable.type.startsWith("⎯►")
			|| variable.type.endsWith("()")) {
			return true;
		}
		return false;
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

	public async getNodeId(variable: Variable): Promise<string> {
		try {
			const name = variable.evaluateName;
			let expr = `System.identityHashCode(${name})`;
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
				console.error("Error: getNodeId  of " + variable + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
		return "";
	}
	
	public async getNodeType(variable: Variable): Promise<string> {
		const type = variable.type.replaceAll("$",".");
		return type;
	}


	public isList(type: string): boolean {
		return type.endsWith('List');
	}

	public isArray(type: string): boolean {
		return type.endsWith('[]');
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
		return type.endsWith('HashSet');
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
		} else if (type.endsWith('LinkedList')) {
			return "linkedlist";
		} else if (type.endsWith('List')) {
			return "array";
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

	public getRegisterMethod() {
		return "Extractor.registerAttrs()";
	}

	public hasChildren(ch: Variable): boolean {
		return ch.value.includes(" size=");
	}

	public async getExtractCall(variable: Variable, type: string, attr: string, root: Variable): Promise<string> {
		const exprName = variable.evaluateName;
		return `Extractor.extract("${type}"
				, "${attr}"
				, ${exprName}
				, ${root.evaluateName}
				)`;
	}
}
