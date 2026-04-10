#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <map>
#include <set>

using namespace std;

class Hashes
{
public:
    void start()
    {
        map<string, int> h1 = map<string, int>();
        h1.insert({"1", 1});
        h1.insert({"2", 2});

        set<string> hs1 = set<string>();
        hs1.insert("1");
        hs1.insert("2");

        for (std::pair<string, int> el : h1)
            cout << el.first << ":" << el.second << endl;

        cout << "done" << endl;
        
        // generally this is where you should be releasing
        // the allocated memory
    }
};

void main(int argc, char **argv)
{
    Hashes().start();
}