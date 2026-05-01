#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <vector>
#include <unordered_map>
#include <map>

using namespace std;

// UI settings
// Expression: gmap
//   Type: std::unordered_map<std::string,std::pair<GraphMapNode<std::string> *,std::vector<GraphMapNode<std::string> *> *>> *
//     Layout: Graph
//     Nodes: @mapCustomNodes
//     Properties: @mapCustomValue (optional)
//     Save: Object Attributes
//   Type: GraphMapNode<std::string> *
//     Layout: Graph
//     Nodes: @nodeCustomNodes
//     Edges: @nodeCustomEdges
//     Properties: @nodeCustomValue (optional)
//     Save: Object Type Attributes

template <typename T>
class GraphMapNode
{
public:
    T value;
    GraphMapNode()
    {
    }
    GraphMapNode(T value)
    {
        this->value = value;
    }
};

// keep global objects so you can extract them below
static unordered_map<string, int> *extractEdges;

// register the custom attributes to extract
// you can select these from the ui
// instead of modifying your objects
// this function will be called automatically by the debugger
vector<pair<string, vector<string>>> extractorRegisterAttrs()
{
    // attribute
    auto attr1 = vector<string>({"mapCustomNodes", "mapCustomEdges", "mapCustomValue"});
    // associate with a parent type
    auto type1 = pair<string, vector<string>>(
        "std::unordered_map<std::string,std::pair<GraphMapNode<std::string> *,std::vector<GraphMapNode<std::string> *> *>> *",
        attr1);

    auto attr2 = vector<string>({"nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue"});
    auto type2 = pair<string, vector<string>>("GraphMapNode<std::string> *", attr2);

    return vector<pair<string, vector<string>>>({type1, type2});
}

vector<GraphMapNode<string> *> extract_mapCustomNodes(
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<GraphMapNode<string> *> nodes;
    for (auto kv : *root)
    { // we collect all the nodes from the map
        nodes.push_back(kv.second.first);
    }
    return nodes;
}

vector<string> extract_mapCustomValue(
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<string> value;
    string val = "";
    for (auto kv : *root)
    { // we collect all the node values from the map
        val += kv.second.first->value;
        val += ",";
    }
    value.push_back(val);
    return value;
}

vector<void *> extract_mapCustomEdges(
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<void *> nodes;
    for (auto kv : *root)
    { // we set all the edges to NULL to hide them
        nodes.push_back(NULL);
    }
    return nodes;
}

vector<GraphMapNode<string> *> extract_nodeCustomNodes(
    GraphMapNode<string> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<GraphMapNode<string> *> nodes;
    if (!root->count(obj->value))
        return nodes;
    // we collect all the children nodes from the map for this node
    for (GraphMapNode<string> *child : *(root->at(obj->value).second))
        nodes.push_back(child);
    return nodes;
}

vector<string> extract_nodeCustomEdges(
    GraphMapNode<string> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<string> edges;
    if (!root->count(obj->value))
        return edges;
    // we collect all the children nodes from the map for this node
    for (GraphMapNode<string> *child : *(root->at(obj->value).second))
    {
        string edgeKey = obj->value + "," + child->value;
        if (extractEdges->count(edgeKey))
        {
            int edgeValue = extractEdges->at(edgeKey);
            edges.push_back(to_string(edgeValue));
        } else {
            edges.push_back("");
        }
    }
    return edges;
}

vector<string> extract_nodeCustomValue(
    GraphMapNode<string> *obj,
    unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>> *root)
{
    vector<string> value;
    value.push_back(obj->value);
    return value;
}

class GraphMapNodes
{
public:
    void start()
    {
        // auto a = extractorRegisterAttrs();
        // graph with hashmap node
        // map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>> *aa = new map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>>();
        auto *gmap = new unordered_map<string, pair<GraphMapNode<string> *, vector<GraphMapNode<string> *> *>>();
        unordered_map<string, int> *gedges = new unordered_map<string, int>();
        // keep a global pointer to the edges so we can extract the labels
        extractEdges = gedges;

        // nodes
        GraphMapNode<string> *node1 = new GraphMapNode<string>("1");
        GraphMapNode<string> *node2 = new GraphMapNode<string>("2");
        GraphMapNode<string> *node3 = new GraphMapNode<string>("3");
        GraphMapNode<string> *node4 = new GraphMapNode<string>("4");

        gmap->insert({node1->value, make_pair(node1, new vector<GraphMapNode<string> *>({node2, node3}))});
        gmap->insert({node2->value, make_pair(node2, new vector<GraphMapNode<string> *>({node3, node4}))});
        gmap->insert({node3->value, make_pair(node3, new vector<GraphMapNode<string> *>())});
        gmap->insert({node4->value, make_pair(node4, new vector<GraphMapNode<string> *>())});

        // edges
        gedges->insert({string(node1->value + "," + node2->value), 100});
        gedges->insert({string(node1->value + "," + node3->value), 200});
        gedges->insert({string(node2->value + "," + node3->value), 300});
        gedges->insert({string(node2->value + "," + node4->value), 400});

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }
};

void main(int argc, char **argv)
{
    GraphMapNodes().start();
}