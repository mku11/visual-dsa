#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <list>

using namespace std;

// UI settings
// Expression: x
//   Type: int
//     Layout: None
//     Save: Object Attributes

// Expression: x1
//   Type: float
//     Layout: None
//     Save: Object Attributes

class Primitives
{
public:
    void start()
    {
        int x = 1;
        x = 2;
        x = 3;

        float x1 = 1.1f;
        x1 = 2.2f;
        x1 = 3.3f;
        

        cout << x << "," << x1 << endl;
        cout << "done" << endl;
    }
};

void main(int argc, char **argv)
{
    Primitives().start();
}
