using System;
using System.Collections.Generic;

namespace Demo
{
    class Program
    {

        static void Main(string[] args)
        {
            // We need to register Linq for visual-dsa to work, any linq method will do
            System.Linq.Enumerable.Select(["RegisterLinq"], x => x);
            
            if (args.Length == 0 || args[0] == "Arrays")
                Arrays.RunMain(args);
            else if (args[0] == "Lists")
                Lists.RunMain(args);
            else if (args[0] == "Graphs")
                Graphs.RunMain(args);
            else if (args[0] == "Trees")
                Trees.RunMain(args);
            else if (args[0] == "Hashes")
                Hashes.RunMain(args);
            else if (args[0] == "LinkedLists")
                LinkedLists.RunMain(args);
            else if (args[0] == "Primitives")
                Primitives.RunMain(args);
            else if (args[0] == "GraphMapNodes")
                GraphMapNodes.RunMain(args);
            else if (args[0] == "DoublyLinkedLists")
                DoublyLinkedLists.RunMain(args);
            else if (args[0] == "Queues")
                Queues.RunMain(args);
            else if (args[0] == "Plot")
                Plot.RunMain(args);
        }
    }
}
