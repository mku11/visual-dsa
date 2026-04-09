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

import * as vscode from 'vscode';
import { diff, DiffEntry } from 'util';
import { Node, Parser, VarNode } from '../parsers/parser';
import { Reader, Variable } from '../readers/reader';
import { JavaReader } from '../readers/java_reader';
import { PythonReader } from '../readers/python_reader';
import { JsReader } from '../readers/js_reader';
import { CsReader } from '../readers/cs_reader';
import { Diff, Formatter, VisData, VisDiffData, VisEdge, VisNode } from '../formatters/formatter';
import { JavaFormatter } from '../formatters/java_formatter';
import { Panel } from '../view/panel';
import { CsFormatter } from '../formatters/cs_formatter';
import { JsFormatter } from '../formatters/js_formatter';
import { PythonFormatter } from '../formatters/python_formatter';
import { CxxReader } from '../readers/cxx_reader';
import { CxxFormatter } from '../formatters/cxx_formatter';

export class Controller {
	private visData: VisData[] = [];
	private source: Source[] = [];
	private idx = -1;
	private prevIdx = -1;
	private reader = new Reader();
	private parser = new Parser(this.reader);
	private formatter = new Formatter();

	private varNodes: Map<string, Node> = new Map<string, Node>();
	private variables: Map<string, Variable> = new Map<string, Variable>();
	private selectedVariables: Set<string> = new Set<string>();
	private selectedNodes: Map<string, Set<string>> = new Map<string, Set<string>>();
	private selectedObject = "";
	private selectedEdges: Map<string, Set<string>> = new Map<string, Set<string>>();
	private selectedProperties: Map<string, Set<string>> = new Map<string, Set<string>>();
	private selectedPlot: Map<string, Set<string>> = new Map<string, Set<string>>();
	private selectedMarkers: Map<string, string> = new Map<string, string>();
	private selectedLayout: Map<string, string> = new Map<string, string>();
	private selectedOrientation: Map<string, string> = new Map<string, string>();

	private autoStepDelay = 1000; // ms
	private started = false;
	private initialized = false;
	private busy = false;

	start(context: vscode.ExtensionContext) {
		this.setupListeners(context);
		Panel.initialize(context.extensionUri);
		Panel.onOptionsChanged = async (message) => await this.onOptionsChanged(message);
		Panel.onCommandRequested = async (message) => await this.onCommandRequested(message);
		Panel.onViewStateChanged = async () => await this.onViewStateChanged();
		Reader.initialize(async () => {
			this.initialized = false;
			this.visData = [];
			this.source = [];
			this.idx = -1;
			this.started = false;
			await this.initialize();
		}, async (lines: string[], startLine: number, endLine: number) => {
			setTimeout(async () => {
				try {
					await this.initialize();
					this.step();
					this.source[this.idx] = new Source(lines, startLine, endLine);
					await this.update();
				} catch (ex) {
					console.error(ex);
				}
				this.busy = false;
			});
		});
	}

	step() {
		this.prevIdx = this.idx;
		this.idx++;
	}

	async update() {
		await this.updateVariables();
		await this.refresh();
	}

	async refresh() {
		this.showProgress(true);
		await this.updateTypes();
		await this.startVisualize();
		this.showProgress(false);
	}

	async initialize() {
		if (!Reader.isActive()) {
			return;
		}
		if (this.initialized) {
			return;
		}
		await this.createReader();
		this.initialized = true;
	}

	async createReader() {
		const sessionType = Reader.getSession()?.type;
		if (sessionType === 'java') {
			this.reader = new JavaReader();
			this.formatter = new JavaFormatter();
		} else if (sessionType === 'coreclr') {
			this.reader = new CsReader();
			this.formatter = new CsFormatter();
		} else if (sessionType === 'pwa-node') {
			this.reader = new JsReader();
			this.formatter = new JsFormatter();
		} else if (sessionType === 'debugpy') {
			this.reader = new PythonReader();
			this.formatter = new PythonFormatter();
		} else if (sessionType === 'cppvsdbg') {
			this.reader = new CxxReader();
			this.formatter = new CxxFormatter();
		} else {
			this.reader = new Reader();
			this.formatter = new Formatter();
		}
		this.parser = new Parser(this.reader);
	}

