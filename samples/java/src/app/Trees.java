package app;

import java.util.ArrayList;

// UI settings
// Expression: tree
//   Type: Tree
//     Layout: Tree
//     Nodes: root
//     Save: Object Type Attributes
//   Type: Node
//     Layout: Tree
//     Nodes: children[]
//     Properties: value
//     Save: Object Type Attributes
public class Trees {

    public static void main(String[] args) {
        // nodes of a tree
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

        // wrap to a tree
        Tree<String> tree = new Tree<>(root);
        visitTree(tree.root, tree.root);

        System.out.println("done");
    }

    private static void visitTree(Node<String> node, Node<String> root) {
        if (node == null) {
            return;
        }
        for (Node<String> child : node.children) {
            visitTree(child, root);
        }
    }
}

class Tree<T> {
    protected Node<T> root;
    public Tree(Node<T> root) {
        this.root = root;
    }
}

class Node<T> {

    protected T value;
    protected ArrayList<Node<T>> children = new ArrayList<>();

    public Node(T value) {
        this.value = value;
    }

    public void add(Node<T> value) {
        children.add(value);
    }
}
