package app;

import java.util.ArrayList;

public class Lists {
    ArrayList<ArrayList<Integer>> listOfLists;
    public static void main(String[] args) {
        new Lists().test();
    }

    public void test() {
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
    }
}