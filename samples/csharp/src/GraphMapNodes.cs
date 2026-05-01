using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

// UI settings
// Expression: gmap
//   Type: System.Collections.Generic.Dictionary<GraphMapNodes.GraphMapNode<string>, System.Collections.Generic.List<GraphMapNodes.GraphMapNode<string>>>
//     Layout: Graph
//     Nodes: @dictCustomNodes
//     Properties: @dictCustomValue (optional)
//     Save: Object Attributes
//   Type: GraphMapNodes.GraphMapNode<string>
//     Layout: Graph
//     Nodes: @nodeCustomNodes
//     Edges: @nodeCustomEdges
//     Properties: @nodeCustomValue (optional)
//     Save: Object Type Attributes
internal class GraphMapNodes
{

    public static void RunMain(string[] args)
    {
        new GraphMapNodes().Start();
    }

    public void Start()
    {
        // graph with hashmap node
        Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> gmap
            = new Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>();
        Dictionary<string, int> gedges = new Dictionary<string, int>();
        Extractor.gedges = gedges;

        // nodes
        GraphMapNode<string> node1 = new GraphMapNode<string>("1");
        GraphMapNode<string> node2 = new GraphMapNode<string>("2");
        GraphMapNode<string> node3 = new GraphMapNode<string>("3");
        GraphMapNode<string> node4 = new GraphMapNode<string>("4");

        gmap.Add(node1, new List<GraphMapNode<string>>([node2, node3]));
        gmap.Add(node2, new List<GraphMapNode<string>>([node3, node4]));
        gmap.Add(node3, []);
        gmap.Add(node4, []);

        // edges
        gedges.Add(node1.Value + "," + node2.Value, 100);
        gedges.Add(node1.Value + "," + node3.Value, 200);
        gedges.Add(node2.Value + "," + node3.Value, 300);
        gedges.Add(node2.Value + "," + node4.Value, 400);

        Console.WriteLine("done");
    }

    class GraphMapNode<T>
    {
        public T Value { get; private set; }
        public GraphMapNode(T value)
        {
            this.Value = value;
        }
    }

    // custom extractor
    static class Extractor
    {
        internal static Dictionary<string, int> gedges;

        // register the custom attributes to extract
        // you can select these from the ui 
        // instead of modifying your objects
        public static object[] RegisterAttrs()
        {
            return [
                new object[]{"System.Collections.Generic.Dictionary<GraphMapNodes.GraphMapNode<string>, System.Collections.Generic.List<GraphMapNodes.GraphMapNode<string>>>",
                    new string[]{"dictCustomNodes", "dictCustomEdges", "dictCustomValue"}},
                new object[] {"GraphMapNodes.GraphMapNode<string>",
                    new string[]{"nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue"}}
            ];
        }

        public static List<GraphMapNode<string>> Extract_dictCustomNodes(
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
            foreach (GraphMapNode<string> node in root.Keys)
                nodes.Add(node);
            return nodes;
        }

        public static List<int> Extract_dictCustomEdges(
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            return null; // return null to hide edges
        }

        public static string[] Extract_dictCustomValue(
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {

            StringBuilder sb = new StringBuilder();
            foreach (GraphMapNode<string> key in obj.Keys)
            {
                sb.Append(key.Value);
                sb.Append(",");
            }
            return [sb.ToString()];
        }

        public static List<GraphMapNode<string>> Extract_nodeCustomNodes(
            GraphMapNode<string> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
            if (root.ContainsKey(obj))
                nodes.AddRange(root[obj]);
            return nodes;
        }

        public static List<string> Extract_nodeCustomEdges(
            GraphMapNode<string> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            List<string> edges = new List<string>();
            if (root.ContainsKey(obj))
            {
                foreach (GraphMapNode<string> child in root[obj])
                {
                    string edgeKey = obj.Value + "," + child.Value;
                    if (gedges.ContainsKey(edgeKey))
                    {
                        int edgeValue = gedges[edgeKey];
                        edges.Add(edgeValue.ToString());
                    }
                    else
                    {
                        edges.Add("");
                    }
                }
            }
            return edges;
        }

        public static string[] Extract_nodeCustomValue(
            GraphMapNode<string> obj,
            Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            return [obj.Value];
        }
    }
}
