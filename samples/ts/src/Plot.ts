class Arrays {
    static runMain() {
        new Arrays().start();
    }

    start() {
        // 1d array
        // to convert to points:

        // User Settings

        // Expression: arrInt

        // Type: Array[]
        // Layout: Plot
        // Plot Points: @points
        const arrInt: Array<number> = new Array<number>(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines:

        // User Settings

        // Expression: arrPoints

        // Type: Array[][]
        // Layout: Plot
        // Plot Points: @lines
        const arrPoints: Array<Array<number>> = new Array<Array<number>>();
        arrPoints.push([2, 4]);
        arrPoints.push([1, 7]);
        arrPoints.push([5, -1]);
        arrPoints.push([-4, -1]);

        // list of lines

        // Expression: arrLines
        const arrLines: Array<Array<number>> = new Array<Array<number>>();
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
    public static register(): Array<[string, string[]]> {
        return [
            ["Array[]", ["points"]],
            ["Array[][]", ["lines"]]
        ];
    }

    public static extract(
        type: string,
        attr: string,
        obj: object
    ): number[][] | undefined {
        if (type === "Array[]" && attr === "points") {
            const nodes: Array<Array<number>> = [];
            const objObject = obj as Array<number>;
            for (let i = 0; i < objObject.length; i++) {
                if (objObject[i])
                    nodes.push([i, objObject[i]]);
            }
            return nodes;
        }
        else if (type === "Array[][]" && attr === "lines") {
            const nodes: Array<Array<number>> = [];
            const objObject = obj as Array<Array<number>>;
            for (let i = 0; i < objObject.length - 1; i++) {
                nodes.push(objObject[i].concat(objObject[i + 1]));
            }
            return nodes;
        }
    }
}

Arrays.runMain();