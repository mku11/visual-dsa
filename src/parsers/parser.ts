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

import { Reader, Variable } from "../readers/reader";

export class Parser {

	static MAX_LEVEL = 20;
	static MAX_LEVEL_NODE_TYPES = 5;

	private reader: Reader;
	private nodes: Map<string, Set<string>> = new Map<string, Set<string>>();
	private nodeTypeLayouts: Map<string, string> = new Map<string, string>();
	private edges: Map<string, Set<string>> = new Map<string, Set<string>>();
	private properties: Map<string, Set<string>> = new Map<string, Set<string>>();
	private arrayLayouts: Set<string> = new Set<string>(["array"]);
	private array2DLayouts: Set<string> = new Set<string>(["array2D"]);
	private stackLayouts: Set<string> = new Set<string>(["stack"]);
	private queueLayouts: Set<string> = new Set<string>(["queue"]);
	private setLayouts: Set<string> = new Set<string>(["set"]);
	private mapLayouts: Set<string> = new Set<string>(["map"]);
	private barsLayouts: Set<string> = new Set<string>(["bars"]);
	private plotLayouts: Set<string> = new Set<string>(["plotpoints", "plotlines"]);
	constructor(reader: Reader) {
		this.reader = reader;
	}

	resetTypes() {
		this.nodes.clear();
	}

	async parseGraph(variable: Variable,
		visited: Map<string, Node>,
		filtersNodes: Map<string, Set<string>>,
		filtersEdges: Map<string, Set<string>>,
		filtersProperties: Map<string, Set<string>>,
		markersx: Map<string, Set<string>>,
		markersy: Map<string, Set<string>>,
		layouts: Map<string, string>,
		orientations: Map<string, string>
	): Promise<VarNode | undefined> {
		console.log("parseGraph: " + variable.name);
		const graph = await this.getGraph(variable, variable,
			0, visited,
			filtersNodes, filtersEdges, filtersProperties,
			markersx, markersy,
			layouts, orientations);
		if (graph instanceof VarNode) {
			return graph;
		}
		return undefined;
	}

	getNodes() {
		return this.nodes;
	}

	getNodeTypeLayouts() {
		return this.nodeTypeLayouts;
	}

	getEdges() {
		return this.edges;
	}

	getProperties() {
		return this.properties;
	}

	async getAllVariables(): Promise<Variable[]> {
		let variables: Variable[] = await this.reader.getVariables();
		variables = await this.reader.expandVariables(variables);
		variables = variables.filter(x => !this.reader.filterVariable(x));
		variables = variables.map(x => this.reader.processVariable(x));
		return variables;
	}

	async registerTypes() {
		await this.reader.registerTypes();
	}

	async updateTypes(variable: Variable,
		rootVariable: Variable, level = 0,
		visited: Map<string, Variable>,
	): Promise<void> {
		if (level >= Parser.MAX_LEVEL_NODE_TYPES) {
			return;
		}

		variable = this.reader.processVariable(variable);

		// node already visited
		if (level > 0 && visited.has(variable.value) && visited.get(variable.value)) {
			return;
		}

		visited.set(variable.value, variable);
		let children: Variable[] = [];
		if (variable.variablesReference > 0) {
			const childrenVars = await this.reader.getVariables(variable.variablesReference, "named");
			if (childrenVars) {
				for (let childVar of childrenVars) {
					if (!isNaN(parseInt(childVar.name))) {
						continue;
					}
					if (this.reader.filterVariable(childVar)) {
						continue;
					}
					childVar = this.reader.processVariable(childVar);
					children.push(childVar);
				}
			}
		}

		// if the variable has a string representation defined it will yield one child without name and type
		if (children.length == 1 && children[0].name === '' && children[0].type === '') {
			const childrenVars = await this.reader.getVariables(children[0].variablesReference, "named");
			if (childrenVars) {
				children = [];
				for (let childVar of childrenVars) {
					if (this.reader.filterVariable(childVar)) {
						continue;
					}
					childVar = this.reader.processVariable(childVar);
					children.push(childVar);
				}
			}
		}

		if (this.reader.getRegisteredTypes().has(variable.type)
			|| this.reader.getRegisteredTypes().has("*")) {
			const userDefNodes = await this.reader
				.getUserDefNodes(variable, rootVariable);
			if (userDefNodes) {
				for (let userDefNode of userDefNodes) {
					if (this.reader.filterVariable(userDefNode)) {
						continue;
					}
					userDefNode = this.reader.processVariable(userDefNode);
					children.push(userDefNode);
				}
			}
		}

		for (let child of children) {
			child = this.reader.processVariable(child);

			if (this.reader.filterVariable(child)) {
				continue;
			}
			if (child.type && child.type.length > 0) {
				if (isNaN(parseInt(child.name))) {
					this.addNodes(variable, child.name);
				}
				await this.updateTypes(child, rootVariable, level + 1, visited);
			}
			if (variable.type.length > 0 && child.name.length > 0 && isNaN(parseInt(child.name))) {
				this.addProperty(variable, child.name);
				this.addEdges(variable, child.name);
			}
		}
	}

