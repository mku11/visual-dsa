package app;

import java.util.ArrayList;
import java.util.List;

public class Trees {

    public static void main(String[] args) {
        // // nodes of a tree
        Node<String> root = new Node<>("0");
        Node<String> node1 = new Node<>("1");
        Node<String> node2 = new Node<>("2");
        Node<String> node3 = new Node<>("3");
        Node<String> node4 = new Node<>("4");
        Node<String> node5 = new Node<>("5");
        Node<String> node6 = new Node<>("6");
        root.add(node1);
        node1.add(node2);
        node1.add(node3);
        root.add(node4);
        node4.add(node5);
        node4.add(node6);

        // // wrap to a tree
        Tree<String> tree = new Tree<>(root);
        visitTree(tree.getRoot(), tree.getRoot());
    }

    private static void visitTree(Node<String> node, Node<String> root) {
        if (node == null) {
            return;
        }
        System.out.println(node.value);
        for (Node<String> child : node.children) {
            visitTree(child, root);
        }
    }

    // custom extractor
    static class Extractor {

        // register the custom types
        public static List<String> registerTypes() {
            return new ArrayList<>(List.of(
                    "TreeNode"));
        }

        public static String toString(String type, Node<?> node) {
            return node.value.toString();
        }
    }
}

class Tree<T> {

    private Node<T> root;

    public Tree(Node<T> root) {
        this.root = root;
    }

    public Node<T> getRoot() {
        return this.root;
    }
}

class Node<T> {

    public T value;
    public ArrayList<Node<T>> children = new ArrayList<>();

    public Node(T value) {
        this.value = value;
    }

    public void add(Node<T> value) {
        children.add(value);
    }

    // public String toString() {
    // return String.valueOf(this.value);
    // }
}
