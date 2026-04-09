class Plot {
    static runMain() {
        new Plot().start();
    }

    start() {
        // 1d array
        // to convert to points:

        // User Settings

        // Expression: arrInt

        // Type: Array[]
        // Layout: Plot
        // Plot Points: @points
        const arrInt: number[] = new Array(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines:

        // User Settings

        // Expression: arrPoints

        // Type: Array[][]
        // Layout: Plot
        // Plot Points: @lines
        const arrPoints: number[][] = [];
        arrPoints.push([2, 4]);
        arrPoints.push([1, 7]);
        arrPoints.push([5, -1]);
        arrPoints.push([-4, -1]);

        // list of lines

        // Expression: arrLines
        const arrLines: number[][] = [];
        arrLines.push([8, 4, 1, 8]);
        arrLines.push([5, -1, 6, 8]);
        arrLines.push([-4, -1, 2, 3]);
        arrLines.push([3, 4, 5, 6]);

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