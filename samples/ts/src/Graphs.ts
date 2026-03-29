class Graphs {

    public static runMain() {
        new Graphs().test();
    }

    public test() {
        // nodes of a graph
        const gnode0: GraphNode<string> = new GraphNode<string>("0");
        const gnode1: GraphNode<string> = new GraphNode<string>("1");
        const gnode2: GraphNode<string> = new GraphNode<string>("2");
        const gnode3: GraphNode<string> = new GraphNode<string>("3");
        const gnode4: GraphNode<string> = new GraphNode<string>("4");
        gnode0.add(gnode1, 10);
        gnode0.add(gnode2, 20);
        gnode2.add(gnode3, 15);
        gnode3.add(gnode2, 10);
        gnode3.add(gnode4, 25);
        gnode1.add(gnode4, 45);
        gnode4.add(gnode2, 55);

        // // wrap to a graph
        const graph: Graph<string> = new Graph<string>(gnode0);
        const graphRoot: GraphNode<string> = graph.getRoot();
        graphRoot.add(new GraphNode<string>("5"), 11);
        gnode1.add(new GraphNode<string>("6"), 12);
        gnode2.add(new GraphNode<string>("7"), 13);

        Graphs.bfs(gnode0);
    }

    static bfs(node: GraphNode<string>) {
        const q: Array<GraphNode<string>> = new Array<GraphNode<string>>();
        q.push(node);
        const v: Set<GraphNode<string>> = new Set<GraphNode<string>>();
        let steps = 0;
        let size = q.length;
        while (q.length > 0) {
            const x: GraphNode<string> | undefined = q.shift();
            if (!x) {
                continue;
            }
            size--;
            for (const child of x.children) {
                if (v.has(child))
                    continue;
                q.push(child);
                v.add(child);
            }
            if (size == 0) {
                steps++;
                size = q.length;
                console.log("steps: ", steps);
            }
        }
    }
}

export class Graph<T> {

    private root: GraphNode<T>;

    public constructor(root: GraphNode<T>) {
        this.root = root;
    }

    public getRoot(): GraphNode<T> {
        return this.root;
    }
}

export class GraphNode<T> {

    private value: T;

    public getValue(): T {
        return this.value;
    }

    public children: Array<GraphNode<T>> = new Array<GraphNode<T>>();
    public childrenCost: Array<number> = new Array<number>();

    public constructor(value: T) {
        this.value = value;
    }

    public add(node: GraphNode<T>, cost: number) {
        this.children.push(node);
        this.childrenCost.push(cost);
    }

    public toString(): string {
        return String(this.value);
    }
}

// custom extractor
export class Extractor {
    // register the custom types
    public static registerTypes(): string[] {
        return ["GraphNode"];
    }

    public static toString(node: object): string {
        if (node instanceof GraphNode) {
            return (node as GraphNode<string>).getValue().toString();
        }
        return "";
    }
}
Graphs.runMain();