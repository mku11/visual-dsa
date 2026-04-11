#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>

// UI settings
// Expression: arrString
//   Type: char *[5]
//     Layout: Array
//     Save: Object Attributes

// Expression: arrInt
//   Type: int[5]
//     Layout: Array
//     Markers: [0,1]
//     Save: Object Attributes

// Expression: arr2D,[0:5|0:10]
//   Type: int * *
//     Layout: Array2D
//     Markers: [[0,1],[1,2]]
//     Save: Object Attributes

// Expression: arr3D,[0:4|0:5|0:2]
//   Type: int * * *
//     Layout: Array3D
//     Markers: [[0,1,0],[1,2,1]]
//     Save: Object Attributes

// Note: Ranges format (for each dimension separate with '|' ): 
// <variable>,[startX:endX|startY:endY|startZ:endZ]
// Ranges are required for pointers to arrays
char **arrChar2D = NULL;
uint8_t *data = NULL;
void main(int argc, char **argv)
{
    char *arrString[5];
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
    int **arr2D = (int **)malloc(sizeof(int *) * 10);
    arr2D[0] = (int *)malloc(sizeof(int) * 3);
    arr2D[1] = (int *)malloc(sizeof(int) * 4);
    arr2D[2] = (int *)malloc(sizeof(int) * 4);
    arr2D[4] = (int *)malloc(sizeof(int) * 1);

    arr2D[1][1] = 122;
    arr2D[2][2] = 2;
    arr2D[2][3] = 3;

    int ms[2] = {1, 1};
    int ms2[3] = {2, 2, 1};

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
    int2D[0] = (int *)malloc(sizeof(int *) * 3);
    int2D[0][0] = 1;
    int2D[0][1] = 2;
    int2D[0][2] = 3;

    int2D[1] = (int *)malloc(sizeof(int *) * 3);
    int2D[1][0] = 4;
    int2D[1][1] = 5;
    int2D[1][2] = 6;

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
    arr3D[1][2][2] = 6;
    arr3D[1][2][3] = 4;

    printf("done\n");

    // generally this is where you should be releasing
    // the allocated memory
}