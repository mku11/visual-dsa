#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>


// UI settings

// Expression: points
//   Type: int[4][2]
//     Layout: Plot
//     Save: Object Attributes

// Expression: lines
//   Type: int[4][4]
//     Layout: Plot
//     Save: Object Attributes

// Note: format for plotting:
// To plot points: [[x1,y1],[x2,y2],...]
// To plot lines: [[x1,y1,x2,y2],[x3,y3,x4,y4],...]

void main(int argc, char **argv)
{
    // list of points
    int points[4][2] = {
        {2, 4},
        {1, 7},
        {5, -1},
        {-4, -1}};

    // list of lines
    int lines[4][4] = {
        {8, 4, 1, 8},
        {5, -1, 6, 8},
        {-4, -1, 2, 3},
        {3, 4, 5, 6}};

    printf("done\n");
}