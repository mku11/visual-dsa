class GraphsPrimitivesEdges {

    public static runMain() {
        new GraphsPrimitivesEdges().test();
    }

    public test() {
        // an example of a graph with hashmap primitives
        // you can use any structure you wish and use the extractor to 
        // bring the data on the ui
        // the value of each key has the node value, the node childern

        // Expression: gmap
        // Layout: Graph
        // Children Nodes: @customNodes
        // Save Object Types

        // Select Object with type Array[][]
        // Layout: Graph
        // Children Nodes: @customNodes
        // Children Edges: @customEdges
        // Save Object Types
        const gmap = new Map<string, [string, string[], string[]] | [string]>();
        gmap.set("1",
            ["1", // node
                ["2", "3"], // nodes links
                ["10", "20"] // corresponding edge label for each node
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
    // you can select these from the ui 
    // instead of modifying your objects
    public static register(): Array<[string, string[]]> {
        return [
            ["Map", ["customNodes"]],
            ["Array[][]", ["customNodes", "customEdges", "customValue"]],
            ["Array[]", ["customNodes"]]
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
                const nodes: object[] = [];
                for (const value of (root as Map<string, object>).values()) {
                    nodes.push(value);
                    break;
                }
                return nodes;
            }
        } else if (type === "Array[][]") {
            if (attr === "customNodes") {
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
            } else if (attr === "customEdges") {
                const objObject = obj as [string, string[], string[]];
                if (objObject.length >= 3 && objObject[2])
                    return objObject[2];
            } else if (attr === "customValue") {
                const objObject = obj as [string, string[], string[]];
                return [String(objObject[0])];
            }
        } else if (type === "Array[]") {
            if (attr === "customValue") {
                const objObject = obj as [string];
                return [String(objObject[0])];
            }
        }
    }
}
GraphsPrimitivesEdges.runMain();