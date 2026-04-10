package app;

import java.util.ArrayList;

// UI settings
// Expression: arrayList
//   Type: ArrayList
//     Layout: Array
//     Save: Object Attributes

// Expression: this.listOfLists
//   Type: ArrayList
//     Layout: Array2D
//     Save: Object Attributes
public class Lists {
    ArrayList<ArrayList<Integer>> listOfLists;
    public static void main(String[] args) {
        new Lists().start();
    }

    public void start() {
        // list
        ArrayList<Integer> arrayList = new ArrayList<>();
        arrayList.add(1);
        arrayList.add(2);

        // list of lists
        listOfLists = new ArrayList<>();
        ArrayList<Integer> a1 = new ArrayList<>();
        a1.add(1);
        a1.add(2);
        ArrayList<Integer> a2 = new ArrayList<>();
        a2.add(3);
        a2.add(4);
        listOfLists.add(a1);
        listOfLists.add(a2);

        System.out.println("done");
    }
}