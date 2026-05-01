package app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

// UI settings
// Expression: gmap
//   Type: HashMap
//     Layout: Graph
//     Nodes: @mapCustomNodes
//     Properties: @mapCustomValue (optional)
//     Save: Object Attributes
//   Type: GraphMapNodes.GraphMapNode
//     Layout: Graph
//     Nodes: @nodeCustomNodes
//     Edges: @nodeCustomEdges
//     Properties: @nodeCustomValue (optional)
//     Save: Object Type Attributes
public class GraphMapNodes {

    public static void main(String[] args) {

        // graph with hashmap node
        HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> gmap = new HashMap<>();
        HashMap<String, Integer> gedges = new HashMap<>();
        Extractor.gedges = gedges;

        GraphMapNode<String> node1 = new GraphMapNode<String>("1");
        GraphMapNode<String> node2 = new GraphMapNode<String>("2");
        GraphMapNode<String> node3 = new GraphMapNode<String>("3");
        GraphMapNode<String> node4 = new GraphMapNode<String>("4");

        gmap.put(node1, new ArrayList<>(List.of(node2, node3)));
        gmap.put(node2, new ArrayList<>(List.of(node3, node4)));
        gmap.put(node3, new ArrayList<>());
        gmap.put(node4, new ArrayList<>());

        // edges
        gedges.put(node1.getValue() + "," + node2.getValue(), 100);
        gedges.put(node1.getValue() + "," + node3.getValue(), 200);
        gedges.put(node2.getValue() + "," + node3.getValue(), 300);
        gedges.put(node2.getValue() + "," + node4.getValue(), 400);

        System.out.println("done");
    }

    public static class GraphMapNode<T> {

        protected T value;

        public T getValue() {
            return value;
        }

        public GraphMapNode(T value) {
            this.value = value;
        }
    }

    // custom extractor
    static class Extractor {
        static HashMap<String, Integer> gedges;

        // register the custom attributes to extract
        // you can select these from the ui
        // instead of modifying your objects
        public static Object[] registerAttrs() {
            return new Object[] {
                    new Object[] { "HashMap",
                            new String[] { "mapCustomNodes", "mapCustomEdges", "mapCustomValue" } },
                    new Object[] { "GraphMapNodes.GraphMapNode",
                            new String[] { "nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue" } }
            };
        }

        public static GraphMapNode<String>[] extract_mapCustomNodes(
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            List<GraphMapNode<String>> nodes = new ArrayList<GraphMapNode<String>>();
            if (root.keySet().size() > 0)
                nodes.addAll(root.keySet());
            return nodes.toArray(new GraphMapNode[0]);
        }

        public static String[] extract_mapCustomEdges(
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            return null; // return null to hide edges
        }

        public static String[] extract_mapCustomValue(
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            StringBuilder sb = new StringBuilder();
            for (GraphMapNode<String> key : root.keySet()) {
                sb.append(key.getValue());
                sb.append(",");
            }
            return new String[] { sb.toString() };
        }

        public static GraphMapNode<String>[] extract_nodeCustomNodes(
                GraphMapNode<String> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            List<GraphMapNode<String>> nodes = new ArrayList<GraphMapNode<String>>();
            if (root.containsKey(obj))
                nodes.addAll(root.get(obj));
            return nodes.toArray(new GraphMapNode[0]);
        }

        public static String[] extract_nodeCustomEdges(
                GraphMapNode<String> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            List<String> edges = new ArrayList<String>();
            if (root.containsKey(obj)) {
                for (GraphMapNode<String> child : root.get(obj)) {
                    String edgeKey = obj.getValue() + "," + child.getValue();
                    if (Extractor.gedges.containsKey(edgeKey)) {
                        int edgeValue = Extractor.gedges.get(edgeKey);
                        edges.add(String.valueOf(edgeValue));
                    } else {
                        edges.add("");
                    }
                }
            }
            return edges.toArray(new String[0]);
        }

        public static String[] extract_nodeCustomValue(
                GraphMapNode<String> obj,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            return new String[] { obj.getValue().toString() };
        }
    }
}