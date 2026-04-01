class Lists {
    listOfLists: number[][] | undefined;

    public static runMain() {
        new Lists().start();
    }

    public start() {
        // list
        const arrayList: number[] = [];
        arrayList.push(1);
        arrayList.push(2);

        // list of lists
        this.listOfLists = [];
        const a1: number[] = [];
        this.listOfLists.push(a1);
        a1.push(1);
        a1.push(2);
        
        const a2: number[] = [];
        this.listOfLists.push(a2);
        a2.push(3);
        a2.push(4);
        
        console.log("done");
    }
}

Lists.runMain();