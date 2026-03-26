class Arrays {
    static runMain() {
        new Arrays().test();
    }

    test() {
        // 1d array
        // to convert to points see Extractor
        const arrInt: Array<number> = new Array<number>(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines see Extractor
        const points: Array<Array<number>> = new Array<Array<number>>();
        points.push([2, 4]);
        points.push([1, 7]);
        points.push([5, -1]);
        points.push([-4, -1]);

        // list of lines
        const lines: Array<Array<number>> = new Array<Array<number>>();
        lines.push([8, 4, 1, 8]);
        lines.push([5, -1, 6, 8]);
        lines.push([-4, -1, 2, 3]);
        lines.push([3, 4, 5, 6]);

        console.log("done");
    }
}

// custom extractor
export class Extractor {

    // register the types
    public static registerTypes(): Array<string> {
        return [
            // uncomment for custom conversions, see below
            "Array[]", "Array[][]"
        ];
    }

    public static getPlotPoints(
        obj: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        root: unknown): Array<Array<number>> | null {
        if (!(obj instanceof Array))
            return null;


        if (obj[0] instanceof Array) {
            return null;
        }

        // convert list of numbers to list of points (i,xi)
        const nodes: Array<Array<number>> = [];
        for (let i = 0; i < obj.length; i++) {
            if(obj[i])
                nodes.push([i, parseInt(obj[i])]);
        }
        return nodes;
    }

    public static getPlotLines(
        obj: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        root: unknown): Array<Array<number>> | null{
        if (!(obj instanceof Array))
            return null;

        if (!(obj[0] instanceof Array) || obj[0].length != 2) {
            return null;
        }

        // convert list of points to list of lines
        const nodes: Array<Array<number>> = [];
        for (let i = 0; i < obj.length - 1; i++) {
            nodes.push(obj[i].concat(obj[i + 1]));
        }
        return nodes;
    }
}

Arrays.runMain();