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

import { debug, DebugSession, DebugThread, DebugStackFrame } from "vscode";
import * as fs from 'fs';

export class Reader {
	protected erroredTypes: Set<string> = new Set<string>();
	protected registeredTypes: Map<string, Set<string>> = new Map<string, Set<string>>();
	protected registered = false;
	protected static instance?: Reader;
	protected static cachedSourceLines: Map<string, string[]> = new Map<string, string[]>();

	constructor() {
		Reader.instance = this;
	}

	static initialize(onDebugSessionStarted: () => void,
		onChangedStackFrame: (source: string[], start: number, end: number) => void) {
		debug.onDidStartDebugSession(async (session: DebugSession) => {
			console.log("started session: " + session.type);
			await onDebugSessionStarted();
		});
		debug.onDidChangeActiveStackItem(async (e: DebugThread | DebugStackFrame | undefined) => {
			if (e instanceof DebugThread) {
				return;
			}
			console.log("stack item changed: " + e?.session.type);
			console.log("threadId: " + e?.threadId);
			let threadId = e?.threadId ?? 0;
			if (debug.activeStackItem?.threadId) {
				threadId = debug.activeStackItem?.threadId;
			}

			const stackTrace = await Reader.instance?.getStackTrace(threadId);
			const sourceLines: string[] = await this.getSourceLines(stackTrace!);
			const source: string[] = [];
			let sourceStart = 0;
			let sourceEnd = 0;
			if (stackTrace?.stackFrames[0].line) {
				let start = stackTrace?.stackFrames[0].line;
				let end = stackTrace?.stackFrames[0].endLine ?? start;
				start--; // lines start at 1
				end--; // lines start at 1
				for (let i = Math.max(0, start - 2);
					i <= Math.min(end + 2, sourceLines.length - 1);
					i++) {
					if (i >= 0 && i < sourceLines.length) {
						if (i == start) {
							sourceStart = source.length;
						}
						if (i == end) {
							sourceEnd = source.length;
						}
						source.push((i + 1) + ": " + sourceLines[i]);
					}
				}
			}
			const frameId = (e as DebugStackFrame).frameId;
			console.log("frameId: " + frameId);
			await onChangedStackFrame(source, sourceStart, sourceEnd);
		});
	}

	static async getSourceLines(stackTrace: StackTrace): Promise<string[]> {
		let lines: string[] | undefined;
		const source = stackTrace?.stackFrames[0].source;
		if (source && source.path) {
			lines = Reader.cachedSourceLines.get(source.path);
			if (lines)
				return lines;
			const content = Reader.instance?.getSource(source.path);
			if (content) {
				lines = content.split(new RegExp("\\r\\n|\\n"));
				Reader.cachedSourceLines.set(source.path, lines);
			}
		}
		return lines ?? [];
	}

	async registerTypes() {
		if (this.registered) {
			return;
		}
		try {
			const expr = this.getRegisterMethod();
			const regTypes = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (!regTypes) {
				return;
			}
			if (regTypes.type && regTypes.type.endsWith('Exception')) {
				throw new Error(regTypes.result);
			}
			await this.parseRegisteredTypes(regTypes);
		} catch (error) {
			console.error(error);
		}
		this.registered = true;
	}
	
	async parseRegisteredTypes(regTypes: Variable) {
		if (regTypes.variablesReference > 0) {
			const regTypeValues = await this.getVariables(regTypes, "indexed");
			for (const regTypeValue of regTypeValues) {
				if (this.filterVariable(regTypeValue))
					continue;
				const children: Variable[] = await this.getVariables(regTypeValue, "indexed");
				const parts: Variable[] = [];
				for (const child of children) {
					if (this.filterVariable(child))
						continue;
					parts.push(child);
					if (parts.length == 2)
						break;
				}
				if (parts.length != 2)
					continue;
				const attrs: Set<string> = new Set<string>();
				const type = this.trimQuotes(parts[0].value);
				const attrChildren: Variable[] = await this.getVariables(parts[1], "indexed");
				for (const attr of attrChildren) {
					if (this.filterVariable(attr))
						continue;
					if (!this.isIndexed(attr, regTypeValue))
						continue;
					const attrValue = this.trimQuotes(attr.value);
					attrs.add(attrValue);
				}
				this.registeredTypes.set(type, attrs);
			}
		}
	}

