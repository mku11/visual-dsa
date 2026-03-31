using System;
using System.Collections.Generic;

internal class Plot
{
    public static void RunMain(string[] args)
    {
        new Plot().Start();
    }

    void Start()
    {
        // 1d array
        // to convert to points see Extractor
        int?[] arrInt = new int?[5];
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines see Extractor
        List<List<int>> points = new List<List<int>>();
        points.Add(new List<int>([2, 4]));
        points.Add(new List<int>([1, 7]));
        points.Add(new List<int>([5, -1]));
        points.Add(new List<int>([-4, -1]));

        // list of lines
        List<List<int>> lines = new List<List<int>>();
        lines.Add(new List<int>([8, 4, 1, 8]));
        lines.Add(new List<int>([5, -1, 6, 8]));
        lines.Add(new List<int>([-4, -1, 2, 3]));
        lines.Add(new List<int>([3, 4, 5, 6]));

        Console.WriteLine("done");
    }


    // custom extractor
    static class Extractor
    {
        // register the custom attributes to extract
        // you can select these from the ui 
        // instead of modifying your objects
        public static object[] Register()
        {
            return [
                new object[]{"int?[]",
                    new string[]{"points"}},
                new object[] {"System.Collections.Generic.List<System.Collections.Generic.List<int>>",
                    new string[]{"lines"}}
            ];
        }

        public static object[] Extract(
            string type,
            string attr,
            object obj,
            object root)
        {
            Console.WriteLine("extract: " + type + ", " + attr);
            if (type == "int?[]" && attr == "points")
            {
                // convert list of numbers to list of points (i,xi)
                int?[] objObject = obj as int?[];
                List<int[]> nodes = new List<int[]>();
                for (int i = 0; i < objObject.Length; i++)
                {
                    if (objObject[i] != null)
                    {
                        nodes.Add([i, (int)objObject[i]]);
                    }
                }
                return nodes.ToArray();
            }
            else if (type == "System.Collections.Generic.List<System.Collections.Generic.List<int>>"
             && attr == "lines")
            {
                // convert list of points to list of lines
                List<List<int>> objObject = obj as List<List<int>>;
                List<int[]> nodes = new List<int[]>();
                for (int i = 0; i < objObject.Count - 1; i++)
                {
                    nodes.Add([
                        objObject[i][0],
                            objObject[i][1],
                            objObject[i + 1][0],
                            objObject[i + 1][1]
                    ]);
                }
                return nodes.ToArray();
            }
            return null;
        }
    }
}