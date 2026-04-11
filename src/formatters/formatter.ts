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

import { VarNode, Node, Edge } from "../parsers/parser";
import { Range } from "../readers/reader";

export class Formatter {
	static readonly MAX_STR_LEN = 60;
	static readonly BARS_ROWS = 10;
	static readonly PLOT_ROWS = 40;
	static readonly PLOT_COLS = 80;
	static graphLayouts = new Set<string>(["graph", "tree", "linkedlist"]);
	static barLayouts = new Set<string>(["bars"]);
	static plotLayouts = new Set<string>(["plot"]);
	static edgeColors = ["#6466f3", "#f35e5e", "#ecad4d", "#55f050"];
	varNodePosX = 0;
	varNodePosY = 0;



	convert(varNodes: VarNode[],
		selectedLayouts: Map<string, string>,
		selectedOrientations: Map<string, string>): VisData {
		const nodes: Map<string, VisNode> = new Map<string, VisNode>();
		const edges: Map<string, VisEdge> = new Map<string, VisEdge>();
		const visited: Set<string> = new Set<string>();
		this.varNodePosX = 0;

		let idx = 0;
		const colors: Map<string, string> = new Map<string, string>();
		for (const varNode of varNodes) {
			colors.set(varNode.id, Formatter.edgeColors[idx++]);
		}

		for (const varNode of varNodes) {
			console.log("convert: " + varNode.id);
			this.convertNodesEdges(varNode,
				varNode,
				nodes, edges,
				selectedLayouts,
				selectedOrientations,
				visited, 0, colors);
		}

		const visData: VisData = new VisData(
			Array.from(nodes.values()),
			Array.from(edges.values()));
		return visData;
	}

	convertNodesEdges(
		node: VarNode | Node,
		root: VarNode | Node,
		nodes: Map<string, VisNode>,
		edges: Map<string, VisEdge>,
		layouts: Map<string, string>,
		orientations: Map<string, string>,
		visited: Set<string>,
		level = 0,
		colors: Map<string, string>,) {
		if (!node) {
			return;
		}
		const layout = layouts.get("id:" + node.id!) ?? layouts.get("type:" + node.type!) ?? "none";
		const orientation = orientations.get("id:" + node.id!) ?? orientations.get("type:" + node.type!) ?? "horizontal";
		let visNode: VisNode | undefined = undefined;
		if (visited.has(node.id)) {
			return;
		} else if (node.id && nodes.has(node.id)) {
			visNode = nodes.get(node.id);
			if (visNode && visNode.level < level) {
				visNode.level = level;
			}
		} else {
			visNode = new VisNode(node.id, this.getLabel(node,
				layout, orientation));
			if (node.markerLabelPos) {
				for (const [start, end] of node.markerLabelPos)
					visNode.labelMarkers.push(new Diff(start, end));
			}
			if (Formatter.barLayouts.has(layout) && node instanceof Node) {
				visNode.bars = (node.value as []).map(x => parseFloat(x));
			} else if (Formatter.plotLayouts.has(layout) && node instanceof Node) {
				if (node.value instanceof Array && node.value.length > 0) {
					// list of lines: [[x1,y1,x2,y2],[],...]
					// list of points: [[x1,y1],[],...]
					visNode.points = (node.value as [][]).map(el =>
						el.map(c => parseFloat(c)));
				}
			}
			visNode.level = level;
			if (node instanceof VarNode) {
				visNode.group = 'VarNode';
				visNode.x = this.varNodePosX;
				this.varNodePosX += 100;
				visNode.y = 0;
			} else if (node instanceof Node) {
				visNode.group = 'Node';
			}
			nodes.set(node.id, visNode);
		}
		visited.add(node.id);
		if (level > 0 && (!layout || !Formatter.graphLayouts.has(layout))) {
			return;
		}

		let children: Map<string, Node> = new Map<string, Node>();
		if (node instanceof VarNode && node.value instanceof Node) {
			children.set("", node.value);
		} else if (node instanceof Node) {
			children = node.children;
		}
		for (const [childName, child] of children) {
			this.convertNodesEdges(child,
				root,
				nodes, edges,
				layouts, orientations,
				visited, level + 1, colors);
			const edgeId: string = node.id + "->" + child.id;
			const revEdgeId: string = child.id + "->" + node.id;
			if (!edges.has(edgeId)) {
				const visEdge: VisEdge = this.createEdge(edgeId, childName, node, child);
				const revVisEdge = edges.get(revEdgeId);
				if (revVisEdge) {
					revVisEdge.smooth = new SmoothEdge("curvedCW", 0.2);
					visEdge.smooth = new SmoothEdge("curvedCW", 0.2);
				}
				visEdge.arrows = new Arrows();
				if (node instanceof Node) {
					const edge: Edge | undefined = node.childrenEdgeValues.get(child.id);
					if (edge) {
						visEdge.label = this.getEdgeLabel(node, child);
						visEdge.color = this.getEdgeColor(node, child, colors.get(edge.root)!);
					} else {
						visEdge.color = this.getEdgeColor(node, child, colors.get(root.id) ?? "");
					}
				} else {
					visEdge.color = this.getEdgeColor(node, child, colors.get(root.id) ?? "");
				}
				edges.set(edgeId, visEdge);
			}
		}
	}

