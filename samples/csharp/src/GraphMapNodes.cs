using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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
        public static object[] Register()
        {
            return [
                new object[]{"System.Collections.Generic.Dictionary<GraphMapNodes.GraphMapNode<string>, System.Collections.Generic.List<GraphMapNodes.GraphMapNode<string>>>",
                    new string[]{"customNodes", "customValue"}},
                new object[] {"GraphMapNodes.GraphMapNode<string>",
                    new string[]{"customNodes", "customEdges", "customValue"}}
            ];
        }

        public static object[] Extract(
            string type,
            string attr,
            object obj,
            object root)
        {
            if (type == "System.Collections.Generic.Dictionary<GraphMapNodes.GraphMapNode<string>, System.Collections.Generic.List<GraphMapNodes.GraphMapNode<string>>>"
             && attr == "customNodes")
            {
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> rootObject =
                    root as Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>;
                List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
                if (rootObject.Keys.Count > 0)
                    nodes.Add(rootObject.Keys.First());
                return nodes.ToArray();
            }
            else if (type == "System.Collections.Generic.Dictionary<GraphMapNodes.GraphMapNode<string>, System.Collections.Generic.List<GraphMapNodes.GraphMapNode<string>>>"
            && attr == "customValue")
            {
                StringBuilder sb = new StringBuilder();
                var nodeObj = obj as Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>;
                foreach (GraphMapNode<string> key in nodeObj.Keys)
                {
                    sb.Append(key.Value);
                    sb.Append(",");
                }
                return new string[] { sb.ToString() };
            }

            else if (type == "GraphMapNodes.GraphMapNode<string>" && attr == "customNodes")
            {
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> rootObject =
                    root as Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>;
                GraphMapNode<string> objObject = obj as GraphMapNode<string>;
                List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
                if (rootObject.ContainsKey(objObject))
                    nodes.AddRange(rootObject[objObject]);
                return nodes.ToArray();
            }
            if (type == "GraphMapNodes.GraphMapNode<string>" && attr == "customEdges")
            {
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> rootObject =
                    root as Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>;
                GraphMapNode<string> objObject = obj as GraphMapNode<string>;

                List<int> edges = new List<int>();
                foreach (GraphMapNode<string> child in rootObject[objObject])
                {
                    string edgeKey = objObject.Value + "," + child.Value;
                    int edgeValue = Extractor.gedges[edgeKey];
                    edges.Add(edgeValue);
                }
                return edges.Select(x => (object)x).ToArray();
            }
            else if (attr == "customValue")
            {
                GraphMapNode<string> objObject = obj as GraphMapNode<string>;
                return new string[] { objObject.Value.ToString() };
            }
            return null;
        }
    }
}
