class Hashes {
    y = 2;
    public static runMain() {
        new Hashes().test();
    }

    public test() {
        const x = 1;
        console.log(x);

        const h1: Map<string, number> = new Map<string, number>();
        h1.set("1", 1);
        h1.set("2", 2);

        const hs1: Set<string> = new Set<string>();
        hs1.add("1");
        hs1.add("2");
    }
}

Hashes.runMain();