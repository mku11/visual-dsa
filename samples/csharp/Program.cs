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

            // Arrays.RunMain(args);
            // Lists.RunMain(args);
            // Graphs.RunMain(args);
            // Trees.RunMain(args);
            // Hashes.RunMain(args);
            // LinkedLists.RunMain(args);
            // Primitives.RunMain(args);
            // GraphMapNodes.RunMain(args);
            // GraphsPrimitivesEdges.RunMain(args);
            DoublyLinkedLists.RunMain(args);
            // Queues.RunMain(args);
            // Plot.RunMain(args);
        }
    }
}
