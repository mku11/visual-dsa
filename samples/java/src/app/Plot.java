package app;

import java.util.ArrayList;
import java.util.List;

public class Plot {
    public static void main(String[] args) {
        new Plot().start();
    }

    void start() {
        // 1d array
        // to convert to points see Extractor
        Integer[] arrInt = new Integer[5];
        arrInt[1] = 1;
        arrInt[2] = 212;

        // list of points
        // to convert to lines see Extractor
        List<List<Integer>> points = new ArrayList<>();
        points.add(List.of(new Integer[] { 2, 4 }));
        points.add(List.of(new Integer[] { 1, 7 }));
        points.add(List.of(new Integer[] { 5, -1 }));
        points.add(List.of(new Integer[] { -4, -1 }));

        // list of lines
        List<List<Integer>> lines = new ArrayList<>();
        lines.add(List.of(new Integer[] { 8, 4, 1, 8 }));
        lines.add(List.of(new Integer[] { 5, -1, 6, 8 }));
        lines.add(List.of(new Integer[] { -4, -1, 2, 3 }));
        lines.add(List.of(new Integer[] { 3, 4, 5, 6 }));

        System.out.println("done");
    }
}

// custom extractor
class Extractor {

    // register the custom attributes to extract
    // you can select these from the ui
    // instead of modifying your Objects
    public static Object[] register() {
        return new Object[] {
                new Object[] { "Integer[]",
                        new String[] { "points" } },
                new Object[] { "ArrayList",
                        new String[] { "lines" } }
        };
    }

    public static Object[] extract(
            String type,
            String attr,
            Object obj,
            Object root) {
        System.out.println("extract: " + type + ", " + attr);
        if (type.equals("Integer[]") && attr.equals("points")) {
            // convert list of numbers to list of points (i,xi)
            Integer[] objObject = (Integer[]) obj;
            List<int[]> nodes = new ArrayList<int[]>();
            for (int i = 0; i < objObject.length; i++) {
                if (objObject[i] != null) {
                    nodes.add(new int[] { i, (int) objObject[i] });
                }
            }
            return nodes.toArray();
        } else if (type.equals("ArrayList") && attr.equals("lines")) {
            // convert list of points to list of lines
            List<List<Integer>> objObject = (List<List<Integer>>) obj;
            List<int[]> nodes = new ArrayList<int[]>();
            for (int i = 0; i < objObject.size() - 1; i++) {
                nodes.add(new int[] {
                        objObject.get(i).get(0),
                        objObject.get(i).get(1),
                        objObject.get(i + 1).get(0),
                        objObject.get(i + 1).get(1)
                });
            }
            return nodes.toArray();
        }
        return null;
    }
}