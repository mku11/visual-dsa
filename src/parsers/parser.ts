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
	private plot: Map<string, Set<string>> = new Map<string, Set<string>>();
	private arrayLayouts: Set<string> = new Set<string>(["array"]);
	private array2DLayouts: Set<string> = new Set<string>(["array2D"]);
	private array3DLayouts: Set<string> = new Set<string>(["array3D"]);
	private stackLayouts: Set<string> = new Set<string>(["stack"]);
	private queueLayouts: Set<string> = new Set<string>(["queue"]);
	private setLayouts: Set<string> = new Set<string>(["set"]);
	private mapLayouts: Set<string> = new Set<string>(["map"]);
	private barsLayouts: Set<string> = new Set<string>(["bars"]);
	private plotLayouts: Set<string> = new Set<string>(["plot"]);
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
		filtersPlot: Map<string, Set<string>>,
		markers: Map<string, string>,
		layouts: Map<string, string>,
		orientations: Map<string, string>
	): Promise<VarNode | undefined> {
		console.log("parse graph: " + variable.name);
		const graph = await this.getGraph(variable, variable,
			0, visited,
			filtersNodes, filtersEdges, filtersProperties, filtersPlot,
			markers, layouts, orientations);
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

	getPlot() {
		return this.plot;
	}

	async getAllVariables(): Promise<Variable[]> {
		let variables: Variable[] = await this.reader.getAllVariables();
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

		const type: string = await this.reader.getNodeType(variable);
		let children: Variable[] = [];
		if (variable.variablesReference > 0) {
			let childrenVars = await this.reader.getVariables(variable, "named");
			if (childrenVars.length == 1 && childrenVars[0].name === '' && childrenVars[0].type === '') {
				childrenVars[0] = this.reader.processVariable(childrenVars[0]);
				childrenVars = await this.reader.getVariables(childrenVars[0]);
			}
			if (childrenVars) {
				for (let childVar of childrenVars) {
					if (this.reader.isIndexed(childVar, variable)) {
						continue;
					}
					if (this.reader.filterVariable(childVar)) {
						continue;
					}
					childVar = this.reader.processVariable(childVar);
					children.push(childVar);
					const childType: string = await this.reader.getNodeType(childVar);
					if (this.reader.isArray(childType) || this.reader.isList(childType)
						|| childVar.indexedVariables > 0) {
						const childArrayVar: Variable = {} as Variable;
						Object.assign(childArrayVar, childVar);
						childArrayVar.name += "[]";
						children.push(childArrayVar);
					}
				}
			}
		}

		// if the variable has a string representation defined it will yield one child without name and type
		if (children.length == 1 && children[0].name === '' && children[0].type === '') {
			const childrenVars = await this.reader.getVariables(children[0], "named");
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

		// add registered custom attributes
		if (this.reader.getRegisteredTypes().has(type)) {
			const attrs: Set<string> | undefined = this.reader.getRegisteredTypes().get(type);
			for (const attr of attrs ?? []) {
				const userDefAttrs: Variable[] | undefined = await this.reader
					.extract(variable, type, attr, rootVariable);
				if (userDefAttrs) {
					this.addNodes(type, "@" + attr);
					this.addEdges(type, "@" + attr);
					this.addProperty(type, "@" + attr);
					this.addPlot(type, "@" + attr);
					for (let userDefNode of userDefAttrs as Variable[]) {
						if (this.reader.filterVariable(userDefNode)) {
							continue;
						}
						userDefNode = this.reader.processVariable(userDefNode);
						children.push(userDefNode);
					}
				}
			}
		}

		for (let child of children) {
			child = this.reader.processVariable(child);

			if (this.reader.filterVariable(child)) {
				continue;
			}
			if (child.type && child.type.length > 0) {
				if (!this.reader.isIndexed(child, variable)) {
					this.addNodes(type, child.name);
				}
				await this.updateTypes(child, rootVariable, level + 1, visited);
			}
			if (variable.type.length > 0 && child.name.length > 0 && isNaN(parseInt(child.name))) {
				this.addProperty(type, child.name);
				this.addEdges(type, child.name);
			}
		}
	}

	addNodes(type: string, name: string) {
		if (!this.nodes.has(type)) {
			this.nodes.set(type, new Set<string>());
		}
		this.nodes.get(type)?.add(name);
	}

	addEdges(type: string, name: string) {
		if (!this.edges.has(type)) {
			this.edges.set(type, new Set<string>());
		}
		this.edges.get(type)?.add(name);
	}

	addProperty(type: string, name: string) {
		if (!this.properties.has(type)) {
			this.properties.set(type, new Set<string>());
		}
		this.properties.get(type)?.add(name);
	}

	addPlot(type: string, name: string) {
		if (!this.plot.has(type)) {
			this.plot.set(type, new Set<string>());
		}
		this.plot.get(type)?.add(name);
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
		filtersPlot: Map<string, Set<string>>,
		markers: Map<string, string>,
		layouts: Map<string, string>,
		orientations: Map<string, string>
	): Promise<VarNode | Node | undefined> {

		variable = this.reader.processVariable(variable);

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

		const filterNodes = filtersNodes.get("id:" + id) ?? filtersNodes.get("type:" + type) ?? new Set();
		const filterEdges = filtersEdges.get("id:" + id) ?? filtersEdges.get("type:" + type) ?? new Set();
		const filterProperties = filtersProperties.get("id:" + id) ?? filtersProperties.get("type:" + type) ?? new Set();
		const filterPlot = filtersPlot.get("id:" + id) ?? filtersPlot.get("type:" + type) ?? new Set();
		const useMarkers = markers.get("id:" + id) ?? markers.get("type:" + type) ?? "";
		const layout = layouts.get("id:" + id) ?? layouts.get("type:" + type) ?? "graph";

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
				const markers = await this.reader.getMarkersValues(useMarkers, layout);
				if (markers) {
					varNode.markers = markers;
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
			const markers = await this.reader.getMarkersValues(useMarkers, layout);
			if (markers) {
				node.markers = markers;
			}
		} else if (this.array2DLayouts.has(layout) || this.plotLayouts.has(layout)) {
			let arrayRepr;
			if (this.plotLayouts.has(layout) && (this.reader.getRegisteredTypes().has(type))) {
				// get user defined plot points
				if (await this.reader.getRegisteredTypes().has(type)) {
					const attrs = this.reader.getRegisteredTypes().get(type);
					for (const attr of attrs ?? []) {
						if (!filterPlot.has("@" + attr)) {
							continue;
						}
						const userDefAttrs: number[][] | undefined = await this.reader.getPlotRepr(variable, type, attr, rootVariable);
						if (userDefAttrs) {
							arrayRepr = userDefAttrs;
						}
					}
				}
			}
			if (!arrayRepr) {
				arrayRepr = await this.reader.getArray2DRepr(variable);
			}
			if (arrayRepr) {
				node.value = arrayRepr;
			}
			const markers = await this.reader.getMarkersValues(useMarkers, layout);
			if (markers) {
				node.markers = markers;
			}
		} else if (this.array3DLayouts.has(layout)) {
			let arrayRepr = await this.reader.getArray3DRepr(variable);
			if (arrayRepr) {
				node.value = arrayRepr;
			}
			const markers = await this.reader.getMarkersValues(useMarkers, layout);
			if (markers) {
				node.markers = markers;
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
		if (await this.reader.getRegisteredTypes().has(type)) {
			const attrs = this.reader.getRegisteredTypes().get(type);
			for (const attr of attrs ?? []) {
				if (!filterNodes.has("@" + attr)) {
					continue;
				}
				const userDefAttrs: Variable[] | undefined = await this.reader
					.extract(variable, type, attr, rootVariable);
				if (userDefAttrs) {
					for (let userDefNode of userDefAttrs) {
						if (this.reader.filterVariable(userDefNode)) {
							continue;
						}
						userDefNode = this.reader.processVariable(userDefNode);
						nodesChildren.push(userDefNode);
					}
				}
			}
		}

		if (variable.variablesReference > 0 && level < Parser.MAX_LEVEL) {
			let children: Variable[] = await this.reader.getVariables(variable);
			// if the variable has a string representation defined it will yield one child without name and type
			if (children.length == 1 && children[0].name === '' && children[0].type === '') {
				children[0] = this.reader.processVariable(children[0], variable.type);
				const newChildren = await this.reader.getVariables(children[0]);
				children = newChildren;
			}
			for (let ch of children) {
				if (this.reader.filterVariable(ch)) {
					continue;
				}
				ch = this.reader.processVariable(ch);

				if (filterNodes.has(ch.name)) {
					nodesChildren.push(ch);
				} else if (filterNodes.has(ch.name + "[]")) {
					if (this.reader.hasChildren(ch) && ch.variablesReference > 0) {
						const grandChildren: Variable[] = await this.reader.getVariables(ch, "indexed");
						for (let grandChild of grandChildren) {
							if (this.reader.filterVariable(grandChild)) {
								continue;
							}
							grandChild = this.reader.processVariable(grandChild);
							nodesChildren.push(grandChild);
						}
					}
				}
				else if ((layout == 'graph' || layout == 'tree' || layout == 'linkedlist')
					&& this.reader.isIndexed(ch, variable) && filterNodes.size == 0
				) {
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
					filtersPlot,
					markers,
					layouts, orientations);
			if (childNode instanceof Node && node instanceof Node) {
				node.children.set(childNode.id, childNode);
				if (!this.reader.isIndexed(child, variable)) {
					const edge = new Edge(node.id + "->" + childNode.id,
						node.id, childNode.id, child.name, rootVariable.name);
					node.childrenEdgeValues.set(childNode.id, edge);
				}
			}
		}

		// if its a linked list we linked the nodes
		if (layout == 'linkedlist' && node.children.size > 1) {
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
							"", rootVariable.name);
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
						"", rootVariable.name);
					node.childrenEdgeValues.set(head.id, edge);
				}
			}
		}

		// get the user defined properties if available
		if (this.reader.getRegisteredTypes().has(type)) {
			const attrs = this.reader.getRegisteredTypes().get(type);
			for (const attr of attrs ?? []) {
				if (!filterProperties.has("@" + attr)) {
					continue;
				}
				const userDefAttr = await this.reader
					.extract(variable, type, attr, rootVariable);
				if (userDefAttr) {
					// for properties we don't expand we expect a 1-element list
					const child = userDefAttr[0];
					// override the name with the attribute name
					child.name = attr;
					const property = new Property(child.name, child.type, child.value);
					node.properties.set(child.name, property);
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

		// get the user defined edges labels if available
		if ((this.reader.getRegisteredTypes().has(type)) && nodesChildren.length > 0) {
			const attrs = this.reader.getRegisteredTypes().get(type);
			for (const attr of attrs ?? []) {
				if (!filterEdges.has("@" + attr)) {
					continue;
				}
				const edgeValues = await this.reader.getVarToVarStrRepr(
					variable, type, rootVariable, nodesChildren, attr);
				if (edgeValues) {
					for (const [childId, edgeValue] of edgeValues) {
						const edge = new Edge(node.id + "->" + childId, node.id, childId,
							edgeValue, rootVariable.name);
						node.childrenEdgeValues.set(childId, edge);
					}
				}
			}
		}

		// get the edges
		let edgeId = 0;
		for (let filterEdge of filterEdges) {
			if (filterEdge.startsWith("@"))
				continue;
			filterEdge = filterEdge.replaceAll("[]", "");
			const edgeValues = await this.reader.getEdgeValues(variable, filterEdge);
			if (edgeValues) {
				for (const [, child] of node.children) {
					const edge = new Edge(node.id + "->" + child.id, node.id, child.id,
						edgeValues[edgeId++], rootVariable.name);
					node.childrenEdgeValues.set(child.id, edge);
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
	public markers?: Array<Array<number>>; // markers for x,y,z axis
	public markerLabelPos: Array<[number, number]> = []; // markers label positions
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
	public markers?: Array<Array<number>>; // markers for x,y,z axis
	public markerLabelPos: Array<[number, number]> = []; // markers label positions
	constructor(id: string, type: string | undefined, value: string | Node) {
		this.id = id;
		this.type = type;
		this.value = value;
	}
}