	trimQuotes(value: string) {
		if (value.startsWith("\"") && value.endsWith("\"")) {
			value = value.substring(1, value.length - 1);
		} else if (value.startsWith("'") && value.endsWith("'")) {
			value = value.substring(1, value.length - 1);
		}
		return value;
	}

	async getMarkersValues(markers: string, layout: string): Promise<number[][]> {
		let markersValues: number[][] = [];
		const variable = await this.getVariable(markers);
		if (!variable)
			return markersValues;
		if (variable?.variablesReference == 0) {
			if (!isNaN(parseInt(variable.value)))
				markersValues.push([parseInt(variable.value)]);
			return markersValues;
		}
		const children = await this.getVariables(variable);
		const childrenList: number[] = [];
		for (const child of children) {
			if (this.filterVariable(child))
				continue;
			if (!this.isIndexed(child, variable)) {
				continue;
			}
			if (child.variablesReference == 0) {
				if (!isNaN(parseInt(child.value)))
					childrenList.push(parseInt(child.value));
			} else if (layout === "array2D" || layout === "array3D") {
				const gChildren = await this.getVariables(child);
				const gChildrenList: number[] = [];
				for (const gChild of gChildren) {
					if (this.filterVariable(gChild))
						continue;
					if (!this.isIndexed(gChild, child)) {
						continue;
					}
					if (isNaN(parseInt(gChild.value)))
						continue;
					gChildrenList.push(parseInt(gChild.value));
					if (gChildrenList.length == 3)
						break;
				}
				if (gChildrenList.length > 0) {
					markersValues.push(gChildrenList.slice(0, 3));
				}
			}
			if (childrenList.length == 3)
				break;
		}
		if (childrenList.length > 0)
			markersValues = [childrenList as [number, number, number]];
		return markersValues;
	}

	getRegisteredTypes() {
		return this.registeredTypes;
	}

	static getSession(): DebugSession | undefined {
		return debug.activeDebugSession;
	}

	static isActive(): boolean {
		if (debug.activeDebugSession) {
			return true;
		}
		return false;
	}

	public async getStackTrace(threadId: number): Promise<StackTrace> {
		const response = await debug.activeDebugSession?.customRequest('stackTrace', { threadId: threadId });
		return response;
	}

	public getSource(source: string): string {
		const contents = fs.readFileSync(source, 'utf8');
		return contents;
	}


	async getScopes(): Promise<Scope[]> {
		if (!debug.activeStackItem) {
			return [];
		}
		const result = await debug.activeDebugSession?.customRequest("scopes", {
			frameId: (debug.activeStackItem as DebugStackFrame).frameId
		});
		return result.scopes;
	}

	async getAllVariables(): Promise<Variable[]> {
		try {
			const scopes: Scope[] = await this.getScopes();
			if (!scopes || scopes.length == 0) {
				return [];
			}
			const variablesReference = scopes[0].variablesReference;
			const result = await debug.activeDebugSession?.customRequest("variables", {
				variablesReference: variablesReference,
				filter: undefined
			});
			if (!result) {
				return [];
			}
			return result.variables;
		} catch (ex) {
			console.error(ex);
			return [];
		}
	}

	async getVariables(
		variable: Variable,
		filter?: 'indexed' | 'named'
	): Promise<Variable[]> {
		try {
			const variablesReference: number | undefined = variable?.variablesReference;
			const result = await debug.activeDebugSession?.customRequest("variables", {
				variablesReference: variablesReference,
				filter: filter
			});
			if (!result) {
				return [];
			}
			return result.variables;
		} catch (ex) {
			console.error(ex);
			return [];
		}
	}

	async getVariable(expr: string): Promise<Variable | undefined> {
		try {
			const { parsedExpr, ranges } = this.parseArrayRanges(expr);
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: parsedExpr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if (!result.name) {
				result.name = expr;
			}
			if (!result.evaluateName) {
				result.evaluateName = parsedExpr;
			}
			if (!result.value) {
				result.value = result.result;
			}
			result.ranges = ranges;
			return result;
		} catch (error) {
			console.error(error);
		}
	}

