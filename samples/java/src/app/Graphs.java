package app;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;

public class Graphs {

    public static void main(String[] args) {
        // nodes of a graph
        GraphNode<String> gnode0 = new GraphNode<>("0");
        GraphNode<String> gnode1 = new GraphNode<>("1");
        GraphNode<String> gnode2 = new GraphNode<>("2");
        GraphNode<String> gnode3 = new GraphNode<>("3");
        GraphNode<String> gnode4 = new GraphNode<>("4");
        gnode0.add(gnode1, 10);
        gnode0.add(gnode2, 20);
        gnode2.add(gnode3, 15);
        gnode3.add(gnode2, 10);
        gnode3.add(gnode4, 25);
        gnode1.add(gnode4, 45);
        gnode4.add(gnode2, 55);

        // wrap to a graph
        Graph<String> graph = new Graph<>(gnode0);
        GraphNode<String> graphRoot = graph.getRoot();
        graphRoot.add(new GraphNode<>("5"), 11);
        gnode1.add(new GraphNode<>("6"), 12);
        gnode2.add(new GraphNode<>("7"), 13);

        bfs(gnode0);

        System.out.println("done");
    }

    static void bfs(GraphNode<String> node) {
        Queue<GraphNode<String>> q = new LinkedList<>();
        q.add(node);
        HashSet<GraphNode<String>> v = new HashSet<>();
        int steps = 0;
        int size = q.size();
        while (q.size() > 0) {
            GraphNode<String> x = q.remove();
            size--;
            for (GraphNode<String> child : x.children) {
                if (v.contains(child))
                    continue;
                q.add(child);
                v.add(child);
            }
            if (size == 0) {
                steps++;
                size = q.size();
            }
        }
        System.out.println("step: " + steps);
    }

    static class Graph<T> {

        private GraphNode<T> root;

        public Graph(GraphNode<T> root) {
            this.root = root;
        }

        public GraphNode<T> getRoot() {
            return root;
        }
    }

    static class GraphNode<T> {

        private T value;

        public T getValue() {
            return value;
        }

        public ArrayList<GraphNode<T>> children = new ArrayList<>();
        public ArrayList<Integer> childrenCost = new ArrayList<>();

        public GraphNode(T value) {
            this.value = value;
        }

        public void add(GraphNode<T> node, int cost) {
            this.children.add(node);
            this.childrenCost.add(cost);
        }

        public String toString() {
            return String.valueOf(this.value);
        }
    }
}