	getEdgeLabel(node: Node, child: Node): string {
		if (!(node instanceof VarNode) && node.type && node.type in this.getHashTypes()) {
			return "";
		}
		const edge: Edge | undefined = node.childrenEdgeValues.get(child.id)!;
		let label = edge.value;
		if (label.startsWith("\"") && label.endsWith("\"")) {
			label = label.substring(1, label.length - 1);
		}
		return label;
	}

	public getHashTypes() {
		return new Set();
	}

	createEdge(edgeId: string, childName: string, node: VarNode | Node, child: Node): VisEdge {
		if (!(node instanceof VarNode) && node.type && node.type in this.getHashTypes()) {
			return new VisEdge(edgeId, "", node.id, child.id);
		}
		return new VisEdge(edgeId, "", node.id, child.id);
	}

	getEdgeColor(node: VarNode | Node, child: Node, color: string): Color | undefined {
		if (!(node instanceof VarNode) && node.type && node.type in this.getHashTypes()) {
			const color = new Color('#2d2d30');
			color.opacity = 0.0;
			return color;
		}
		const colorObj = new Color(color);
		return colorObj;
	}

	getLabel(node: VarNode | Node,
		layout: string | undefined,
		orientation: string | undefined): string {
		let label = node.id;
		if (node.type) {
			label += "\n";
			label += "Type: " + this.wrapString(node.type);
		}
		if (node.value && !(node.value instanceof Node)) {
			label += "\n";
			label += "------\n";
			label += "Value:\n";
			const [labelMarkers, lbl] = this.getLabelValue(node, layout, orientation);
			if (labelMarkers) {
				// add the markers for the label and the offset
				for (const [x, y] of labelMarkers)
					node.markerLabelPos.push([x + label.length, y + label.length]);
			}
			label += lbl;
		}

		if (node instanceof Node) {
			// child property values
			let props = "";
			for (const [, child] of node.properties) {
				props += "\n";
				props += child.name ? child.name : "Unknown";
				props += " : " + (child.type ? child.type : "Unknown");
				props += " = " + this.truncate(child.value ? child.value : "");
				if (child.strRepr) {
					// if it's multiline we display in a new line
					if (child.strRepr.includes("\n")) {
						props += "\n";
						props += child.strRepr;
					} else {
						props += " (" + child.strRepr + ")";
					}
				}
			}

			if (props.length > 0) {
				label += "\n";
				label += "------\n";
				label += "Properties:";
				label += props;
			}
		}
		return label;
	}

	wrapString(text: string): string {
		let newText = "";
		let last = 0;
		while (text.substring(last).length > Formatter.MAX_STR_LEN) {
			newText += text.substring(last, last + Formatter.MAX_STR_LEN) + "\n";
			last += Formatter.MAX_STR_LEN;
		}
		newText += text.substring(last);
		return newText;
	}

	getLabelValue(node: VarNode | Node,
		layout?: string, orientation?: string): [[number, number][], string] {
		const value: string | object = node.value;
		const markers = node.markers;

		if (typeof (value) === 'string') {
			return [[], this.formatString(value)];
		} else if (layout === 'array3D') {
			return this.formatArray3D(value as string[][][], node.ranges,
				markers);
		} else if (layout === 'array2D') {
			return this.formatArray2D(value as string[][], node.ranges,
				markers);
		} else if (layout === 'array') {
			return this.formatArray(value as string[], node.ranges[0],
				orientation, markers ? markers[0] : undefined);
		} else if (layout === 'queue') {
			return this.formatArray(value as string[], node.ranges[0],
				"horizontal", markers ? markers[0] : undefined);
		} else if (layout === 'map') {
			return [[], this.formatMap(value as string[][])];
		} else if (layout === 'set') {
			return this.formatArray(value as string[], node.ranges[0],
				orientation, markers ? markers[0] : undefined);
		} else if (layout === 'stack') {
			return this.formatArray(value as string[], node.ranges[0],
				"vertical", markers ? markers[0] : undefined, true);
		} else if (layout === 'bars') {
			return [[], this.formatBars(value as string[], node.ranges[0],
				markers ? markers[0] : undefined)];
		} else if (layout && Formatter.plotLayouts.has(layout)) {
			return [[], this.formatPlot()];
		}
		return [[], ""];
	}

