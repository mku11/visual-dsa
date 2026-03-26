package app;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public class Plot {
    public static void main(String[] args) {
        new Plot().test();
    }

    void test() {
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

    // register the types
    public static String[] registerTypes() {
        return new String[] {
                // uncomment for custom conversions, see below
                "Integer[]", "ArrayList"
        };
    }

    public static List<int[]> getPlotPoints(
            Integer[] obj,
            Object root) {
        // convert list of numbers to list of points (i,xi)
        List<int[]> nodes = new ArrayList<>();
        for (int i = 0; i < obj.length; i++) {
            if (obj[i] != null) {
                nodes.add(new int[] { i, obj[i] });
            }
        }
        return nodes;
    }

    public static List<int[]> getPlotLines(
            List<List<Integer>> obj,
            Object root) {
        if (!(obj instanceof List))
            return null;

        if (!(obj.get(0) instanceof List) || obj.get(0).size() != 2) {            
            return null;
        }

        // convert list of points to list of lines
        List<int[]> nodes = new ArrayList<>();
        for (int i = 0; i < obj.size() - 1; i++) {
            nodes.add(new int[] {
                    obj.get(i).get(0),
                    obj.get(i).get(1),
                    obj.get(i + 1).get(0),
                    obj.get(i + 1).get(1)
            });
        }
        return nodes;
    }
}