class GraphsPrimitivesEdges {

    public static runMain() {
        new GraphsPrimitivesEdges().test();
    }

    public test() {
        // graph with hashmap primitives
        const gmap = new Map<string, [string, string[], string[]] | [string]>();
        gmap.set("1", ["1", ["2", "3"], ["10", "20"]]);
        gmap.set("2", ["2", ["3", "4"], ["30", "40"]]);
        gmap.set("3", ["3"]);
        gmap.set("4", ["4"]);
        gmap.set("5", ["5"]);

        console.log("done");
    }
}

// custom extractor
export class Extractor {
    // register the custom types
    public static registerTypes(): Array<string> {
        return ["Map", "Array[][]"];
    }

    public static getNodes(
        node: unknown,
        root: Map<string, [string, string[], string[]] | [string]>): object[] {
        if (node instanceof Map) {
            const nodes: object[] = [];
            for (const value of root.values()) {
                nodes.push(value);
                break;
            }
            return nodes;
        } else if (node instanceof Array) {
            const nodes: object[] = [];
            if (!node || node.length == 0) {
                return nodes;
            }
            if (node.length >= 2 && node[1]) {
                for (const id of node[1]) {
                    const nodeObj = root.get(id);
                    if (nodeObj) {
                        nodes.push(nodeObj);
                    }
                }
            }
            return nodes;
        }
        return [];
    }

    public static getEdges(
        node: object,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        root: Map<string, [string, [string, string[], string[]] | [string]]>): Array<string> {
        if (node instanceof Map) {
            return [""];
        } else if (node instanceof Array) {
            const nodeObj = node as [string, string[], string[]] | [string];
            if (nodeObj.length >= 3 && nodeObj[2])
                return nodeObj[2];
        }
        return [];
    }

    public static toString(node: object) {
        if (node instanceof Map) {
            return "";
        } else if (node instanceof Array) {
            return String(node[0]);
        }
        return "";
    }
}
GraphsPrimitivesEdges.runMain();