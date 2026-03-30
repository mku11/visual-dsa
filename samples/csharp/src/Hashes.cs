using System;
using System.Collections.Generic;

class Hashes
{
    public static void RunMain(string[] args)
    {
        new Hashes().Start();
    }

    public void Start()
    {
        Dictionary<string, int> h1 = new Dictionary<string, int>();
        h1["1"] = 1;
        h1["2"] = 2;

        HashSet<string> hs1 = new HashSet<string>();
        hs1.Add("1");
        hs1.Add("2");

        Console.WriteLine("done");
    }
}