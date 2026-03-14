using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public class GraphMapNodes
{

    public static void RunMain(string[] args)
    {

        // graph with hashmap node
        Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> gmap
            = new Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>();
        GraphMapNode<string> node1 = new GraphMapNode<string>("1");
        GraphMapNode<string> node2 = new GraphMapNode<string>("2");
        GraphMapNode<string> node3 = new GraphMapNode<string>("3");
        GraphMapNode<string> node4 = new GraphMapNode<string>("4");

        gmap[node1] = new List<GraphMapNode<string>>([node2, node3]);
        gmap[node2] = new List<GraphMapNode<string>>([node3, node4]);
        gmap[node3] = new List<GraphMapNode<string>>();
        gmap[node4] = new List<GraphMapNode<string>>();

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
        // register the custom types
        public static IList<string> RegisterTypes()
        {
            return new List<string>(["Dictionary", "GraphMapNodes$GraphMapNode", "*"]);
        }

        public static List<GraphMapNode<string>> GetNodes(
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> node,
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
            if (root.Keys.Count > 0)
                nodes.Add(root.Keys.First());
            return nodes;
        }

        public static List<GraphMapNode<string>> GetNodes(
                GraphMapNode<string> node,
                Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>> root)
        {
            List<GraphMapNode<string>> nodes = new List<GraphMapNode<string>>();
            if (root.ContainsKey(node))
                nodes.AddRange(root[node]);
            return nodes;
        }

        public static string ToString(Object node)
        {
            if (node.GetType() == typeof(IDictionary))
            {
                StringBuilder sb = new StringBuilder();
                var nodeObj = (Dictionary<GraphMapNode<string>, List<GraphMapNode<string>>>)node;
                foreach (GraphMapNode<string> key in nodeObj.Keys)
                {
                    sb.Append(key.Value);
                    sb.Append("\n");
                }
                return sb.ToString();
            }
            else if (node.GetType() == typeof(GraphMapNode<string>))
            {
                return ((GraphMapNode<string>)node).Value.ToString();
            }
            return "";
        }
    }
}
