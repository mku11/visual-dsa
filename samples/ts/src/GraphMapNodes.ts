class GraphMapNodes {

    public static runMain() {
        new GraphMapNodes().start();
    }

    public start() {
        // graph with hashmap node

        // Expression: gmap

        // Type: Map
        // Layout: Graph

        // Type: GraphMapNode
        // Layout: Graph
        // Nodes: @customNodes
        // Edges: @customEdges
        const gmap: Map<GraphMapNode<string>, GraphMapNode<string>[]> = new Map<GraphMapNode<string>, GraphMapNode<string>[]>();
        const gedges: Map<string, number> = new Map<string, number>(); // edges 
        Extractor.gedges = gedges;

        // nodes
        const node1: GraphMapNode<string> = new GraphMapNode<string>("1");
        const node2: GraphMapNode<string> = new GraphMapNode<string>("2");
        const node3: GraphMapNode<string> = new GraphMapNode<string>("3");
        const node4: GraphMapNode<string> = new GraphMapNode<string>("4");
        gmap.set(node1, [node2, node3]);
        gmap.set(node2, [node3, node4]);
        gmap.set(node3, []);
        gmap.set(node4, []);

        // edges
        gedges.set(node1.getValue() + "," + node2.getValue(), 100);
        gedges.set(node1.getValue() + "," + node3.getValue(), 200);
        gedges.set(node2.getValue() + "," + node3.getValue(), 300);
        gedges.set(node2.getValue() + "," + node4.getValue(), 400);

        console.log("done");
    }
}

export class GraphMapNode<T> {

    private value: T;

    public getValue(): T {
        return this.value;
    }

    public constructor(value: T) {
        this.value = value;
    }

    public toString() {
        return this.value;
    }
}


// custom extractor
export class Extractor {
    static gedges: Map<string, number>;

    // register the custom attributes to extract
    // you can select these from the ui 
    // instead of modifying your objects
    public static registerAttrs(): [string, string[]][] {
        return [
            ["Map", ["mapCustomNodes", "mapCustomValue"]],
            ["GraphMapNode", ["nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue"]],
        ];
    }

    public static extract_mapCustomNodes(
        obj: object,
        root: Map<GraphMapNode<string>, GraphMapNode<string>[]>
    ): GraphMapNode<string>[] {
        const nodes: GraphMapNode<string>[] = [];
        for (const key of root.keys())
            nodes.push(key);
        return nodes;
    }

    public static extract_mapCustomValue(
        obj: Map<GraphMapNode<string>, GraphMapNode<string>[]>,
        root: Map<GraphMapNode<string>, GraphMapNode<string>[]>
    ): string[] {
        let sb = "";
        for (const key of obj.keys()) {
            if (sb.length > 0)
                sb += ",";
            sb += key.getValue();
        }
        return [sb];
    }

    public static extract_nodeCustomNodes(
        obj: GraphMapNode<string>,
        root: Map<GraphMapNode<string>, GraphMapNode<string>[]>
    ): GraphMapNode<string>[] {
        return root.get(obj) || [];
    }

    public static extract_nodeCustomEdges(
        obj: GraphMapNode<string>,
        root: Map<GraphMapNode<string>, GraphMapNode<string>[]>
    ): number[] {
        const edges: number[] = [];
        for (const child of root.get(obj) || []) {
            const edgeKey = obj.getValue() + "," + child.getValue();
            const edgeValue: number | undefined = Extractor.gedges.get(edgeKey);
            if (edgeValue)
                edges?.push(edgeValue);
        }
        return edges;
    }

    public static extract_nodeCustomValue(
        obj: GraphMapNode<string>,
        root: Map<GraphMapNode<string>, GraphMapNode<string>[]>
    ): string[] {
        return [String(obj.getValue())];
    }
}

GraphMapNodes.runMain();