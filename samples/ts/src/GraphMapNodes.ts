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
}

// custom extractor
export class Extractor {
    // register the custom types
    public static registerTypes(): Array<string> {
        return ["Map", "GraphMapNode", "*"];
    }

    public static getNodes(
        node: Map<GraphMapNode<string>, Array<GraphMapNode<string>>>
            | GraphMapNode<string>,
        root: Map<GraphMapNode<string>, Array<GraphMapNode<string>>>):
        Array<GraphMapNode<string>> {
        if (node instanceof Map) {
            const nodes: Array<GraphMapNode<string>> = new Array<GraphMapNode<string>>();
            for (const key of root.keys())
                nodes.push(key);
            return nodes;
        } else if (node instanceof GraphMapNode) {
            const nodes: Array<GraphMapNode<string>> | undefined = root.get(node);
            if (nodes)
                return nodes;
        }
        return [];
    }

    public static toString(node: object): string {
        if (node instanceof Map) {
            let sb = "";
            const nodeObj = node as Map<GraphMapNode<string>, Array<GraphMapNode<string>>>;
            for (const key of nodeObj.keys()) {
                if(sb.length > 0)
                    sb += "\n";
                sb += key.getValue();
            }
            return sb;
        } else if (node instanceof GraphMapNode) {
            return String(node.getValue());
        }
        return "";
    }
}
GraphMapNodes.runMain();