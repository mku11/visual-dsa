class GraphsPrimitivesEdges {

    public static runMain() {
        new GraphsPrimitivesEdges().test();
    }

    public test() {
        // It is preferable you use objects since 
        // arrays are used for iterating over node collections.
        // Though you can still use primitive arrays is you wish, see 
        // below an extreme example of a graph using a map with primitives
        // with the help of the Extractor to structure the nodes and edges.

        // UI Settings
        // Expression: gmap

        // Type: Map
        // Layout: Graph
        // Children Nodes: @customNodes

        // Type: Array[][]
        // Layout: Graph
        // Children Nodes: @customNodes
        // Children Edges: @customEdges

        const gmap = new Map<string, [string, string[], string[]] | [string]>();
        gmap.set("1", // key
            // value
            ["1", // node
                ["2", "3"], // nodes links
                ["10", "20"] // edges for each link
            ]);
        gmap.set("2", ["2", ["3", "4"], ["30", "40"]]);
        gmap.set("3", ["3"]); // no links
        gmap.set("4", ["4"]);
        gmap.set("5", ["5"]);

        console.log("done");
    }
}

// custom extractor
export class Extractor {
    // register the custom attributes to extract
    public static register(): Array<[string, string[]]> {
        return [
            ["Map", ["customNodes"]],
            ["Array[][]", ["customNodes", "customEdges", "customValue"]],
            ["Array[]", ["customNodes", "customValue"]]
        ];
    }

    public static extract(
        type: string,
        attr: string,
        obj: object,
        root: object
    ): string[] | object[] | undefined {
        if (type === "Map" && attr === "customNodes") {
            const nodes: object[] = [];
            for (const value of (root as Map<string, object>).values()) {
                nodes.push(value);
                break;
            }
            return nodes;
        } else if (type === "Array[][]" && attr === "customNodes") {
            const objObject: Array<[]> = obj as Array<[]>;
            const rootObject: Map<string, object> = root as Map<string, object>;
            const nodes: object[] = [];
            if (objObject.length >= 2 && objObject[1]) {
                for (const id of objObject[1]) {
                    const nodeObj = rootObject.get(id);
                    if (nodeObj) {
                        nodes.push(nodeObj);
                    }
                }
            }
            return nodes;
        } else if (type === "Array[][]" && attr === "customEdges") {
            // edges
            const objObject = obj as [string, string[], string[]];
            if (objObject.length >= 3 && objObject[2])
                return objObject[2];
        } else if (type === "Array[][]" && attr === "customValue") {
            const objObject = obj as [string, string[], string[]];
            return [String(objObject[0])];
        } else if (type === "Array[]" && attr === "customValue") {
            // value for nodes without links
            const objObject = obj as [string];
            return [String(objObject[0])];
        }
    }
}
GraphsPrimitivesEdges.runMain();