	formatBars(value: string[], range: Range, markers?: number[]): string {
		let barsRepr = "";
		for (let i = 0; i < Formatter.BARS_ROWS; i++) {
			barsRepr += "\n";
		}
		const arrRepr = this.formatArray(value, range, "horizontal", markers);
		return barsRepr += arrRepr;
	}

	formatPlot(): string {
		let plotRepr = "";
		for (let i = 0; i < Formatter.PLOT_ROWS; i++) {
			plotRepr += " ".repeat(Formatter.PLOT_COLS) + "\n";
		}
		return plotRepr;
	}

	truncate(text: string): string {
		if (text.length > Formatter.MAX_STR_LEN) {
			return text.substring(0, Formatter.MAX_STR_LEN) + "...";
		}
		return text;
	}

	formatString(text: string): string {
		let newText = "";
		let pad = 0;
		for (const line of text.split("\n")) {
			if (line.length > Formatter.MAX_STR_LEN) {
				pad = Formatter.MAX_STR_LEN + 3;
			} else {
				pad = Math.max(line.length, pad);
			}
		}

		for (let line of text.split("\n")) {
			if (line.length > Formatter.MAX_STR_LEN) {
				line = line.substring(0, Formatter.MAX_STR_LEN) + "...";
			}
			line = line.padEnd(pad);
			newText += line + "\n";
		}
		return newText;
	}

	formatArray(arr: string[],
		range?: Range,
		orientation?: string,
		markers?: number[] | undefined,
		reverse?: boolean,
	): [[number, number][], string] {
		let arrRepr = "";
		let arrPadRepr = String(arr.length).length;
		const arrPadHeaderRepr = String(arr.length).length;
		const markerPos: [number, number][] = [];
		const indexes = new Set<number>();
		const start = range ? range.start : 0;
		if (markers) {
			for (const marker of markers) {
				const ind = marker;
				if (isNaN(ind) || ind < 0 || ind - start >= arr.length)
					continue;
				indexes.add(ind);
			}
		}
		for (let idx = 0; idx < arr.length; idx++) {
			const len = String(arr[idx]).length;
			arrPadRepr = Math.max(len, arrPadRepr);
		}
		if (orientation === 'horizontal') {
			for (let idx = 0; idx < arr.length; idx++) {
				const header = String(start + idx);
				if (!reverse) {
					arrRepr += ' ';
					arrRepr += header.padStart(arrPadRepr);
				} else {
					arrRepr = ' ' + arrRepr;
					arrRepr = header.padStart(arrPadRepr) + arrRepr;
				}
			}
			if (!reverse) {
				arrRepr += "\n";
			} else {
				arrRepr = "\n" + arrRepr;
			}

			// underline
			for (let idx = 0; idx < arr.length; idx++) {
				if (!reverse) {
					arrRepr += '-';
					arrRepr += '-'.padStart(arrPadRepr, '-');
				} else {
					arrRepr = '-' + arrRepr;
					arrRepr = '-'.padStart(arrPadRepr, '-') + arrRepr;
				}
			}
			if (!reverse) {
				arrRepr += "\n";
			} else {
				arrRepr = "\n" + arrRepr;
			}
		}
		let idx = 0;
		for (const elRepr of arr) {
			if (arrRepr.length > 0) {
				if (orientation === 'horizontal') {
					if (!reverse) {
						arrRepr += '|';
					} else {
						arrRepr = '|' + arrRepr;
					}
				} else if (orientation === 'vertical') {
					if (!reverse) {
						arrRepr += '\n';
						arrRepr += String(start + idx).padStart(arrPadHeaderRepr) + ": ";
					} else {
						arrRepr = '\n' + arrRepr;
						arrRepr = String(start + idx).padStart(arrPadHeaderRepr) + ": " + arrRepr;
					}
				}
			}
			const cell = String(elRepr).padStart(arrPadRepr);
			if (indexes.has(start + idx)) {
				markerPos.push([arrRepr.length, arrRepr.length + cell.length]);
			}
			arrRepr += cell;
			idx++;
		}
		return [markerPos, arrRepr];
	}

