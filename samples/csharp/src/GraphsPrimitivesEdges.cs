using System.Collections.Generic;
using System.Linq;

public class GraphsPrimitivesEdges
{

    public static void RunMain(string[] args)
    {
        // graph with hashmap primitives
        Dictionary<string, List<List<string>>> gmap
            = new Dictionary<string, List<List<string>>>();
        gmap["1"] = new List<List<string>>([["2", "3"], ["10", "20"]]);
        gmap["2"] = new List<List<string>>([["3", "4"], ["30", "40"]]);
        gmap["3"] = new List<List<string>>();
        gmap["4"] = new List<List<string>>();
        gmap["5"] = new List<List<string>>();
    }

    // custom extractor
    static class Extractor
    {
        // register the custom types
        public static List<string> RegisterTypes()
        {
            return new List<string>(["*"]);
        }

        public static List<KeyValuePair<string, List<List<string>>>> GetNodes(
                object node,
                Dictionary<string, List<List<string>>> root)
        {
            if (node.GetType() == typeof(Dictionary<string, List<List<string>>>))
            {
                List<KeyValuePair<string, List<List<string>>>> nodes = [root.First()];
                return nodes;
            }
            else if (node.GetType() == typeof(KeyValuePair<string, List<List<string>>>))
            {
                List<KeyValuePair<string, List<List<string>>>> nodes
                    = new List<KeyValuePair<string, List<List<string>>>>();
                KeyValuePair<string, List<List<string>>> nodeObj
                    = (KeyValuePair<string, List<List<string>>>)node;
                if (nodeObj.Value.Count == 0)
                {
                    return nodes;
                }
                HashSet<string> keys = new HashSet<string>(nodeObj.Value[0]);
                foreach (KeyValuePair<string, List<List<string>>> entry in root)
                {
                    if (keys.Contains(entry.Key))
                    {
                        nodes.Add(entry);
                    }
                }
                return nodes;
            }
            return new List<KeyValuePair<string, List<List<string>>>>();
        }

        public static List<string> GetEdges(
                object node,
                Dictionary<string, List<List<string>>> root)
        {
            if (node.GetType() == typeof(Dictionary<string, List<List<string>>>))
            {
                return new List<string>([""]);
            }
            else if (node.GetType() == typeof(KeyValuePair<string, List<List<string>>>))
            {
                KeyValuePair<string, List<List<string>>> nodeObj
                    = (KeyValuePair<string, List<List<string>>>)node;
                List<string> edges = new List<string>();
                edges.AddRange(nodeObj.Value[1]);
                return edges;
            }
            return new List<string>();
        }

        public static string ToString(object node)
        {
            if (node.GetType() == typeof(Dictionary<string, List<List<string>>>))
            {
                return "";
            }
            if (node.GetType() == typeof(KeyValuePair<string, List<List<string>>>))
            {
                return ((KeyValuePair<string, List<List<string>>>)node).Key.ToString();
            }
            return "";
        }
    }
}