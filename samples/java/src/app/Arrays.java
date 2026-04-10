package app;

// UI settings
// Expression: arrString
//   Type: String[]
//     Layout: Array
//     Save: Object Attributes

// Expression: arrInt
//   Type: int[]
//     Layout: Array
//     Markers: [0,1]
//     Save: Object Attributes

// Expression: arr2D
//   Type: int[][]
//     Layout: Array2D
//     Markers: [[0,1],[1,2]]
//     Save: Object Attributes

// Expression: arr3D
//   Type: int[][][]
//     Layout: Array3D
//     Markers: [[0,1,0],[1,2,1]]
//     Save: Object Attributes

// Note: Format for markers: [[x1,y1,z1],[x2,y2,z2]...]
public class Arrays {
    char[][] arrChar2D;

    public static void main(String[] args) {
        new Arrays().start();
    }

    public void start() {

        String[] arrString = new String[5];
        arrString[1] = "one";
        arrString[2] = "two";

        // // array
        int[] arrInt = new int[5];
        arrInt[1] = 1;
        arrInt[2] = 212;

        Integer[] arrInteger = new Integer[5];
        arrInteger[1] = 1;
        arrInteger[2] = 2;

        // // // 2d array
        int[][] arr2D = new int[15][];
        arr2D[0] = new int[3];
        arr2D[1] = new int[4];
        arr2D[2] = new int[4];
        arr2D[4] = new int[1];

        arr2D[1][1] = 122;
        arr2D[2][2] = 2;
        arr2D[2][3] = 3;

        // // // 2d char array
        arrChar2D = new char[5][];
        arrChar2D[0] = new char[3];
        arrChar2D[1] = new char[4];
        arrChar2D[2] = new char[4];
        arrChar2D[4] = new char[1];

        arrChar2D[1][1] = 'a';
        arrChar2D[2][2] = 'b';
        arrChar2D[2][3] = 'c';

        // 3d array
        int[][][] arr3D = new int[5][][];

        // z = 0
        arr3D[0] = new int[5][];
        arr3D[0][0] = new int[3];
        arr3D[0][1] = new int[4];
        arr3D[0][2] = new int[4];
        arr3D[0][4] = new int[1];
        arr3D[0][1][1] = 1;
        arr3D[0][2][2] = 2;
        arr3D[0][2][3] = 3;

        // z = 1
        arr3D[1] = new int[5][];
        arr3D[1][0] = new int[3];
        arr3D[1][1] = new int[4];
        arr3D[1][2] = new int[4];
        arr3D[1][4] = new int[1];
        arr3D[1][1][1] = 1;
        arr3D[1][2][2] = 2;
        arr3D[1][2][3] = 3;

        System.out.println("done");
    }
}