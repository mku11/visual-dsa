class GraphsPrimitivesEdges {

    public static runMain() {
        new GraphsPrimitivesEdges().start();
    }

    public start() {
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

        const gmap = new Map<string, [string, string[], string[]]>();
        gmap.set("1", // key
            // value
            ["1", // node
                ["2", "3"], // nodes links
                ["10", "20"] // edges for each link
            ]);
        gmap.set("2", ["2", ["3", "4"], ["30", "40"]]);
        gmap.set("3", ["3", [], []]); // no links
        gmap.set("4", ["4", [], []]);
        gmap.set("5", ["5", [], []]);

        console.log("done");
    }
}

// custom extractor
export class Extractor {
    // register the custom attributes to extract
    public static registerAttrs(): [string, string[]][] {
        return [
            ["Map", ["mapCustomNodes"]],
            ["Array[][]", ["nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue"]],
        ];
    }

    public static extract_mapCustomNodes(
        obj: Map<string, [string, string[], string[]]>,
        root: Map<string, [string, string[], string[]]>
    ): [string, string[], string[]][] {
        const nodes: [string, string[], string[]][] = [];
        for (const value of (root as Map<string, [string, string[], string[]]>).values()) {
            nodes.push(value);
            break;
        }
        return nodes;
    }

    public static extract_nodeCustomNodes(
        obj: [string, string[], string[]],
        root: Map<string, [string, string[], string[]]>
    ): [string, string[], string[]][] {
        const nodes: [string, string[], string[]][] = [];
        if (obj.length >= 2 && obj[1]) {
            for (const id of obj[1]) {
                const nodeObj = root.get(id);
                if (nodeObj) {
                    nodes.push(nodeObj);
                }
            }
        }
        return nodes;
    }
    public static extract_nodeCustomEdges(
        obj: [string, string[], string[]],
        root: Map<string, [string, string[], string[]]>
    ): string[] {
        // edges
        if (obj.length >= 3 && obj[2])
            return obj[2];
        return [];
    }

    public static extract_nodeCustomValue(
        obj: [string, string[], string[]],
        root: Map<string, [string, string[], string[]]>
    ): string[] {
        return [String(obj[0])];
    }
}

GraphsPrimitivesEdges.runMain();