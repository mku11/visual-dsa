#include <stdlib.h>
#include <stdio.h>

// UI settings
// Expression: x
//   Type: int
//     Layout: None
//     Save: Object Attributes

// Expression: x1
//   Type: Float
//     Layout: None
//     Save: Object Attributes

void main(int argc, char **argv)
{
    int x = 1;
    x = 2;
    x = 3;

    float x1 = 1.1;
    x1 = 2.2;
    x1 = 3.3;

    printf("%d, %f\n", x, x1);
    printf("done");
}
