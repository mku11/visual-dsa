class Lists {
    listOfLists: Array<Array<number>> | undefined;

    public static runMain() {
        new Lists().test();
    }

    public test() {
        // list
        const arrayList: Array<number> = new Array<number>();
        arrayList.push(1);
        arrayList.push(2);

        // list of lists
        this.listOfLists = new Array<Array<number>>();
        const a1: Array<number> = new Array<number>();
        this.listOfLists.push(a1);
        a1.push(1);
        a1.push(2);
        
        const a2: Array<number> = new Array<number>();
        this.listOfLists.push(a2);
        a2.push(3);
        a2.push(4);
        
        console.log("done");
    }
}

Lists.runMain();