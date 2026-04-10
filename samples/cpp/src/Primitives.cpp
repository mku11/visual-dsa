#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <list>

using namespace std;

class Primitives
{
public:
    void start()
    {
        int x = 1;
        x = 2;
        x = 3;

        char y = 'a';

        string z = "test";

        cout << x << "," << y << "," << z << endl;
        cout << "done" << endl;
    }
};

void main(int argc, char **argv)
{
    Primitives().start();
}
