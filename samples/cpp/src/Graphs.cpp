#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <vector>
#include <queue>
#include <set>

using namespace std;

// UI settings
// Expression: graph
//   Type: Graph<std::string> *
//     Layout: Graph
//     Nodes: root
//     Save: Object Type Attributes
//   Type: GraphNode<std::string> *
//     Layout: Graph
//     Nodes: children[]
//     Edges: childrenCost[]
//     Properties: value
//     Save: Object Type Attributes

template <typename T>
class GraphNode
{
public:
    T value;
    vector<GraphNode<T> *> *children = new vector<GraphNode<T> *>();
    vector<int> *childrenCost = new vector<int>();
    GraphNode() {}
    GraphNode(T value)
    {
        this->value = value;
    }
    void add(GraphNode<T> *node, int cost)
    {
        this->children->push_back(node);
        this->childrenCost->push_back(cost);
    }
    string to_string()
    {
        return this->value.to_string();
    }
};

template <typename T>
class Graph
{
public:
    GraphNode<T> *root;
    Graph(GraphNode<T> *root)
    {
        this->root = root;
    }
};

class Graphs
{
public:
    void start()
    {
        // nodes of a graph
        GraphNode<string> *gnode0 = new GraphNode<string>("0");
        GraphNode<string> *gnode1 = new GraphNode<string>("1");
        GraphNode<string> *gnode2 = new GraphNode<string>("2");
        GraphNode<string> *gnode3 = new GraphNode<string>("3");
        GraphNode<string> *gnode4 = new GraphNode<string>("4");
        gnode0->add(gnode1, 10);
        gnode0->add(gnode2, 20);
        gnode2->add(gnode3, 15);
        gnode3->add(gnode2, 10);
        gnode3->add(gnode4, 25);
        gnode1->add(gnode4, 45);
        gnode4->add(gnode2, 55);

        // wrap to a graph
        Graph<string> *graph = new Graph<string>(gnode0);
        GraphNode<string> *graphRoot = graph->root;
        graphRoot->add(new GraphNode<string>("5"), 11);
        gnode1->add(new GraphNode<string>("6"), 12);
        gnode2->add(new GraphNode<string>("7"), 13);

        bfs(gnode0);

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }

    void bfs(GraphNode<string> *node)
    {
        queue<GraphNode<string> *> *q = new queue<GraphNode<string> *>();
        q->push(node);
        set<string> v = set<string>();
        int steps = 0;
        int size = q->size();
        while (q->size() > 0)
        {
            GraphNode<string> *x = q->front();
            q->pop();
            size--;
            for (GraphNode<string> *child : *(x->children))
            {
                if (v.count(child->value) > 0)
                    continue;
                q->push(child);
                v.insert(child->value);
            }
            if (size == 0)
            {
                steps++;
                size = q->size();
            }
        }
    }
};

void main(int argc, char **argv)
{
    Graphs().start();
}