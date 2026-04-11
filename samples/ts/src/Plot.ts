
// UI settings
// Expression: arrInt
//   Type: Array[]
//     Layout: Plot
//     Points: @points
//     Save: Object Attributes

// Expression: points
//   Type: Array[][]
//     Layout: Plot
//     Save: Object Attributes

// Expression: points
//   Type: Array[][]
//     Layout: Plot
//     Points: @lines
//     Save: Object Attributes

// Expression: lines
//   Type: Array[][]
//     Layout: Plot
//     Save: Object Attributes

// Note: format for plotting:
// To plot points: [[x1,y1],[x2,y2],...]
// To plot lines: [[x1,y1,x2,y2],[x3,y3,x4,y4],...]

class Plot {
    static runMain() {
        new Plot().start();
    }

    start() {
        // 1d array
        // to convert to points see Extractor
        const arrInt: number[] = new Array(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines see Extractor
        const points: number[][] = [];
        points.push([2, 4]);
        points.push([1, 7]);
        points.push([5, -1]);
        points.push([-4, -1]);

        // list of lines
        const lines: number[][] = [];
        lines.push([8, 4, 1, 8]);
        lines.push([5, -1, 6, 8]);
        lines.push([-4, -1, 2, 3]);
        lines.push([3, 4, 5, 6]);

        console.log("done");
    }
}

// custom extractor
export class Extractor {

    // register the custom attributes to extract
    // you can select these from the ui 
    // instead of modifying your objects
    public static registerAttrs(): [string, string[]][] {
        return [
            ["Array[]", ["points"]],
            ["Array[][]", ["lines"]]
        ];
    }

    public static extract_points(
        obj: number[],
        root: object
    ): number[][] | undefined {
        const nodes: number[][] = [];
        for (let i = 0; i < obj.length; i++) {
            if (obj[i])
                nodes.push([i, obj[i]]);
        }
        return nodes;
    }

    public static extract_lines(
        obj: number[][],
        root: object
    ): number[][] | undefined {
        const nodes: number[][] = [];
        for (let i = 0; i < obj.length - 1; i++) {
            nodes.push(obj[i].concat(obj[i + 1]));
        }
        return nodes;
    }
}

Plot.runMain();