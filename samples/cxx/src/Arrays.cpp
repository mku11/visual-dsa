#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <list>

using namespace std;

class Arrays
{
private:
    char **arrChar2D = NULL;
    uint8_t *data = NULL;

public:
    void start()
    {
        data = (uint8_t *)calloc(5, sizeof(uint8_t));
        data[0] = 121;
        data[1] = 122;
        data[2] = 123;

        string arrString[5];
        arrString[1] = "one";
        arrString[2] = "two";

        // array
        int arrInt[5];
        arrInt[1] = 1;
        arrInt[2] = 212;
        arrInt[3] = 2;

        // 2d array
        int arrInt2D[5][4];
        arrInt2D[1][1] = 1;
        arrInt2D[2][3] = 212;

        // 2d array pointer
        int **arr2D = (int **)malloc(sizeof(int *) * 15);
        arr2D[0] = (int *)malloc(sizeof(int) * 3);
        arr2D[1] = (int *)malloc(sizeof(int) * 4);
        arr2D[2] = (int *)malloc(sizeof(int) * 4);
        arr2D[4] = (int *)malloc(sizeof(int) * 1);

        arr2D[1][1] = 122;
        arr2D[2][2] = 2;
        arr2D[2][3] = 3;

        int ms[2] = {1,1};
        int ms2[3] = {2,2,1};

        // 2d char array
        arrChar2D = (char **)malloc(sizeof(char *) * 5);
        arrChar2D[0] = (char *)malloc(sizeof(char) * 3);
        arrChar2D[1] = (char *)malloc(sizeof(char) * 4);
        arrChar2D[2] = (char *)malloc(sizeof(char) * 4);
        arrChar2D[4] = (char *)malloc(sizeof(char) * 1);

        arrChar2D[1][1] = 'a';
        arrChar2D[2][2] = 'b';
        arrChar2D[2][3] = 'c';

        int **int2D = (int **)malloc(sizeof(int *) * 3);
        int2D[0] = new int[]{1, 2, 3};
        int2D[1] = new int[]{4, 5, 6};
        int2D[1] = NULL;

        // 3d array
        int ***arr3D = (int ***)malloc(sizeof(int **) * 5);

        // z = 0
        arr3D[0] = (int **)malloc(sizeof(int **) * 5);
        arr3D[0][0] = (int *)malloc(sizeof(int) * 3);
        arr3D[0][1] = (int *)malloc(sizeof(int) * 4);
        arr3D[0][2] = (int *)malloc(sizeof(int) * 4);
        arr3D[0][4] = (int *)malloc(sizeof(int) * 1);
        arr3D[0][1][1] = 1;
        arr3D[0][2][2] = 2;
        arr3D[0][2][3] = 3;

        // z = 1
        arr3D[1] = (int **)malloc(sizeof(int **) * 5);
        arr3D[1][0] = (int *)malloc(sizeof(int) * 3);
        arr3D[1][1] = (int *)malloc(sizeof(int) * 4);
        arr3D[1][2] = (int *)malloc(sizeof(int) * 4);
        arr3D[1][4] = (int *)malloc(sizeof(int) * 1);
        arr3D[1][1][1] = 1;
        arr3D[1][2][2] = 2;
        arr3D[1][2][3] = 3;

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }
};

void arraysRunMain(int argc, char **argv)
{
    Arrays().start();
}