	async updateVariables() {
		const variables: Variable[] = await this.parser.getAllVariables();
		this.variables.clear();
		for (const variable of variables) {
			this.variables.set(variable.name, variable);
		}
		for (const selectedVariable of this.selectedVariables) {
			if (this.variables.has(selectedVariable)) {
				continue;
			}
			const variable: Variable | undefined = await this.parser.getVariable(selectedVariable);
			if (variable) {
				this.variables.set(variable.name, variable);
			}
		}
	}

	setupListeners(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.commands.registerCommand('visualDSA.start', async () => {
				if (Panel.getPanel()) {
					return;
				}
				Panel.createOrShow(context.extensionUri);
				this.reset();
				await this.initialize();
				if (Reader.getSession() != null) {
					if (this.idx == -1) {
						this.step();
					}
					this.updatePanel();
				}
			})
		);
	}

	reset() {
		this.visData = [];
		this.idx = -1;
		this.started = false;
		this.selectedVariables = new Set<string>();
		this.selectedNodes = new Map<string, Set<string>>();
		this.selectedEdges = new Map<string, Set<string>>();
		this.selectedProperties = new Map<string, Set<string>>();
		this.selectedPlot = new Map<string, Set<string>>();
		this.selectedMarkers = new Map<string, string>();
		this.selectedLayout = new Map<string, string>();
		this.selectedOrientation = new Map<string, string>();
		this.autoStepDelay = 1000;
	}

	async startVisualize() {

		// parse the variables into graphs
		this.varNodes = new Map<string, Node>();
		const variableNodes: VarNode[] = [];
		const visited: Map<string, Node> = new Map<string, Node>();
		for (const variableName of this.selectedVariables) {
			try {
				const variable = this.variables.get(variableName);
				if (!variable) {
					continue;
				}
				const node: VarNode | Node | undefined =
					await this.parser.parseGraph(
						variable,
						visited,
						this.selectedNodes,
						this.selectedEdges,
						this.selectedProperties,
						this.selectedPlot,
						this.selectedMarkers,
						this.selectedLayout,
						this.selectedOrientation
					);
				if (node instanceof VarNode) {
					variableNodes.push(node);
				}
			} catch (error) {
				console.error(error);
			}
		}

		try {
			// stored all nodes
			this.varNodes = visited;

			// convert to vis.js format
			const data: VisData = this.formatter.convert(variableNodes,
				this.selectedLayout, this.selectedOrientation
			);
			this.visData[this.idx] = data;
			this.updatePanel();
		} catch (error) {
			console.error(error);
		}
	}

	getDiff(data: VisData, prevData: VisData) {
		const diffData: VisDiffData = new VisDiffData();
		this.setDiffNodes(prevData, data, diffData);
		this.setDiffEdges(prevData, data, diffData);
		return diffData;
	}

	setDiffNodes(prevData: VisData, data: VisData, diffData: VisDiffData) {
		const prevNodes: Map<string, VisNode> = new Map<string, VisNode>();
		const currNodes: Map<string, VisNode> = new Map<string, VisNode>();
		for (const prevNode of prevData.nodes) {
			prevNodes.set(prevNode.id, prevNode);
		}
		for (const currNode of data.nodes) {
			currNodes.set(currNode.id, currNode);
		}

		for (const prevNode of prevData.nodes) {
			if (!currNodes.has(prevNode.id)) {
				diffData.removeNodes.push(prevNode);
			}
		}
		for (const currNode of data.nodes) {
			if (!prevNodes.has(currNode.id)) {
				diffData.newNodes.push(currNode);
			} else {
				const prevNode = prevNodes.get(currNode.id);
				if (prevNode && prevNode.label !== currNode.label) {
					currNode.labelDiff = this.getDiffString(currNode.label, prevNode.label);
					diffData.updateNodes.push(currNode);
				} else if (prevNode &&
					prevNode?.labelMarkers.map(x => x.start + "," + x.end).join(':')
					!== currNode?.labelMarkers.map(x => x.start + "," + x.end).join(':')) {
					diffData.updateNodes.push(currNode);
				}
			}
		}
	}

	getDiffString(currText: string, prevText: string): Diff[] {
		const diffs: Diff[] = [];
		const diffEntries: DiffEntry[] = diff(currText, prevText);
		let start = -1;
		let idx = 0;
		for (const entry of diffEntries) {
			if (entry[0] == 0) {
				if (start != -1) {
					diffs.push(new Diff(start, idx));
				}
				start = -1;
			} else if (entry[0] == 1) {
				if (start == -1) {
					start = idx;
				}
			}
			if (entry[0] != -1) {
				idx++;
			}
		}
		if (start != -1) {
			diffs.push(new Diff(start, idx));
		}
		return diffs;
	}

	setDiffEdges(prevData: VisData, data: VisData, diffData: VisDiffData) {
		const prevEdges: Map<string, VisEdge> = new Map<string, VisEdge>();
		const currEdges: Map<string, VisEdge> = new Map<string, VisEdge>();
		for (const prevNode of prevData.edges) {
			prevEdges.set(prevNode.id, prevNode);
		}
		for (const currNode of data.edges) {
			currEdges.set(currNode.id, currNode);
		}

		for (const prevEdge of prevData.edges) {
			if (!currEdges.has(prevEdge.id)) {
				diffData.removeEdges.push(prevEdge);
			}
		}
		for (const currEdge of data.edges) {
			if (!prevEdges.has(currEdge.id)) {
				diffData.newEdges.push(currEdge);
			}
		}
	}

	async updateTypes() {
		await this.reader.registerTypes();
		const visitedTypes: Map<string, Variable> = new Map<string, Variable>();
		for (const variableName of this.selectedVariables) {
			const variable = this.variables.get(variableName);
			if (!variable) {
				continue;
			}
			console.log("updateTypes: " + variable.name);
			try {
				await this.parser.updateTypes(variable, variable, 0, visitedTypes);
			} catch (ex) {
				console.error(ex);
			}
		}
		this.setDefaultLayouts();
	}

	setDefaultLayouts() {
		for (const [nodeType, layout] of this.parser.getNodeTypeLayouts()) {
			if (!this.selectedLayout.get("type:" + nodeType)) {
				this.selectedLayout.set("type:" + nodeType, layout);
			}
		}
	}

	updateParams() {
		this.updateObjectAttributes();
		Panel.getPanel()?.updateParams(
			Array.from(this.variables.keys())
		);
	}

	getSortMethod(incr: boolean) {
		return (a: string, b: string) => {
			const sign = incr ? 1 : -1;
			if (a.endsWith("[]") && !b.endsWith("[]"))
				return -1 * sign;
			if (!a.endsWith("[]") && b.endsWith("[]"))
				return 1 * sign;
			return a.localeCompare(b);
		};
	}


	updateObjectAttributes() {
		console.log("update object attrs");
		const selectedType = this.varNodes.get(this.selectedObject)?.type ?? "";
		Panel.getPanel()?.updateVarOptions(
			this.selectedObject,
			selectedType,
			Array.from(this.parser.getNodes().get(selectedType) ?? []).sort(this.getSortMethod(true)),
			Array.from(this.selectedNodes.get("id:" + this.selectedObject) ?? this.selectedNodes.get("type:" + selectedType) ?? []).sort(),
			Array.from(this.parser.getEdges().get(selectedType) ?? []).sort(this.getSortMethod(true)),
			Array.from(this.selectedEdges.get("id:" + this.selectedObject) ?? this.selectedEdges.get("type:" + selectedType) ?? []).sort(),
			Array.from(this.parser.getProperties().get(selectedType) ?? []).sort(this.getSortMethod(false)),
			Array.from(this.selectedProperties.get("id:" + this.selectedObject) ?? this.selectedProperties.get("type:" + selectedType) ?? []).sort(),
			Array.from(this.parser.getPlot().get(selectedType) ?? []).sort(),
			Array.from(this.selectedPlot.get("id:" + this.selectedObject) ?? this.selectedPlot.get("type:" + selectedType) ?? []).sort(),
			this.selectedLayout.get("id:" + this.selectedObject) ?? this.selectedLayout.get("type:" + selectedType) ?? "graph",
			this.selectedOrientation.get("id:" + this.selectedObject) ?? this.selectedOrientation.get("type:" + selectedType) ?? "horizontal",
			this.selectedMarkers.get("id:" + this.selectedObject) ?? this.selectedMarkers.get("type:" + selectedType) ?? ""
		);
	}

	updatePanel() {
		if (this.idx == 0) {
			Panel.getPanel()?.createGraph(
				this.visData[this.idx],
				this.source[this.idx],
				this.selectedLayout
			);
		} else if (this.idx > 0) {
			const currData: VisData = this.visData[this.idx];
			const prevData: VisData = this.visData[this.prevIdx < this.idx ? this.idx - 1 : this.idx + 1];
			const diffData = this.getDiff(currData, prevData);
			Panel.getPanel()?.updateGraph(
				diffData,
				this.source[this.idx],
				this.selectedLayout
			);
		}
	}

	async onViewStateChanged() {
		console.log("view state changed");
	}

	async onCommandRequested(message: { command: string, data: string }) {
		setTimeout(async () => {
			try {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.data[0]);
						break;
					case 'back':
						if (!this.busy) {
							await this.back();
						}
						break;
					case 'cont':
						if (!this.busy) {
							await this.next(false);
						}
						break;
					case 'next':
						if (!this.busy) {
							await this.next();
						}
						break;
					case 'run':
						if (!this.busy) {
							await this.run();
						}
						break;
					case 'pause':
						this.pause();
						break;
					case 'refresh':
						if (!this.busy) {
							await this.refresh();
						}
						break;
					case 'update':
						if (!this.busy) {
							await this.update();
						}
						break;
					case 'updated':
						this.onUpdated();
						break;
				}
			} catch (ex) {
				console.error(ex);
			}
		});
	}

	async onOptionsChanged(message: { option: string, source: string, data: string[] }) {
		switch (message.option) {
			case 'selectedVariables':
				this.selectedVariables = new Set(message.data);
				if (!this.busy) {
					this.update();
				}
				return;
			case 'selectedObject':
				this.selectedObject = message.data[0];
				this.updateObjectAttributes();
				return;
			case 'selectedNodes':
				this.selectedNodes.set(message.source, new Set(message.data));
				return;
			case 'selectedEdges':
				this.selectedEdges.set(message.source, new Set(message.data));
				return;
			case 'selectedProperties':
				this.selectedProperties.set(message.source, new Set(message.data));
				return;
			case 'selectedPlot':
				this.selectedPlot.set(message.source, new Set(message.data));
				return;
			case 'selectedMarkers':
				this.selectedMarkers.set(message.source, message.data[0]);
				return;
			case 'selectedLayout':
				this.selectedLayout.set(message.source, message.data[0]);
				return;
			case 'selectedOrientation':
				this.selectedOrientation.set(message.source, message.data[0]);
				return;
			case 'delay':
				this.autoStepDelay = parseInt(message.data[0]);
				return;
		}
	}

	async nextStatement(step = true) {
		if (this.busy) {
			return;
		}
		this.busy = true;
		await this.reader.nextStatement(step);
	}

	async next(step = true) {
		if (this.idx < this.visData.length - 1) {
			this.prevIdx = this.idx;
			this.idx++;
			this.updatePanel();
		} else {
			await this.nextStatement(step);
		}
	}

	async back() {
		if (this.idx > 0) {
			this.prevIdx = this.idx;
			this.idx--;
			this.updatePanel();
		}
	}

	pause() {
		this.started = false;
	}

	async run() {
		this.started = true;
		await this.next();
	}

	onUpdated() {
		if (this.started) {
			setTimeout(async () => {
				if (!this.busy) {
					await this.run();
				}
			}, this.autoStepDelay);
		}
		this.updateParams();
		this.enableVarsOptions(this.idx == this.visData.length - 1);
	}

	enableVarsOptions(value: boolean) {
		Panel.getPanel()?.enableVarsOptions(value);
	}

	showProgress(value: boolean) {
		Panel.getPanel()?.showProgress(value);
	}
}

export class Source {
	lines: string[];
	start: number;
	end?: number;
	constructor(lines: string[], start: number, end: number) {
		this.lines = lines;
		this.start = start;
		this.end = end;
	}
}