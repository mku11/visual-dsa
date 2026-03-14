using System;
using System.Collections.Generic;

public class Lists
{
    List<List<int>> listOfLists;
    public static void RunMain(String[] args)
    {
        new Lists().Test();
    }

    public void Test()
    {
        // // list
        List<int> arrayList = new List<int>();
        arrayList.Add(1);
        arrayList.Add(2);

        // // // list of lists
        listOfLists = new List<List<int>>();
        List<int> a1 = new List<int>();
        a1.Add(1);
        a1.Add(2);
        List<int> a2 = new List<int>();
        a2.Add(3);
        a2.Add(4);
        listOfLists.Add(a1);
        listOfLists.Add(a2);
    }
}