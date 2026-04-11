#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

// UI settings
// Expression: graph
//   Type: Graph *
//     Layout: Graph
//     Nodes: root
//     Save: Object Type Attributes
//   Type: GraphNode *
//     Layout: Graph
//     Nodes: children[]
//     Edges: childrenCost[]
//     Properties: value
//     Save: Object Type Attributes

// Graph
typedef struct GraphNode
{
    char *value;
    struct GraphNode *children[1024];
    int childrenCost[1024];
    int size;
    bool visited;
} GraphNode;

GraphNode *nodeCreate(char *value)
{
    GraphNode *node = malloc(sizeof(GraphNode));
    node->value = value;
    node->size = 0;
    node->visited = false;
    return node;
}

void nodeAdd(GraphNode *this, GraphNode *node, int cost)
{
    this->children[this->size] = node;
    this->childrenCost[this->size++] = cost;
}

typedef struct Graph
{
    GraphNode *root;
} Graph;

Graph *graphCreate(GraphNode *root)
{
    Graph *graph = malloc(sizeof(Graph));
    graph->root = root;
    return graph;
}

// Queue
typedef struct Queue
{
    GraphNode *nodes[1024];
    int start;
    int end;
} Queue;

Queue *queueCreate()
{
    Queue *queue = malloc(sizeof(Queue));
    queue->start = 0;
    queue->end = 0;
    return queue;
}

int queueSize(Queue *this)
{
    return this->end - this->start;
}

void queuePush(Queue *this, GraphNode *value)
{
    this->nodes[this->end++] = value;
}

GraphNode *queueTake(Queue *this)
{
    if (queueSize(this) == 0)
        return NULL;
    GraphNode *node = this->nodes[this->start];
    this->start++;
    return node;
}

// bfs
void bfs(GraphNode *node)
{
    Queue *q = queueCreate();
    queuePush(q, node);
    node->visited = true;
    int steps = 0;
    int size = queueSize(q);
    while (queueSize(q) > 0)
    {
        GraphNode *x = queueTake(q);
        if (x == NULL)
            continue;
        size--;
        for (int i = 0; i < x->size; i++)
        {
            GraphNode *child = x->children[i];
            if (child->visited)
                continue;
            queuePush(q, child);
            child->visited = true;
        }
        if (size == 0)
        {
            steps++;
            size = queueSize(q);
        }
    }
}

void main(int argc, char **argv)
{

    // nodes of a graph
    GraphNode *gnode0 = nodeCreate("0");
    GraphNode *gnode1 = nodeCreate("1");
    GraphNode *gnode2 = nodeCreate("2");
    GraphNode *gnode3 = nodeCreate("3");
    GraphNode *gnode4 = nodeCreate("4");
    nodeAdd(gnode0, gnode1, 10);
    nodeAdd(gnode0, gnode2, 20);
    nodeAdd(gnode2, gnode3, 15);
    nodeAdd(gnode3, gnode2, 10);
    nodeAdd(gnode3, gnode4, 25);
    nodeAdd(gnode1, gnode4, 45);
    nodeAdd(gnode4, gnode2, 55);

    // wrap to a graph
    Graph *graph = graphCreate(gnode0);
    GraphNode *graphRoot = graph->root;
    nodeAdd(graphRoot, nodeCreate("5"), 11);
    nodeAdd(gnode1, nodeCreate("6"), 12);
    nodeAdd(gnode2, nodeCreate("7"), 13);

    bfs(gnode0);

    printf("done\n");
}