	async nextStatement(step = true): Promise<Response> {
		const cmd = step ? 'next' : 'continue';
		const response = await debug.activeDebugSession?.customRequest(cmd, {
			threadId: debug.activeStackItem?.threadId,
			granularity: 'statement'
		});
		return response;
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	/**
	 * 
	 * @param variable The variable
	 * @returns The string representation
	 */
	public async getVariableStrRepr(variable: Variable): Promise<string | undefined> {
		return undefined;
	}

	public async getEdgeValues(variable: Variable, property: string): Promise<string[] | undefined> {
		return undefined;
	}

	/**
	 * Get the edge string representation
	 * The node should have a method:
	 * public Map<GraphNode<T>, String> toNodeString(){}
	 */
	public async getVarToVarStrRepr(variable: Variable,
		type: string,
		rootVariable: Variable,
		nodes: Variable[],
		attr: string
	): Promise<Map<string, string> | undefined> {
		try {
			const edgesValues: Map<string, string> = new Map<string, string>();
			const edges: Variable[] | undefined =
				await this.extract(variable, type, attr, rootVariable);
			if (!nodes || !edges) {
				return;
			}
			const edgeValues = edges as Variable[];
			for (let i = 0; i < nodes.length; i++) {
				const nodeId = await this.getNodeId(nodes[i]);
				edgesValues.set(nodeId, edgeValues[i].value);
			}
			return edgesValues;
		} catch (ex: Error | unknown) {
			if (ex instanceof Error) {
				console.error("Error: getVarToVarStrRepr: " + variable.evaluateName + ": " + ex.message);
			} else {
				console.error(ex);
			}
		}
	}

	public trackErrors(ex: Error, type: string, group: string) {
		if (ex && ex.message && (
			ex.message.includes("cannot be resolved to a type")
			|| ex.message.includes("undefined for the type")
			|| ex.message.includes("cannot be referenced using its binary name")
		)) {
			this.erroredTypes.add(group + ":" + type);
		}
	}

	hasErrored(type: string, group: string) {
		return this.erroredTypes.has(group + ":" + type);
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
			const result = await debug.activeDebugSession?.customRequest("evaluate", {
				expression: expr,
				frameId: (debug.activeStackItem as DebugStackFrame).frameId,
				context: 'repl',
			});
			if ((result.result.startsWith('error '))
				|| (result.type && result.type.includes('Exception'))) {
				throw new Error(result.result);
			}
			if (result.type === undefined) {
				return undefined;
			}
			if (result.type.endsWith('Exception')) {
				throw new Error(result.result);
			}
			if (result.result === 'null' || result.result === 'undefined') {
				return undefined;
			}
			const nodes: Variable[] = [];
			const children = await this.getVariables(result);
			let idx = 0;
			for (const child of children) {
				if (!this.isIndexed(child, result)) {
					continue;
				}
				if (this.filterVariable(child)) {
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
				console.error("extractor Error: " + variable.evaluateName
					+ " " + type + " " + attr
					+ ": " + ex);
			} else {
				console.error(ex);
			}
		}
	}

	public getExtractCall(variable: Variable, type: string, attr: string, root: Variable): string {
		return "";
	}

	public async getArrayRepr(variable: Variable):
		Promise<string[] | undefined> {
		return undefined;
	}

	public async getArray2DRepr(variable: Variable):
		Promise<string[][] | undefined> {
		return undefined;
	}

	public async getArray3DRepr(variable: Variable):
		Promise<string[][][] | undefined> {
		const childrenVars = await this.getVariables(variable);
		const children: string[][][] = [];
		for (const childVar of childrenVars) {
			if (!this.isIndexed(childVar, variable)) {
				continue;
			}
			if (this.filterVariable(childVar)) {
				continue;
			}
			const array2Drepr = await this.getArray2DRepr(childVar);
			if (array2Drepr)
				children.push(array2Drepr);
		}
		return children;
	}

	public async getQueueRepr(variable: Variable): Promise<string[] | undefined> {
		return undefined;
	}

	public async getMapRepr(variable: Variable): Promise<string[][] | undefined> {
		return undefined;
	}

	public async getQueueNodes(variable: Variable): Promise<Variable[] | undefined> {
		return undefined;
	}

	public filterVariable(_variable: Variable): boolean {
		return false;
	}

	public processVariable(variable: Variable, type?: string): Variable {
		return variable;
	}

	public async expandVariables(variables: Variable[]): Promise<Variable[]> {
		return variables;
	}

	public async getNodeId(variable: Variable): Promise<string> {
		return variable.value;
	}

	public async getNodeType(variable: Variable): Promise<string> {
		return variable.type;
	}

	public async getNodeName(variable: Variable): Promise<string> {
		return variable.name;
	}

	public async getNodeValue(variable: Variable): Promise<string> {
		return variable.value;
	}

	public getVarNodeId(variable: Variable) {
		return variable.name;
	}

	public isList(type: string): boolean {
		return false;
	}

	public isArray(type: string): boolean {
		return false;
	}

	public isSet(type: string): boolean {
		return false;
	}

	public isIterable(type: string): boolean {
		return false;
	}

	public getDefaultLayout(type: string, value: string): string | undefined {
		return undefined;
	}

	public getRegisterMethod() {
		return "Extractor.registerAttrs()";
	}

	public hasChildren(ch: Variable): boolean {
		return false;
	}

	public isIndexed(variable: Variable, parent: Variable): boolean {
		return !isNaN(parseInt(variable.name));
	}

	async getPlotRepr(variable: Variable, type: string, attr: string, rootVariable: Variable): Promise<number[][] | undefined> {
		const points: Variable[] | undefined = await this.extract(variable, type, attr, rootVariable);
		if (!points)
			return;
		const plot: number[][] = [];
		for (const point of points) {
			const els = await this.getVariables(point);
			const nums: number[] = [];
			for (const el of els) {
				if (!this.isIndexed(el, point))
					continue;
				if (isNaN(parseInt(el.value)))
					continue;
				nums.push(parseInt(el.value));
			}
			plot.push(nums);
		}
		return plot;
	}

	/**
	 * 
	 * @param expr The expression that contains array ranges
	 * @returns {parsedExpr: string, ranges: Range[]} The parsed expression and the ranges
	 */
	parseArrayRanges(expr: string): { parsedExpr: string, ranges: Range[] } {
		const delimIdx = expr.lastIndexOf(",");
		const ranges: Range[] = [];
		if (delimIdx >= 1) {
			const rangesPart = expr.substring(delimIdx + 1).trim();
			if (rangesPart.startsWith("[") && rangesPart.endsWith("]")) {
				expr = expr.substring(0, delimIdx);
				const dimParts = rangesPart.substring(1, rangesPart.length - 1)
					.split("|");
				for (const dimPart of dimParts) {
					const rangeParts = dimPart.split(":");
					if (rangeParts.length != 2)
						continue;
					const start = parseInt(rangeParts[0]);
					const end = parseInt(rangeParts[1]);
					if (!isNaN(start) && !isNaN(end)) {
						ranges.push(new Range(start, end - start));
					}
				}
			}
		}
		return { parsedExpr: expr, ranges: ranges };
	}
}

export interface Scope {
	name: string;
	expensive: boolean;
	variablesReference: number;
}

export interface Variable {
	name: string;
	evaluateName: string;
	value: string;
	variablesReference: number;
	type: string;
	indexedVariables: number;
	namedVariables: number;
	memoryReference: string;
	presentationHint: { visibility?: string, attributes?: string[] };
	// vsa specific
	processed: boolean;
	ranges: Range[];
}

export interface StackTrace {
	stackFrames: StackFrame[];
	totalFrames?: number;
}

export interface StackFrame {
	id: number;
	name: string;
	source?: Source;
	line: number;
	column: number;
	endLine?: number;
	endColumn?: number;
	canRestart?: boolean;
	instructionPointerReference?: string;
	moduleId?: number | string;
	presentationHint?: 'normal' | 'label' | 'subtle';
}

export interface Source {
	name?: string;
	path?: string;
	sourceReference?: number;
	presentationHint?: 'normal' | 'emphasize' | 'deemphasize';
	origin?: string;
	sources?: Source[];
}

export interface Response extends ProtocolMessage {
	type: 'response';
	request_seq: number;
	success: boolean;
	command: string;
	message?: 'cancelled' | 'notStopped' | string;
	body?: object;
}

export interface ProtocolMessage {
	seq: number;
	type: 'request' | 'response' | 'event' | string;
}

export interface SourceResponse extends Response {
	body: {
		content: string;
		mimeType?: string;
	};
}

// custom range class to assist with c/c++ pointer to array
export class Range {
	start = 0;
	length = 0;
	constructor(start: number, length: number) {
		this.start = start;
		this.length = length;
	}
}