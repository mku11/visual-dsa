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
vector<pair<string, vector<string>>> extractorRegisterAttrs()
{
    return vector<std::pair<string, vector<string>>>({                                                                                   // vector of
                                                      std::pair<string, vector<string>>("std::vector<int>", vector<string>({"points"})), // type and attrs
                                                      std::pair<string, vector<string>>("std::vector<std::vector<int>>", vector<string>({"lines"}))});
}

vector<vector<int>> extract(
    char *type,
    char *attr,
    void *obj,
    void *root)
{
    cout << "extract: " << type << ", " << attr << endl;
    if (!strcmp(type, "std::vector<int>") && !strcmp(attr, "points"))
    {
        // convert list of numbers to list of points (i,xi)
        vector<int> *objObject = (vector<int> *)obj;
        vector<vector<int>> nodes = vector<vector<int>>();
        for (int i = 0; i < objObject->size(); i++)
        {
            if ((*objObject)[i] != NULL)
            {
                nodes.push_back(vector<int>({i, (int)(*objObject)[i]}));
            }
        }
        return nodes;
    }
    else if (!strcmp(type, "std::vector<std::vector<int>>") && !strcmp(attr, "lines"))
    {
        // convert list of points to list of lines
        vector<vector<int>> *objObject = (vector<vector<int>> *)obj;
        vector<vector<int>> nodes = vector<vector<int>>();
        for (int i = 0; i < objObject->size() - 1; i++)
        {
            nodes.push_back({(*objObject)[i][0],
                             (*objObject)[i][1],
                             (*objObject)[i + 1][0],
                             (*objObject)[i + 1][1]});
        }
        return nodes;
    }
    return vector<vector<int>>();
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

void plotRunMain(int argc, char **argv)
{
    Plot().start();
}
