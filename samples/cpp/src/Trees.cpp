#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <vector>

using namespace std;

template <typename T>
class Node
{
public:
    T value;
    vector<Node<T> *> *children = new vector<Node<T> *>();
    Node(T value)
    {
        this->value = value;
    }
    void add(Node<T> *value)
    {
        children->push_back(value);
    }
};

template <typename T>
class Tree
{
public:
    Node<T> *root;
    Tree(Node<T> *root)
    {
        this->root = root;
    }
};

class Trees
{
public:
    void start()
    {
        // // nodes of a tree
        Node<string> *root = new Node<string>("0");
        Node<string> *node1 = new Node<string>("1");
        Node<string> *node2 = new Node<string>("2");
        Node<string> *node3 = new Node<string>("3");
        Node<string> *node4 = new Node<string>("4");
        Node<string> *node5 = new Node<string>("5");
        Node<string> *node6 = new Node<string>("6");
        root->add(node1);
        node1->add(node2);
        node1->add(node3);
        root->add(node4);
        node4->add(node5);
        node4->add(node6);

        // // wrap to a tree
        Tree<string> *tree = new Tree<string>(root);
        visitTree(tree->root, tree->root);

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }

private:
    static void visitTree(Node<string> *node, Node<string> *root)
    {
        if (node == NULL)
            return;
        cout << node->value << endl;
        for (Node<string> *child : *(node->children))
        {
            visitTree(child, root);
        }
    }
};

void main(int argc, char **argv)
{
    Trees().start();
}
