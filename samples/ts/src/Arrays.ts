class Arrays {
    arrChar2D: Array<Array<string>> | undefined;

    static runMain() {
        new Arrays().test();
    }

    public test() {
        const arrString: Array<string> = new Array<string>(5);
        arrString[1] = "one";
        arrString[2] = "two";

        // array
        const arrInt: Array<number> = new Array<number>(5);
        arrInt[1] = 1;
        arrInt[2] = 212;

        const arrInteger: Array<number> = new Array<number>();
        arrInteger[1] = 1;
        arrInteger[2] = 212;

        // 2d array
        const arr2D: Array<Array<number>> = new Array<Array<number>>(15);
        arr2D[0] = new Array(3);
        arr2D[1] = new Array(4);
        arr2D[2] = new Array(4);
        arr2D[4] = new Array(1); 

        arr2D[1][1] = 122;
        arr2D[2][2] = 2;
        arr2D[2][3] = 3; 

        // 2d char array
        this.arrChar2D = new Array(5);
        this.arrChar2D[0] = new Array(3);
        this.arrChar2D[1] = new Array(4);
        this.arrChar2D[2] = new Array(4);
        this.arrChar2D[4] = new Array(1);

        this.arrChar2D[1][1] = 'a';
        this.arrChar2D[2][2] = 'b';
        this.arrChar2D[2][3] = 'c';

        // 3d array
        const arr3D: Array<Array<Array<number>>> = new Array<Array<Array<number>>>(5);

        // z = 0
        arr3D[0] = new Array(5);
        arr3D[0][0] = new Array(3);
        arr3D[0][1] = new Array(4);
        arr3D[0][2] = new Array(4);
        arr3D[0][4] = new Array(1);
        arr3D[0][1][1] = 1;
        arr3D[0][2][2] = 2;
        arr3D[0][2][3] = 3;

        // z = 1
        arr3D[1] = new Array(5);
        arr3D[1][0] = new Array(3);
        arr3D[1][1] = new Array(4);
        arr3D[1][2] = new Array(4);
        arr3D[1][4] = new Array(1);
        arr3D[1][1][1] = 1;
        arr3D[1][2][2] = 2;
        arr3D[1][2][3] = 3;
    }
}

Arrays.runMain();