	addNodes(variable: Variable, name: string) {
		if (!this.nodes.has(variable.type)) {
			this.nodes.set(variable.type, new Set<string>());
		}
		this.nodes.get(variable.type)?.add(name);
	}

	addEdges(variable: Variable, name: string) {
		if (!this.edges.has(variable.type)) {
			this.edges.set(variable.type, new Set<string>());
		}
		this.edges.get(variable.type)?.add(name);
	}

	addProperty(variable: Variable, name: string) {
		if (!this.properties.has(variable.type)) {
			this.properties.set(variable.type, new Set<string>());
		}
		this.properties.get(variable.type)?.add(name);
	}

	async getVariable(expr: string): Promise<Variable | undefined> {
		return this.reader.getVariable(expr);
	}

	async getGraph(variable: Variable,
		rootVariable: Variable,
		level: number,
		visited: Map<string, Node | VarNode>,
		filtersNodes: Map<string, Set<string>>,
		filtersEdges: Map<string, Set<string>>,
		filtersProperties: Map<string, Set<string>>,
		markersx: Map<string, Set<string>>,
		markersy: Map<string, Set<string>>,
		layouts: Map<string, string>,
		orientations: Map<string, string>
	): Promise<VarNode | Node | undefined> {

		// node already visited
		if (level > 0 && visited.has(await this.reader.getNodeId(variable))
			&& visited.get(await this.reader.getNodeId(variable))) {
			return visited.get(await this.reader.getNodeId(variable));
		}

		console.log("parse: ", variable.value, variable.type, level);

		const id: string = await this.reader.getNodeId(variable);
		const type: string = await this.reader.getNodeType(variable);
		const value: string = await this.reader.getNodeValue(variable);

		if (!this.nodeTypeLayouts.has(type)) {
			const layout = this.reader.getDefaultLayout(type, value);
			if (layout) {
				this.nodeTypeLayouts.set(type, layout);
				if (!layouts.get(type)) {
					layouts.set(type, layout);
				}
			}
		}

		const filterNodes = filtersNodes.get(type) ?? new Set();
		const filterEdges = filtersEdges.get(type) ?? new Set();
		const filterProperties = filtersProperties.get(type) ?? new Set();
		const useMarkersx = markersx.get(type) ?? new Set();
		const useMarkersy = markersy.get(type) ?? new Set();
		const layout = layouts.get(type) ?? "graph";

		// check if this is the variable node
		let varNode: VarNode | Node | undefined;
		if (level == 0) {
			const varNodeId = this.reader.getVarNodeId(variable);
			varNode = new VarNode(varNodeId, type, value);
			if (this.arrayLayouts.has(layout) || this.stackLayouts.has(layout)
				|| this.setLayouts.has(layout)) {
				const arrayRepr = await this.reader.getArrayRepr(variable);
				if (arrayRepr) {
					varNode.value = arrayRepr;
				}
				const markersx = await this.reader.getMarkersValues(Array.from(useMarkersx));
				if (markersx) {
					varNode.markersx = markersx;
				}
			}
			if (variable.variablesReference == 0) {
				visited.set(varNodeId, varNode);
				return varNode;
			}
		}

		// create a node and get the string representation
		const node = new Node(id, type, value);

		if (variable.variablesReference > 0 && variable.evaluateName) {
			const nodeValue: string | undefined =
				await this.reader.getVariableStrRepr(variable);
			if (nodeValue) {
				node.value = nodeValue;
			}
		}

		// add array representation if applicable
		if (this.arrayLayouts.has(layout) || this.stackLayouts.has(layout)
			|| this.setLayouts.has(layout) || this.barsLayouts.has(layout)) {
			const arrayRepr = await this.reader.getArrayRepr(variable);
			if (arrayRepr) {
				node.value = arrayRepr;
			}
			const markersx = await this.reader.getMarkersValues(Array.from(useMarkersx));
			if (markersx) {
				node.markersx = markersx;
			}
		} else if (this.array2DLayouts.has(layout) || this.plotLayouts.has(layout)) {
			let arrayRepr;
			if (this.plotLayouts.has(layout) && (this.reader.getRegisteredTypes().has(type)
				|| this.reader.getRegisteredTypes().has("*"))) {
				arrayRepr = await this.reader.getUserDefPlot(variable, rootVariable, layout);
			}
			if (!arrayRepr) {
				arrayRepr = await this.reader.getArray2DRepr(variable);
			}
			if (arrayRepr) {
				node.value = arrayRepr;
			}
			const markersx = await this.reader.getMarkersValues(Array.from(useMarkersx));
			if (markersx) {
				node.markersx = markersx;
			}
			const markersy = await this.reader.getMarkersValues(Array.from(useMarkersy));
			if (markersy) {
				node.markersy = markersy;
			}
		} else if (this.mapLayouts.has(layout)) {
			const arrayRepr = await this.reader.getMapRepr(variable);
			if (arrayRepr) {
				node.value = arrayRepr;
			}
		}
		visited.set(node.id, node);

		// visit the children
		const nodesChildren: Variable[] = [];
		const propertiesChildren: Variable[] = [];

		// get user defined nodes
		let userDefNodes;
		if (this.reader.getRegisteredTypes().has(type)
			|| this.reader.getRegisteredTypes().has("*")) {
			userDefNodes = await this.reader.getUserDefNodes(variable, rootVariable);
			if (userDefNodes) {
				for (let userDefNode of userDefNodes) {
					if (this.reader.filterVariable(userDefNode)) {
						continue;
					}
					userDefNode = this.reader.processVariable(userDefNode);
					nodesChildren.push(userDefNode);
				}
			}
		}

		if (!userDefNodes && variable.variablesReference > 0 && level < Parser.MAX_LEVEL) {

			let children: Variable[] = await this.reader.getVariables(variable.variablesReference);
			// if the variable has a string representation defined it will yield one child without name and type
			if (children.length == 1 && children[0].name === '' && children[0].type === '') {
				children = await this.reader.getVariables(children[0].variablesReference);
			}
			for (let ch of children) {
				if (this.reader.filterVariable(ch)) {
					continue;
				}
				ch = this.reader.processVariable(ch);
				const chType = this.reader.getNodeType(ch);
				if (filterNodes.has(ch.name)) {
					if (this.reader.hasChildren(ch)) {
						if (ch.variablesReference > 0) {
							const grandChildren: Variable[] = await this.reader.getVariables(ch.variablesReference, "indexed");
							for (let grandChild of grandChildren) {
								if (this.reader.filterVariable(grandChild)) {
									continue;
								}
								grandChild = this.reader.processVariable(grandChild);
								nodesChildren.push(grandChild);
							}
						}
					} else {
						nodesChildren.push(ch);
					}
				} else if ((layout == 'graph' || layout == 'tree' || layout == 'linkedlist')
					&& this.reader.isIterable(type) && filterNodes.size == 0) {
					nodesChildren.push(ch);
				}

				if (filterProperties.has(ch.name)) {
					propertiesChildren.push(ch);
				}
			}
		}

		// get the nodes
		for (const child of nodesChildren) {
			const childNode: VarNode | Node | undefined =
				await this.getGraph(
					child, rootVariable, level + 1,
					visited,
					filtersNodes,
					filtersEdges,
					filtersProperties,
					markersx,
					markersy,
					layouts, orientations);
			if (childNode instanceof Node && node instanceof Node) {
				node.children.set(childNode.id, childNode);
				const edge = new Edge(node.id + "->" + childNode.id,
					node.id, childNode.id, child.name, rootVariable.name);
				node.childrenEdgeValues.set(childNode.id, edge);
			}
		}

		// if its a linked list we linked the nodes
		if (layout == 'linkedlist' && this.reader.isIterable(variable.type)) {
			let child: Node | undefined = undefined;
			let head: Node | undefined = undefined;
			let idx = 0;
			for (const [chId, ch] of node.children.entries()) {
				if (!child) {
					child = ch;
					head = ch;
				} else {
					if (!child.children.has(chId)) {
						child.children.set(chId, ch);
						const edge = new Edge(node.id + "->" + chId, node.id, chId,
							String(idx), rootVariable.name);
						child.childrenEdgeValues.set(chId, edge);
					}
					child = ch;
				}
				idx++;
			}
			node.children.clear();
			if (head) {
				if (!node.children.has(head.id)) {
					node.children.set(head.id, head);
					const edge = new Edge(node.id + "->" + head.id, node.id, head.id,
						String(0), rootVariable.name);
					node.childrenEdgeValues.set(head.id, edge);
				}
			}
		}

		// get the properties
		for (const child of propertiesChildren) {
			if (node instanceof Node && child.name.length > 0) {
				const childNode = new Property(child.name, child.type, child.value);
				if (child.variablesReference) {
					const childValue: string | undefined =
						await this.reader.getVariableStrRepr(child);
					if (childValue) {
						childNode.strRepr = childValue;
					}
				}
				node.properties.set(child.name, childNode);
			}
		}

		// get the edges
		let edgeId = 0;
		for (const filterEdge of filterEdges) {
			const edgeValues = await this.reader.getEdgeValues(variable, filterEdge);
			if (edgeValues) {
				for (const [, child] of node.children) {
					const edge = new Edge(node.id + "->" + child.id, node.id, child.id,
						edgeValues[edgeId++], rootVariable.name);
					node.childrenEdgeValues.set(child.id, edge);
				}
			}
		}

		// get the user defined edges labels if available
		if ((this.reader.getRegisteredTypes().has(type)
			|| this.reader.getRegisteredTypes().has("*"))
			&& nodesChildren.length > 0) {
			const edgeValues = await this.reader.getVarToVarStrRepr(
				variable, rootVariable, nodesChildren);
			if (edgeValues) {
				for (const [childId, edgeValue] of edgeValues) {
					const edge = new Edge(node.id + "->" + childId, node.id, childId,
						edgeValue, rootVariable.name);
					node.childrenEdgeValues.set(childId, edge);
				}
			}
		}

		// now we have the nodes for queue we can get the str repr
		if (this.queueLayouts.has(layout) && !filterNodes.has(variable.name)) {
			const queueRepr = await this.reader.getQueueRepr(variable);
			if (queueRepr) {
				node.value = queueRepr;
			}
		}

		// if this is the variable node then attach the node
		if (varNode) {
			varNode.value = node;
			return varNode;
		}
		return node;
	}
}

