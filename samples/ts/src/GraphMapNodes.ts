class GraphMapNodes {

    public static runMain() {

        // graph with hashmap node
        const gmap = new Map<GraphMapNode<string>, Array<GraphMapNode<string>>>();
        const node1: GraphMapNode<string> = new GraphMapNode<string>("1");
        const node2: GraphMapNode<string> = new GraphMapNode<string>("2");
        const node3: GraphMapNode<string> = new GraphMapNode<string>("3");
        const node4: GraphMapNode<string> = new GraphMapNode<string>("4");

        gmap.set(node1, [node2, node3]);
        gmap.set(node2, [node3, node4]);
        gmap.set(node3, []);
        gmap.set(node4, []);
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
    // register the custom attributes to extract
    // you can select these from the ui 
    // instead of modifying your objects
    public static register(): Array<[string, string[]]> {
        return [
            ["Map", ["customNodes", "customValue"]],
            ["GraphMapNode", ["customNodes", "customValue"]],
        ];
    }

    public static extract(
        type: string,
        attr: string,
        obj: object,
        root: object
    ): string[] | object[] | undefined {
        if (type === "Map") {
            if (attr === "customNodes") {
                const nodes: Array<GraphMapNode<string>> = new Array<GraphMapNode<string>>();
                const rootObject = root as Map<GraphMapNode<string>, Array<GraphMapNode<string>>>;
                for (const key of rootObject.keys())
                    nodes.push(key);
                return nodes;
            } else if (attr === "customValue") {
                let sb = "";
                const objObject = obj as Map<GraphMapNode<string>, Array<GraphMapNode<string>>>;
                for (const key of objObject.keys()) {
                    if (sb.length > 0)
                        sb += "\n";
                    sb += key.getValue();
                }
                return [sb];
            }
        } else if (type === "GraphMapNode") {
            if (attr === "customNodes") {
                const rootObject = root as Map<GraphMapNode<string>, Array<GraphMapNode<string>>>;
                const objObject = obj as GraphMapNode<string>;
                const nodes: Array<GraphMapNode<string>> | undefined = rootObject.get(objObject);
                if (nodes)
                    return nodes;
            } else if (attr === "customValue") {
                const objObject = obj as GraphMapNode<string>;
                return [String(objObject.getValue())];
            }
        }
    }
}

GraphMapNodes.runMain();