package app;

// UI settings
// Expression: x
//   Type: int
//     Layout: None
//     Save: Object Attributes

// Expression: x1
//   Type: Float
//     Layout: None
//     Save: Object Attributes

public class Primitives {
    public static void main(String[] args) {
        int x = 1;
        x = 2;
        x = 3;

        Float x1 = 1.1;
        x1 = 2.2;
        x1 = 3.3;

        System.out.println("x: " + x + ", x1: " + x1);

        System.out.println("done");
    }
}