using System;
using System.Collections.Generic;

public class Trees
{
    public static void RunMain(string[] args)
    {
        // // nodes of a tree
        Node<string> root = new Node<string>("0");
        Node<string> node1 = new Node<string>("1");
        Node<string> node2 = new Node<string>("2");
        Node<string> node3 = new Node<string>("3");
        Node<string> node4 = new Node<string>("4");
        Node<string> node5 = new Node<string>("5");
        Node<string> node6 = new Node<string>("6");
        root.Add(node1);
        node1.Add(node2);
        node1.Add(node3);
        root.Add(node4);
        node4.Add(node5);
        node4.Add(node6);

        // // wrap to a tree
        Tree<string> tree = new Tree<string>(root);
        visitTree(tree.Root, tree.Root);
    }

    private static void visitTree(Node<String> node, Node<String> root)
    {
        if (node == null)
        {
            return;
        }
        Console.WriteLine(node.Value);
        foreach (Node<string> child in node.children)
        {
            visitTree(child, root);
        }
    }

    // custom extractor
    static class Extractor
    {

        // register the custom types
        public static IList<string> registerTypes()
        {
            return new List<string>([
                    "TreeNode"]);
        }

        public static string ToString(string type, Node<string> node)
        {
            return node.Value.ToString();
        }
    }
}

class Tree<T>
{

    public Node<T> Root { get; private set; }

    public Tree(Node<T> root)
    {
        this.Root = root;
    }
}

class Node<T>
{

    public T Value { get; private set; }
    public List<Node<T>> children = new List<Node<T>>();

    public Node(T value)
    {
        this.Value = value;
    }

    public void Add(Node<T> value)
    {
        children.Add(value);
    }

    // public string ToString() {
    // return this.value.ToString();
    // }
}
