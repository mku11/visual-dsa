using System;
using System.Collections.Generic;

public class Hashes
{
    private int x = 4;
    private int y = 4;

    public static void RunMain(string[] args)
    {
        new Hashes().test();
    }

    public void test()
    {
        Dictionary<string, int> h1 = new Dictionary<string, int>();
        h1["1"] = 1;
        h1["2"] = 2;

        HashSet<string> hs1 = new HashSet<string>();
        hs1.Add("1");
        hs1.Add("2");
    }
}