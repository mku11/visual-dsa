#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <vector>

using namespace std;

// UI settings
// Expression: arrayList
//   Type: std::vector<int> *
//     Layout: Array
//     Save: Object Attributes

// Expression: this->listOfLists
//   Type: std::vector<std::vector<int>> *
//     Layout: Array2D
//     Save: Object Attributes

class Lists
{
private:
    vector<vector<int>> *listOfLists;

public:
    void start()
    {
        // list
        vector<int> *arrayList = new vector<int>();
        arrayList->push_back(1);
        arrayList->push_back(2);

        // list of lists
        listOfLists = new vector<vector<int>>();
        vector<int> a1 = vector<int>();
        a1.push_back(1);
        a1.push_back(2);
        vector<int> a2 = vector<int>();
        a2.push_back(3);
        a2.push_back(4);
        listOfLists->push_back(a1);
        listOfLists->push_back(a2);

        char x[2] = {0,1};
        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }
};

void main(int argc, char **argv)
{
    Lists().start();
}
