using System;
using System.Collections.Generic;

public class Plot
{
    public static void RunMain(String[] args)
    {
        new Plot().Test();
    }

    void Test()
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
}

// custom extractor
class Extractor
{

    // register the types
    public static string[] RegisterTypes()
    {
        return new string[] {
                // uncomment for custom conversions, see below
                "int?[]", "System.Collections.Generic.List<System.Collections.Generic.List<int>>"
        };
    }

    public static List<int[]> GetPlotPoints(
            int?[] obj,
            Object root)
    {
        // convert list of numbers to list of points (i,xi)
        List<int[]> nodes = new List<int[]>();
        for (int i = 0; i < obj.Length; i++)
        {
            if (obj[i] != null)
            {
                nodes.Add([i, (int)obj[i]]);
            }
        }
        return nodes;
    }

    public static List<int[]> GetPlotLines(
            List<List<int>> obj,
            Object root)
    {
        if (obj[0].Count != 2)
        {
            return null;
        }

        // convert list of points to list of lines
        List<int[]> nodes = new List<int[]>();
        for (int i = 0; i < obj.Count - 1; i++)
        {
            nodes.Add([
                    obj[i][0],
                    obj[i][1],
                    obj[i + 1][0],
                    obj[i + 1][1]
            ]);
        }
        return nodes;
    }
}