export class Property {
	public name: string | undefined = undefined; // name
	public type: string | undefined = undefined; // type
	public value: string | undefined = undefined; // value
	public strRepr: string | undefined = undefined; // string representation
	constructor(name: string, type: string | undefined, value: string) {
		this.name = name;
		this.type = type;
		this.value = value;
	}
}

export class Node {
	public id: string; // unique id
	public type: string | undefined = undefined; // data type
	public value: string | object; // value for primitive, string, or array representation
	public properties: Map<string, Property> = new Map<string, Property>();
	public children: Map<string, Node> = new Map<string, Node>();
	public childrenEdgeValues: Map<string, Edge> = new Map<string, Edge>();
	public markersx?: Array<[string, string]>; // markers for x-axis
	public markersy?: Array<[string, string]>; // markers for y-axis
	public markerLabelPos: Array<[number,number]> = []; // markers label positions
	constructor(id: string, type: string | undefined, value: string | object) {
		this.id = id;
		this.type = type;
		this.value = value;
	}
}

export class Edge {
	public id: string; // unique id
	public from: string | undefined = undefined; // from
	public to: string | undefined = undefined; // to
	public value = ""; // string
	public root: string; // root node
	constructor(id: string, from: string, to: string, value: string, root: string) {
		this.id = id;
		this.from = from;
		this.to = to;
		this.value = value;
		this.root = root;
	}
}

export class VarNode {
	public id: string; // unique id
	public type: string | undefined = undefined; // data type
	public value: string | object; // data value
	public markersx?: Array<[string, string]>; // markers for x-axis
	public markerLabelPos: Array<[number,number]> = []; // markers label positions
	constructor(id: string, type: string | undefined, value: string | Node) {
		this.id = id;
		this.type = type;
		this.value = value;
	}
}

