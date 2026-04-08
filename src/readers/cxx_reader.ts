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

export class CxxReader extends Reader {
	private static excludeVariableTypes = new Set([
		"object", "object[]"
	]);
	constructor() {
		super();
	}

	public filterVariable(variable: Variable): boolean {
		if (CxxReader.excludeVariableTypes.has(variable.type)) {
			return true;
		}
		// exclude built-in variables
		if (variable.name === "null"
			|| variable.value === "null"
			|| variable.name === "[allocator]"
			|| variable.name === "[comparator]"
			|| variable.name === "[Raw View]"
			|| variable.name === "[Raw"
			|| variable.name === "[hash_function]"
			|| variable.name === "[key_eq]"
			|| !variable.type) {
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
		} else {
			try {
				const name = variable.evaluateName;
				let expr = `(long long) &${name}`;
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
		}
		return id;
	}

	public async getNodeType(variable: Variable): Promise<string> {
		let type = variable.type;
		// remove long types
		const removeTypes: string[] = [",std::allocator", ",std::hash", ",std::equal_to"];
		let ridx = 0;
		while (ridx < removeTypes.length) {
			const idx = type.indexOf(removeTypes[ridx]);
			if (idx == -1) {
				ridx++;
				continue;
			}
			let found = false;
			let angleBraces = 0;
			let i = idx + removeTypes[ridx].length;
			while (true) {
				if (type[i] == '<') {
					angleBraces++;
					found = true;
				}
				else if (type[i] == '>') {
					angleBraces--;
					found = true;
				}
				if (angleBraces == 0 && found)
					break;
				i++;
			}
			type = type.substring(0, idx) + type.substring(i + 1);
		}
		return type;
	}

	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		const exprName = variable.evaluateName;
		try {
			const strMethod = "to_string()";
			const accessOperator = variable.type.endsWith("*") ? "->" : ".";
			const expr = `(${exprName})${accessOperator}${strMethod}`;
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (result.type === undefined || (result.result.startsWith('error '))
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
			let expr = ""; //`string.Join("|-|",System.Linq.Enumerable.Select(${exprName}.${property}, (xRepr)=>xRepr!=null?xRepr.ToString():"null"));`;
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
			let expr = `${name}`;
			if (variable.ranges.length > 0)
				expr = `&(${expr})[${variable.ranges[0].start}],${variable.ranges[0].length}`;
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
			const children = await this.getVariables(arrRepr);
			const arr: string[] = [];
			for (const child of children) {
				arr.push(child.value);
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
			let expr = `${name}`;
			if (variable.ranges.length > 0)
				expr = `&(${expr})[${variable.ranges[1].start}],${variable.ranges[1].length}`;
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
			const arrRepr = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			const children = await this.getVariables(arrRepr);
			const arr2D: string[][] = [];
			for (let child of children) {
				// assign the child length, ragged arrays are not supported
				if (variable.ranges !== undefined) {
					const childExpr = `&(${child.evaluateName})[${variable.ranges[0].start}],${variable.ranges[0].length}`;
					const childVar = await this.getVariable(childExpr);
					if (childVar)
						child = childVar;
				}
				const gChildren = await this.getVariables(child);
				const row: string[] = [];
				for (const gChild of gChildren) {
					if (gChild.presentationHint?.attributes?.includes("failedEvaluation"))
						row.push("");
					else
						row.push(gChild.value);
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

	public async getArray3DRepr(variable: Variable):
		Promise<string[][][] | undefined> {
		const name = variable.evaluateName;
		let expr = `${name}`;
		if (variable.ranges.length > 0)
			expr = `&(${expr})[${variable.ranges[2].start}],${variable.ranges[2].length}`;
		expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');
		const arr3DRepr = await debug.activeDebugSession?.customRequest("evaluate", {
			expression: expr,
			frameId: (debug.activeStackItem as DebugStackFrame).frameId,
			context: 'repl',
		});

		const childrenVars = await this.getVariables(arr3DRepr);
		const children: string[][][] = [];
		for (const childVar of childrenVars) {
			if (!this.isIndexed(childVar, variable)) {
				continue;
			}
			if (this.filterVariable(childVar)) {
				continue;
			}
			childVar.ranges = variable.ranges.slice(0, 2);
			const array2Drepr = await this.getArray2DRepr(childVar);
			if (array2Drepr)
				children.push(array2Drepr);
		}
		return children;
	}

	public async getQueueRepr(variable: Variable): Promise<string[] | undefined> {
		try {
			let name = variable.evaluateName;
			let expr = ""; //`string.Join("|-|",System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr!=null?xRepr.ToString():"null"))`;
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
			let expr = ""; //`string.Join((char) 10,System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr.Key.ToString() + "|-|" + xRepr.Value.ToString()));`;
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
			let expr = ""; //`System.Linq.Enumerable.Select(${name}, (xRepr)=>xRepr!=null?xRepr.ToString():"null")`;
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
					child.name = child.evaluateName;
					expVariables.push(child);
				}
			}
		}
		variables = variables.concat(expVariables);
		return variables;
	}

	public isList(type: string): boolean {
		return type.startsWith('vector');
	}

	public isArray(type: string): boolean {
		return type.endsWith(']');
	}

	public isLinkedList(type: string): boolean {
		return type.startsWith('list');
	}

	public isIterable(type: string): boolean {
		return this.isList(type)
			|| this.isArray(type)
			|| this.isLinkedList(type)
			|| this.isSet(type);
	}

	public isSet(type: string): boolean {
		return type.startsWith('set');
	}

	public isMap(type: string): boolean {
		return type.startsWith('std::map')
			|| type.startsWith('std::unordered_map');
	}

	public isPair(type: string): boolean {
		return type.startsWith('std::pair');
	}


	getRawType(variable: Variable) {
		const idx = variable.type.indexOf("[");
		const rawType = variable.type.substring(0, idx);
		return rawType;
	}

	public getDefaultLayout(type: string, _value: string): string | undefined {
		if (type.match(new RegExp(".+\\[\\d+\\]\\[\\d+\\]\\[\\d+\\]"))) {
			return "array3D";
		} else if (type.match(new RegExp(".+\\[\\d+\\]\\[\\d+\\]"))) {
			return "array2D";
		} else if (type.match(new RegExp(".+\\[\\d+\\]"))) {
			return "array";
		} else if (type.includes('map')) {
			return "map";
		} else if (type.includes('set')) {
			return "set";
		} else if (type.includes('queue')) {
			return "queue";
		} else if (type.includes('stack')) {
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
		return "extractorRegisterAttrs()";
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
		if (this.isMap(parent.type) && this.isPair(variable.type))
			return true;
		return super.isIndexed(variable, parent);
	}

	public async registerTypes() {
		if (this.registered) {
			return;
		}
		try {
			const expr = this.getRegisterMethod();
			const mapsSize: Variable | undefined = await this.getVariable(`(${expr}).size`);
			if (!mapsSize)
				return;
			const size = parseInt(mapsSize.value);
			for (let i = 0; i < size; i++) {
				const mapVariable: Variable | undefined = await this.getVariable(`(${this.getRegisterMethod()}).maps[${i}]`);
				if (!mapVariable)
					continue;
				if (this.filterVariable(mapVariable))
					continue;

				const typeVariable: Variable | undefined = await this.getVariable(`${mapVariable.evaluateName}.type`);
				const attrsVariable: Variable | undefined = await this.getVariable(`${mapVariable.evaluateName}.attrs`);
				const attrsSize: Variable | undefined = await this.getVariable(`${mapVariable.evaluateName}.size`);
				if (!typeVariable || !attrsVariable || !attrsSize)
					continue;
				const attrs: Set<string> = new Set<string>();
				let type = typeVariable.value;
				const idx = type.indexOf(" ");
				if (idx >= 0) {
					type = type.substring(idx + 1);
				}
				type = this.trimQuotes(type);

				const attrSize = parseInt(attrsSize.value);
				for (let j = 0; j < attrSize; j++) {
					const attr: Variable | undefined = await this.getVariable(`${attrsVariable.evaluateName}[${j}]`);
					if (!attr)
						continue;
					if (this.filterVariable(attr))
						continue;
					const attrValue = this.trimQuotes(attr.value.split(" ")[1]);
					attrs.add(attrValue);
				}
				this.registeredTypes.set(type, attrs);
			}
		} catch (error) {
			console.error(error);
		}
		this.registered = true;
	}

	public getExtractCall(variable: Variable, type: string, attr: string, root: Variable): string {
		const exprName = variable.evaluateName;
		const objRef = !type.endsWith("*") ? "&" : "";
		const rootRef = !root.type.endsWith("*") ? "&" : "";
		return `extract("${type}"
				, "${attr}"
				, ${objRef}(${exprName})
				, ${rootRef}(${root.evaluateName})
				)`;
	}

	public async extract(variable: Variable, type: string, attr: string, root: Variable):
		Promise<Variable[] | undefined> {
		const attrs: Set<string> | undefined = this.registeredTypes.get(type);
		if (!attrs)
			return;
		if (!attrs.has(attr))
			return;
		try {
			let expr: string = this.getExtractCall(variable, type, attr, root);
			expr = expr.replaceAll('\n', ' ').replaceAll('\t', ' ');

			const extractSize: Variable | undefined = await this.getVariable(`(${expr}).size`);
			if (!extractSize)
				return;
			if ((extractSize.value.startsWith('error '))
				|| (extractSize.type && extractSize.type.includes('Exception'))) {
				throw new Error(extractSize.value);
			}
			if (extractSize.type === undefined) {
				return undefined;
			}
			if (extractSize.type.endsWith('Exception')) {
				throw new Error(extractSize.value);
			}
			if (extractSize.value === 'null' || extractSize.value === 'undefined') {
				return undefined;
			}
			const size = parseInt(extractSize.value);
			const nodes: Variable[] = [];
			for (let i = 0; i < size; i++) {
				const objExpr = `(${expr}).objects[${i}]`;
				const objectVariable: Variable | undefined = await this.getVariable(`${objExpr}`);
				if (!objectVariable)
					continue;
				if (this.filterVariable(objectVariable))
					continue;
				objectVariable.evaluateName = objExpr;
				objectVariable.name = String(i);
				nodes.push(objectVariable);
			}
			return nodes;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("extractor Error: " + variable.evaluateName
					+ " " + type + " " + attr
					+ ": " + ex);
			} else {
				console.error(ex);
			}
		}
	}
}