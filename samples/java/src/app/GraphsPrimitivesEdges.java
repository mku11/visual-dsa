package app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

public class GraphsPrimitivesEdges {

    public static void main(String[] args) {
        // graph with hashmap primitives
        HashMap<String, List<List<String>>> gmap = new HashMap<>();
        gmap.put("1", new ArrayList<>(List.of(List.of("2", "3"), List.of("10",
                "20"))));
        gmap.put("2", new ArrayList<>(List.of(List.of("3", "4"), List.of("30",
                "40"))));
        gmap.put("3", new ArrayList<>());
        gmap.put("4", new ArrayList<>());
        gmap.put("5", new ArrayList<>());

        while (true) {
        }
    }

    // custom extractor
    static class Extractor {
        // register the custom types
        public static List<String> registerTypes() {
            return new ArrayList<>(List.of("HashMap", "HashMap$Entry",
                    "HashMap$Node"));
        }

        public static List<?> getNodes(
                Object node,
                HashMap<String, List<List<String>>> root) {
            if (node instanceof HashMap) {
                List<HashMap.Entry<String, List<List<String>>>> nodes = new ArrayList<>();
                nodes.add(root.entrySet().iterator().next());
                return nodes;
            } else if (node instanceof HashMap.Entry) {
                List<HashMap.Entry<String, List<List<String>>>> nodes = new ArrayList<>();
                HashMap.Entry<String, List<List<String>>> nodeObj = (HashMap.Entry<String, List<List<String>>>) node;
                if(nodeObj.getValue().size() == 0) {
                    return nodes;
                }
                HashSet<String> keys = new HashSet<>(nodeObj.getValue().get(0));
                for (HashMap.Entry<String, List<List<String>>> entry : root.entrySet()) {
                    if (keys.contains(entry.getKey())) {
                        nodes.add(entry);
                    }
                }
                return nodes;
            }
            return new ArrayList<>();
        }

        public static List<?> getEdges(
                Object node,
                HashMap<String, List<List<String>>> root) {
            if (node instanceof HashMap) {
                return new ArrayList<>(List.of(""));
            } else if (node instanceof HashMap.Entry) {
                HashMap.Entry<String, List<List<String>>> nodeObj = (HashMap.Entry<String, List<List<String>>>) node;
                return nodeObj.getValue().get(1);
            }
            return new ArrayList<>();
        }

        public static String toString(Object node) {
            if(node instanceof HashMap) {
                return "";
            } else if(node instanceof HashMap.Entry) {
                return String.valueOf(((HashMap.Entry) node).getKey());
            }
            return "";
        }
    }
}