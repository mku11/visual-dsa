using System;

// UI settings
// Expression: x
//   Type: int
//     Layout: None
//     Save: Object Attributes

// Expression: x1
//   Type: float
//     Layout: None
//     Save: Object Attributes
class Primitives
{
    public static void RunMain(string[] args)
    {
        new Primitives().Start();
    }

    public void Start()
    {
        int x = 1;
        x = 2;
        x = 3;

        float x1 = 1.1f;
        x1 = 2.2f;
        x1 = 3.3f;

        Console.WriteLine(x + "," + x1);
        Console.WriteLine("done");
    }
}