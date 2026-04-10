#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <vector>

using namespace std;

// register the custom attributes to extract
// you can select these from the ui
// instead of modifying your objects
// this function will be called automatically by the debugger
vector<pair<string, vector<string>>> extractorRegisterAttrs()
{
    // attribute and return type
    auto attr1 = vector<string>({"points"});
    // associate with a parent type
    auto type1 = pair<string, vector<string>>("std::vector<int>", attr1);

    auto attr2 = vector<string>({"lines"});
    auto type2 = pair<string, vector<string>>("std::vector<std::vector<int>>", attr2);

    return vector<pair<string, vector<string>>>({type1, type2});
}

// The extract functions will be of format extract_{attr} and
// will be called automatically by the debugger to extract the data
vector<vector<int>> extract_points(
    vector<int> *obj,
    vector<int> *root)
{
    // convert list of numbers to list of points (i,xi)
    vector<vector<int>> nodes = vector<vector<int>>();
    for (int i = 0; i < obj->size(); i++)
    {
        if ((*obj)[i] == NULL)
            continue;
        nodes.push_back(vector<int>({i, (int)(*obj)[i]}));
    }
    return nodes;
}

vector<vector<int>> extract_lines(
    vector<vector<int>> *obj,
    vector<vector<int>> *root)
{
    // convert list of points to list of lines
    vector<vector<int>> nodes = vector<vector<int>>();
    for (int i = 0; i < obj->size() - 1; i++)
        nodes.push_back({(*obj)[i][0],
                         (*obj)[i][1],
                         (*obj)[i + 1][0],
                         (*obj)[i + 1][1]});
    return nodes;
}

class Plot
{

public:
    void start()
    {
        // 1d array
        // to convert to points see Extractor
        vector<int> arrInt = vector<int>(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines see Extractor
        vector<vector<int>> points = vector<vector<int>>();
        points.push_back(vector<int>({2, 4}));
        points.push_back(vector<int>({1, 7}));
        points.push_back(vector<int>({5, -1}));
        points.push_back(vector<int>({-4, -1}));

        // list of lines
        vector<vector<int>> lines = vector<vector<int>>();
        lines.push_back(vector<int>({8, 4, 1, 8}));
        lines.push_back(vector<int>({5, -1, 6, 8}));
        lines.push_back(vector<int>({-4, -1, 2, 3}));
        lines.push_back(vector<int>({3, 4, 5, 6}));

        cout << "done" << endl;
    }
};

void main(int argc, char **argv)
{
    Plot().start();
}
