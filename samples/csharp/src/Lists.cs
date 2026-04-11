using System;
using System.Collections.Generic;

// UI settings
// Expression: arrayList
//   Type: System.Collections.Generic.List<int>
//     Layout: Array
//     Save: Object Attributes

// Expression: this.listOfLists
//   Type: System.Collections.Generic.List<System.Collections.Generic.List<int>>
//     Layout: Array2D
//     Save: Object Attributes
internal class Lists
{
    List<List<int>> listOfLists;
    public static void RunMain(string[] args)
    {
        new Lists().Start();
    }

    public void Start()
    {
        // list
        List<int> arrayList = new List<int>();
        arrayList.Add(1);
        arrayList.Add(2);

        // list of lists
        listOfLists = new List<List<int>>();
        List<int> a1 = new List<int>();
        a1.Add(1);
        a1.Add(2);
        List<int> a2 = new List<int>();
        a2.Add(3);
        a2.Add(4);
        listOfLists.Add(a1);
        listOfLists.Add(a2);

        Console.WriteLine("done");
    }
}