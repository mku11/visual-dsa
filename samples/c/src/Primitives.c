#include <stdlib.h>
#include <stdio.h>

void main(int argc, char **argv)
{
    int x = 1;
    x = 2;
    x = 3;

    char y = 'a';

    char *z = "test";

    printf("%d, %c %s\n", x, y, z);
    printf("done");
}
