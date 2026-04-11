// UI settings
// Expression: h1
//   Type: Map
//     Layout: Map
//     Save: Object Attributes
// Expression: hs1
//   Type: Set
//     Layout: Set
//     Save: Object Attributes
// 
class Hashes {
    public static runMain() {
        new Hashes().start();
    }

    start() {
        // expression: h1
        const h1: Map<string, number> = new Map<string, number>();
        h1.set("1", 1);
        h1.set("2", 2);

        // expression: hs1
        const hs1: Set<string> = new Set<string>();
        hs1.add("1");
        hs1.add("2");

        console.log("done");
    }
}

Hashes.runMain();