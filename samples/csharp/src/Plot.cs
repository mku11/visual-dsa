using System;
using System.Collections.Generic;


// UI settings
// Expression: arrInt
//   Type: int?[]
//     Layout: Plot
//     Points: @points
//     Save: Object Attributes

// Expression: points
//   Type: System.Collections.Generic.List<System.Collections.Generic.List<int>>
//     Layout: Plot
//     Save: Object Attributes

// Expression: points
//   Type: System.Collections.Generic.List<System.Collections.Generic.List<int>>
//     Layout: Plot
//     Points: @lines
//     Save: Object Attributes

// Expression: lines
//   Type: System.Collections.Generic.List<System.Collections.Generic.List<int>>
//     Layout: Plot
//     Save: Object Attributes

// Note: format for plotting:
// To plot points: [[x1,y1],[x2,y2],...]
// To plot lines: [[x1,y1,x2,y2],[x3,y3,x4,y4],...]
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
        public static object[] RegisterAttrs()
        {
            return [
                new object[]{"int?[]",
                    new string[]{"points"}},
                new object[] {"System.Collections.Generic.List<System.Collections.Generic.List<int>>",
                    new string[]{"lines"}}
            ];
        }

        public static List<int[]> Extract_points(
            int?[] obj,
            object root)
        {
            // convert list of numbers to list of points (i,xi)
            List<int[]> nodes = new List<int[]>();
            for (int i = 0; i < obj.Length; i++)
            {
                if (obj[i] == null)
                    continue;
                nodes.Add([i, (int)obj[i]]);
            }
            return nodes;
        }

        public static List<int[]> Extract_lines(
            List<List<int>> obj, object root)
        {
            // convert list of points to list of lines
            List<int[]> nodes = new List<int[]>();
            for (int i = 0; i < obj.Count - 1; i++)
            {
                nodes.Add([
                    obj[i][0], obj[i][1],
                    obj[i + 1][0], obj[i + 1][1]
                ]);
            }
            return nodes;
        }
    }
}