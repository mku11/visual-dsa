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
    public static register(): [string, string[]][] {
        return [
            ["Map", ["customNodes", "customValue"]],
            ["GraphMapNode", ["customNodes", "customEdges", "customValue"]],
        ];
    }

    public static extract(
        type: string,
        attr: string,
        obj: object,
        root: object
    ): string[] | number[] | object[] | undefined {
        if (type === "Map" && attr === "customNodes") {
            const nodes: GraphMapNode<string>[] = [];
            const rootObject = root as Map<GraphMapNode<string>, GraphMapNode<string>[]>;
            for (const key of rootObject.keys())
                nodes.push(key);
            return nodes;
        } else if (type === "Map" && attr === "customValue") {
            let sb = "";
            const objObject = obj as Map<GraphMapNode<string>, GraphMapNode<string>[]>;
            for (const key of objObject.keys()) {
                if (sb.length > 0)
                    sb += ",";
                sb += key.getValue();
            }
            return [sb];
        } else if (type === "GraphMapNode" && attr === "customNodes") {
            const rootObject = root as Map<GraphMapNode<string>, GraphMapNode<string>[]>;
            const objObject = obj as GraphMapNode<string>;
            const nodes: GraphMapNode<string>[] | undefined = rootObject.get(objObject);
            if (nodes)
                return nodes;
        } if (type === "GraphMapNode" && attr === "customEdges") {
            const rootObject = root as Map<GraphMapNode<string>, GraphMapNode<string>[]>;
            const objObject = obj as GraphMapNode<string>;
            const edges: number[] | undefined = [];
            for (const child of rootObject.get(objObject) || []) {
                const edgeKey = objObject.getValue() + "," + child.getValue();
                const edgeValue: number | undefined = Extractor.gedges.get(edgeKey);
                if (edgeValue)
                    edges?.push(edgeValue);
            }
            return edges;
        } else if (type === "GraphMapNode" && attr === "customValue") {
            const objObject = obj as GraphMapNode<string>;
            return [String(objObject.getValue())];
        }
    }
}

GraphMapNodes.runMain();