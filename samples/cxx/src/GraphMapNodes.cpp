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

// custom extractor
static unordered_map<string, int> *extractEdges;
typedef struct AttrMap
{
    char *type;
    char *attrs[128];
    int size;
} AttrMap;

typedef struct AttrMaps
{
    AttrMap *maps;
    int size;
} AttrMaps;

// register the custom attributes to extract
// you can select these from the ui
// instead of modifying your objects
AttrMaps extractorRegisterAttrs()
{
    AttrMap maps[2] = {
        {"std::unordered_map<std::string,std::pair<GraphMapNode<std::string>,std::vector<GraphMapNode<std::string>>>> *", {"customNodes", "customValue"}, 2},
        {"GraphMapNode<std::string>", {"customNodes", "customEdges", "customValue"}, 3}};
    return {maps, sizeof(maps) / sizeof(AttrMap)};
}

// FIXME: The debugger expects a structured array of objects of a single type.
// That means we cannot mixed types (ie: nodes, edges, or values).
typedef struct Objects
{
    GraphMapNode<string> *objects;
    int size;
} Objects;

// FIXME: the MSVC C/C++ debugger does not allow nested function calls.
Objects extract(
    string type,
    string attr,
    void *obj,
    void *root)
{
    cout << "extract: " << type << ", " << attr << endl;
    if (type == "std::unordered_map<std::string,std::pair<GraphMapNode<std::string>,std::vector<GraphMapNode<std::string>>>> *" && attr == "customNodes")
    {
        auto *rootObject = (unordered_map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>> *)root;
        GraphMapNode<string> nodes[1024];
        int i = 0;
        for (auto kv : *rootObject)
        {
            pair<GraphMapNode<string>, vector<GraphMapNode<string>>> node = kv.second;
            nodes[i++] = node.first;
        }
        return {nodes, (int)rootObject->size()};
    }
    else if (type == "GraphMapNode<std::string>" && attr == "customNodes")
    {
        auto *rootObject = (unordered_map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>> *)root;
        GraphMapNode<string> *objObject = (GraphMapNode<string> *)obj;
        GraphMapNode<string> nodes[1024];
        int i = 0;
        if (rootObject->count(objObject->value))
        {
            vector<GraphMapNode<string>> children = rootObject->at(objObject->value).second;
            for (GraphMapNode<string> child : children)
                nodes[i++] = child;
        }
        return {nodes, (int)rootObject->size()};
    }
    return {0};
}

class GraphMapNodes
{
public:
    void start()
    {
        // auto a = extractorRegisterAttrs();
        // graph with hashmap node
        // map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>> *aa = new map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>>();
        auto *gmap = new unordered_map<string, pair<GraphMapNode<string>, vector<GraphMapNode<string>>>>();
        unordered_map<string, int> *gedges = new unordered_map<string, int>();
        extractEdges = gedges;

        // nodes
        GraphMapNode<string> node1 = GraphMapNode<string>("1");
        GraphMapNode<string> node2 = GraphMapNode<string>("2");
        GraphMapNode<string> node3 = GraphMapNode<string>("3");
        GraphMapNode<string> node4 = GraphMapNode<string>("4");

        gmap->insert({node1.value, make_pair(node1, vector<GraphMapNode<string>>({node2, node3}))});
        gmap->insert({node2.value, make_pair(node2, vector<GraphMapNode<string>>({node3, node4}))});
        gmap->insert({node3.value, make_pair(node3, vector<GraphMapNode<string>>())});
        gmap->insert({node4.value, make_pair(node4, vector<GraphMapNode<string>>())});

        // edges
        gedges->insert({string(node1.value + "," + node2.value), 100});
        gedges->insert({string(node1.value + "," + node3.value), 200});
        gedges->insert({string(node2.value + "," + node3.value), 300});
        gedges->insert({string(node2.value + "," + node4.value), 400});

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }
};

void graphMapNodesRunMain(int argc, char **argv)
{
    GraphMapNodes().start();
}