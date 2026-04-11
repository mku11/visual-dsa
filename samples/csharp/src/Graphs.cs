using System;
using System.Collections.Generic;

// UI settings
// Expression: graph
//   Type: Graphs.Graph<string>
//     Layout: Graph
//     Nodes: Root
//     Save: Object Type Attributes
//   Type: Graphs.GraphNode<string>
//     Layout: Graph
//     Nodes: children[]
//     Edges: childrenCost[]
//     Properties: value
//     Save: Object Type Attributes
internal class Graphs
{
    public static void RunMain(string[] args)
    {
        new Graphs().Start();
    }

    public void Start()
    {
        // nodes of a graph
        GraphNode<string> gnode0 = new GraphNode<string>("0");
        GraphNode<string> gnode1 = new GraphNode<string>("1");
        GraphNode<string> gnode2 = new GraphNode<string>("2");
        GraphNode<string> gnode3 = new GraphNode<string>("3");
        GraphNode<string> gnode4 = new GraphNode<string>("4");
        gnode0.Add(gnode1, 10);
        gnode0.Add(gnode2, 20);
        gnode2.Add(gnode3, 15);
        gnode3.Add(gnode2, 10);
        gnode3.Add(gnode4, 25);
        gnode1.Add(gnode4, 45);
        gnode4.Add(gnode2, 55);

        // wrap to a graph
        Graph<string> graph = new Graph<string>(gnode0);
        GraphNode<string> graphRoot = graph.Root;
        graphRoot.Add(new GraphNode<string>("5"), 11);
        gnode1.Add(new GraphNode<string>("6"), 12);
        gnode2.Add(new GraphNode<string>("7"), 13);

        Bfs(gnode0);

        Console.WriteLine("done");
    }

    static void Bfs(GraphNode<string> node)
    {
        Queue<GraphNode<string>> q = new Queue<GraphNode<string>>();
        q.Enqueue(node);
        HashSet<GraphNode<string>> v = new HashSet<GraphNode<string>>();
        int steps = 0;
        int size = q.Count;
        while (q.Count > 0)
        {
            GraphNode<string> x = q.Dequeue();
            size--;
            foreach (GraphNode<string> child in x.children)
            {
                if (v.Contains(child))
                    continue;
                q.Enqueue(child);
                v.Add(child);
            }
            if (size == 0)
            {
                steps++;
                size = q.Count;
            }
        }
    }

    class Graph<T>
    {
        public GraphNode<T> Root { get; private set; }

        public Graph(GraphNode<T> root)
        {
            this.Root = root;
        }
    }

    class GraphNode<T>
    {

        public T Value { get; private set; }

        public IList<GraphNode<T>> children = new List<GraphNode<T>>();
        public IList<int> childrenCost = new List<int>();

        public GraphNode(T value)
        {
            this.Value = value;
        }

        public void Add(GraphNode<T> node, int cost)
        {
            this.children.Add(node);
            this.childrenCost.Add(cost);
        }

        public override string ToString()
        {
            return this.Value.ToString();
        }
    }
}