	formatArray2D(arr2D: string[][],
		ranges?: Range[],
		markers?: number[][]
	): [[number, number][], string] {
		let arr2DRepr = "";
		let arr2DRepr2 = "";
		let maxLength = 0;
		let arr2DPadRepr = 0;
		let arr2DPadHeaderVertRepr = String(arr2D.length).length;
		const markerPos: [number, number][] = [];
		const indexes: Set<string> = new Set<string>();
		let startX = 0;
		let startY = 0;
		if (ranges && ranges.length == 2) {
			startX = ranges[0].start;
			startY = ranges[1].start;
		}
		if (markers) {
			for (const marker of markers) {
				const [indX, indY] = marker;
				if (isNaN(indY) || indY < 0 || indY - startY >= arr2D.length)
					continue;
				if (isNaN(indX) || indX < 0 || indX - startX >= arr2D[indY].length)
					continue;
				indexes.add(marker.toString());
			}
		}

		for (let idx = 0; idx < arr2D.length; idx++) {
			const elRepr = arr2D[idx];
			if (!elRepr) {
				continue;
			}
			maxLength = Math.max(maxLength, elRepr.length);
			for (let idx2 = 0; idx2 < elRepr.length; idx2++) {
				const elRepr2 = arr2D[idx][idx2];
				const len = String(startY + idx2).length;
				arr2DPadRepr = Math.max(arr2DPadRepr, len);
				arr2DPadRepr = Math.max(arr2DPadRepr, elRepr2.length);
			}
			arr2DPadRepr = Math.max(arr2DPadRepr, String(elRepr.length).length);

			const len2 = String(startX + idx).length;
			arr2DPadHeaderVertRepr = Math.max(arr2DPadHeaderVertRepr, len2);
		}
		for (let arr2DIdx = -1; arr2DIdx < arr2D.length; arr2DIdx++) {
			arr2DRepr2 = "";
			if (arr2DRepr.length > 0) {
				arr2DRepr += "\n";
			}
			for (let arr2DIdx2 = -1; arr2DIdx2 < maxLength; arr2DIdx2++) {
				const marked: [number, number] = [0, 0];
				if (indexes.has([startX + arr2DIdx2, startY + arr2DIdx].toString())) {
					marked[0] = arr2DRepr.length + arr2DRepr2.length;
				}
				if (arr2DIdx == -1 && arr2DIdx2 == -1) {
					arr2DRepr2 += ' '.padStart(arr2DPadHeaderVertRepr);
				} else if (arr2DIdx == -1) {
					const header = String(startX + arr2DIdx2);
					arr2DRepr2 += header.padStart(arr2DPadRepr);
				} else if (arr2DIdx2 == -1) {
					const header = String(startY + arr2DIdx);
					arr2DRepr2 += header.padStart(arr2DPadHeaderVertRepr);
				} else {
					let value = new String();
					if (arr2DIdx < arr2D.length && arr2D[arr2DIdx] != null
						&& arr2DIdx2 < arr2D[arr2DIdx].length) {
						value = String(arr2D[arr2DIdx][arr2DIdx2]);
					}
					arr2DRepr2 += String(value).padStart(arr2DPadRepr);
				}

				// end of marker
				if (indexes.has([startX + arr2DIdx2, startY + arr2DIdx].toString())) {
					marked[1] = arr2DRepr.length + arr2DRepr2.length;
					markerPos.push(marked);
				}

				if (arr2DIdx == -1) {
					arr2DRepr2 += ' ';
				} else {
					arr2DRepr2 += '|';
				}
			}

			if (arr2DIdx == -1) {
				arr2DRepr2 += "\n";
				arr2DRepr2 += " ";
				for (let arr2DIdx2 = 0; arr2DIdx2 <= maxLength; arr2DIdx2++) {
					if (arr2DIdx2 == 0) {
						arr2DRepr2 += ' '.padStart(arr2DPadHeaderVertRepr, ' ');
					} else {
						arr2DRepr2 += '-';
						arr2DRepr2 += '-'.padStart(arr2DPadRepr, '-');
					}
				}
			}
			arr2DRepr += arr2DRepr2;
		}
		return [markerPos, arr2DRepr];
	}

