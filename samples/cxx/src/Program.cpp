#include <cstdlib>
#include <cstring>

extern void arraysRunMain(int argc, char **argv);
extern void doublyLinkedListsRunMain(int argc, char **argv);
extern void graphMapNodesRunMain(int argc, char **argv);
extern void plotRunMain(int argc, char **argv);

int main(int argc, char **argv)
{
    if (argc == 0 || strcmp(argv[1], "Arrays") == 0)
        arraysRunMain(argc, argv);
    // else if (args[0] == "Lists")
    //     Lists.RunMain(args);
    // else if (args[0] == "Graphs")
    //     Graphs.RunMain(args);
    // else if (args[0] == "Trees")
    //     Trees.RunMain(args);
    // else if (args[0] == "Hashes")
    //     Hashes.RunMain(args);
    // else if (args[0] == "LinkedLists")
    //     LinkedLists.RunMain(args);
    // else if (args[0] == "Primitives")
    //     Primitives.RunMain(args);
    else if (strcmp(argv[1], "GraphMapNodes") == 0)
        graphMapNodesRunMain(argc, argv);
    else if (strcmp(argv[1], "DoublyLinkedLists") == 0)
        doublyLinkedListsRunMain(argc, argv);
    // else if (args[0] == "Queues")
    //     Queues.RunMain(args);
    else if (strcmp(argv[1], "Plot") == 0)
        plotRunMain(argc, argv);
}