package app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class GraphMapNodes {

    public static void main(String[] args) {

        // graph with hashmap node
        HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> gmap = new HashMap<>();
        GraphMapNode<String> node1 = new GraphMapNode<String>("1");
        GraphMapNode<String> node2 = new GraphMapNode<String>("2");
        GraphMapNode<String> node3 = new GraphMapNode<String>("3");
        GraphMapNode<String> node4 = new GraphMapNode<String>("4");

        gmap.put(node1, new ArrayList<>(List.of(node2, node3)));
        gmap.put(node2, new ArrayList<>(List.of(node3, node4)));
        gmap.put(node3, new ArrayList<>());
        gmap.put(node4, new ArrayList<>());
    }

    static class GraphMapNode<T> {

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
        // register the custom types
        public static List<String> registerTypes() {
            return new ArrayList<>(List.of("HashMap", "GraphMapNodes$GraphMapNode"));
        }

        public static List<?> getNodes(
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> node,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            List<GraphMapNode<String>> nodes = new ArrayList<>();
            for(var key : root.keySet())
                nodes.add(key);
            return nodes;
        }

        public static List<?> getNodes(
                GraphMapNode<String> node,
                HashMap<GraphMapNode<String>, List<GraphMapNode<String>>> root) {
            return root.get(node);
        }

        public static String toString(Object node) {
            if (node instanceof HashMap) {
                StringBuilder sb = new StringBuilder();
                var nodeObj = ((HashMap<GraphMapNode<String>, List<GraphMapNode<String>>>) node);
                for (GraphMapNode<String> key : nodeObj.keySet()) {
                    sb.append(key.value);
                    sb.append(",");
                }
                return sb.toString();
            } else if (node instanceof GraphMapNode) {
                return String.valueOf(((GraphMapNode<String>) node).getValue());
            }
            return "";
        }
    }
}