	formatArray3D(arr3D: string[][][],
		ranges: Range[],
		markers?: number[][]
	): [[number, number][], string] {
		let arr3DRepr = "";
		let startZ = 0;
		if (ranges && ranges.length == 3) {
			startZ = ranges[2].start;
		}

		// index the markers for easier lookup
		const indexesZ = new Map<number, number[][]>();
		if (markers) {
			for (const marker of markers) {
				if (marker.length != 3)
					continue;
				const ind = marker[2];
				if (isNaN(ind) || ind < 0 || ind - startZ >= arr3D.length)
					continue;
				let list = indexesZ.get(ind);
				if (list) {
					list.push(marker.slice(0, 2));
				} else {
					list = [marker.slice(0, 2)];
					indexesZ.set(ind, list);
				}
			}
		}

		const markerPos: [number, number][] = [];
		for (let i = 0; i < arr3D.length; i++) {
			// pass the indexes only if z dimension has a marker
			const [markersPosXY, arr2DRepr] = this.formatArray2D(arr3D[i], 
				ranges.slice(0,2),
				indexesZ.has(startZ + i) ? indexesZ.get(startZ + i) : []);
			if (!arr2DRepr)
				continue;
			if (arr3DRepr.length > 0) {
				arr3DRepr += "\n\n";
			}
			const header = "Z:" + i;
			if (indexesZ.has(startZ + i))
				markerPos.push([arr3DRepr.length, arr3DRepr.length + header.length]);
			arr3DRepr += header;
			arr3DRepr += "\n";
			for (const [start, end] of markersPosXY) {
				markerPos.push([start + arr3DRepr.length, end + arr3DRepr.length]);
			}
			arr3DRepr += arr2DRepr;
		}
		return [markerPos, arr3DRepr];
	}

	formatMap(arr: string[][]): string {
		let arrRepr = "";
		let kPadRepr = 0;
		let vPadRepr = 0;
		for (const [k, v] of arr) {
			kPadRepr = Math.max(String(k).length, kPadRepr);
			vPadRepr = Math.max(String(v).length, vPadRepr);
		}

		for (const [k, v] of arr) {
			if (arrRepr.length > 0) {
				arrRepr += '\n';
			}
			arrRepr += String(k).padStart(kPadRepr) + ":"
				+ String(v).padStart(vPadRepr);
		}
		return arrRepr;
	}
}

export class VisData {
	public nodes: VisNode[] = [];
	public edges: VisEdge[] = [];
	public source: string[] = [];
	constructor(
		nodes: VisNode[],
		edges: VisEdge[]) {
		this.nodes = nodes;
		this.edges = edges;
	}
}

export class VisDiffData {
	public newNodes: VisNode[] = [];
	public updateNodes: VisNode[] = [];
	public removeNodes: VisNode[] = [];
	public newEdges: VisEdge[] = [];
	public updateEdges: VisEdge[] = [];
	public removeEdges: VisEdge[] = [];
	public source: string[] = [];
}

export class VisNode {
	public id: string;
	public label: string;
	public labelDiff: Diff[] = [];
	public labelMarkers: Diff[] = [];
	public bars: number[] = [];
	public points: number[][] = [];
	public group: string | undefined = undefined;
	public x: number | undefined = undefined;
	public y: number | undefined = undefined;
	public level = 0;
	constructor(id: string,
		label: string, group = undefined) {
		this.id = id;
		this.label = label;
		this.group = group;
	}
}

export class Diff {
	public start = 0;
	public end = 0;
	constructor(start: number, end: number) {
		this.start = start;
		this.end = end;
	}
}

export class SmoothEdge {
	public type: string;
	public roundness: number;
	constructor(type: string, roundness: number) {
		this.type = type;
		this.roundness = roundness;
	}
}

export class VisEdge {
	public id: string;
	public label: string;
	public from: string;
	public to: string;
	public color: Color | undefined = undefined;
	public arrows: Arrows | undefined = undefined;
	public smooth: SmoothEdge | false = false;

	constructor(id: string,
		label: string,
		from: string,
		to: string,
		arrows?: Arrows,
		color?: Color) {
		this.id = id;
		this.label = label;
		this.from = from;
		this.to = to;
		this.arrows = arrows;
		this.color = color;
	}
}

export class Arrows {
	to = {
		enabled: true,
		type: 'arrow'
	};
}

export class Color {
	color: string | undefined = undefined;
	highlight: string | undefined = undefined;
	hover: string | undefined = undefined;
	opacity: number | undefined = undefined;

	constructor(color?: string,
		highlight?: string,
		hover?: string,
		opacity?: number) {
		this.color = color;
		this.highlight = highlight;
		this.hover = hover;
		this.opacity = opacity;
	}
}

