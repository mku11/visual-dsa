package app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

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

        private T value;

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
                            new String[] { "customNodes", "customValue" } },
                    new Object[] { "GraphMapNodes.GraphMapNode",
                            new String[] { "customNodes", "customEdges", "customValue" } }
            };
        }

        public static Object[] extract(
                String type,
                String attr,
                Object obj,
                Object root) {
            System.out.println("extract: " + type + ", " + attr);
            if (type.equals("HashMap") && attr.equals("customNodes")) {
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> rootObject = (HashMap<GraphMapNode<String>, List<GraphMapNode<String>>>) root;
                List<GraphMapNode<String>> nodes = new ArrayList<GraphMapNode<String>>();
                if (rootObject.keySet().size() > 0)
                    nodes.addAll(rootObject.keySet());
                return nodes.toArray();
            } else if (type .equals( "HashMap") && attr .equals( "customValue")) {
                StringBuilder sb = new StringBuilder();
                var nodeObj = (HashMap<GraphMapNode<String>, List<GraphMapNode<String>>>) obj;
                for (GraphMapNode<String> key : nodeObj.keySet()) {
                    sb.append(key.getValue());
                    sb.append(",");
                }
                return new String[] { sb.toString() };
            } else if (type .equals( "GraphMapNodes.GraphMapNode") && attr .equals( "customNodes")) {
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> rootObject = (HashMap<GraphMapNode<String>, List<GraphMapNode<String>>>) root;
                GraphMapNode<String> objObject = (GraphMapNode<String>) obj;
                List<GraphMapNode<String>> nodes = new ArrayList<GraphMapNode<String>>();
                if (rootObject.containsKey(objObject))
                    nodes.addAll(rootObject.get(objObject));
                return nodes.toArray();
            } else if (type .equals( "GraphMapNodes.GraphMapNode") && attr .equals( "customEdges")) {
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> rootObject = (HashMap<GraphMapNode<String>, List<GraphMapNode<String>>>) root;
                GraphMapNode<String> objObject = (GraphMapNode<String>) obj;

                List<String> edges = new ArrayList<String>();
                for (GraphMapNode<String> child : rootObject.get(objObject)) {
                    String edgeKey = objObject.getValue() + "," + child.getValue();
                    int edgeValue = Extractor.gedges.get(edgeKey);
                    edges.add(String.valueOf(edgeValue));
                }
                return edges.toArray();
            } else if (type .equals( "GraphMapNodes.GraphMapNode") && attr .equals( "customValue")) {
                GraphMapNode<String> objObject = (GraphMapNode<String>) obj;
                return new String[] { objObject.getValue().toString() };
            }
            return null;
        }
    }
}