#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

// UI settings
// Expression: tree
//   Type: Tree *
//     Layout: Tree
//     Nodes: root
//     Save: Object Type Attributes
//   Type: Node *
//     Layout: Tree
//     Nodes: children[]
//     Properties: value
//     Save: Object Type Attributes

// nodes
typedef struct Node
{
    char *value;
    struct Node *children[1024];
    int size;
} Node;

Node *nodeCreate(char *value)
{
    Node *node = malloc(sizeof(Node));
    node->value = value;
    node->size = 0;
    return node;
}
void nodeAdd(Node *this, Node *value)
{
    this->children[this->size++] = value;
}

// tree
typedef struct Tree
{
    Node *root;
} Tree;

Tree *treeCreate(Node *root)
{
    Tree *tree = malloc(sizeof(Tree));
    tree->root = root;
    return tree;
}

void visitTree(Node *node, Node *root)
{
    if (node == NULL)
        return;
    printf("%s\n", node->value);
    for (int i = 0; i < node->size; i++)
    {
        Node *child = node->children[i];
        visitTree(child, root);
    }
}

void main(int argc, char **argv)
{ // // nodes of a tree
    Node *root = nodeCreate("0");
    Node *node1 = nodeCreate("1");
    Node *node2 = nodeCreate("2");
    Node *node3 = nodeCreate("3");
    Node *node4 = nodeCreate("4");
    Node *node5 = nodeCreate("5");
    Node *node6 = nodeCreate("6");
    nodeAdd(root, node1);
    nodeAdd(node1, node2);
    nodeAdd(node1, node3);
    nodeAdd(root, node4);
    nodeAdd(node4, node5);
    nodeAdd(node4, node6);

    // // wrap to a tree
    Tree *tree = treeCreate(root);
    visitTree(tree->root, tree->root);

    printf("done\n");
}
