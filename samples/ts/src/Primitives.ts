// UI settings
// Expression: x
//   Type: number
//     Layout: None
//     Save: Object Attributes

// Expression: x1
//   Type: number
//     Layout: None
//     Save: Object Attributes

class Primitives {
    public static runMain() {
        let x = 1;
        x = 2;
        x = 3;
        
        let x1 = 1.1;
        x1 = 2.2;
        x1 = 3.3;

        console.log(x, x1);
        console.log("done");
    }
}
Primitives.runMain();