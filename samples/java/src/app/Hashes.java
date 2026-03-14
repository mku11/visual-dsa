package app;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;

public class Hashes {
    private int x = 4;
    private int y = 4;
    
    public static void main(String[] args) {
        new Hashes().test();
    }

    public void test() {
        HashMap<String, Integer> h1 = new HashMap<>();
        h1.put("1", 1);
        h1.put("2", 2);

        LinkedHashMap<String, Integer> h2 = new LinkedHashMap<>();
        h2.put("1", 1);
        h2.put("2", 2);

        HashSet<String> hs1 = new HashSet<>();
        hs1.add("1");
        hs1.add("2");

        LinkedHashSet<String> hs2 = new LinkedHashSet<>();
        hs2.add("1");
        hs2.add("2");
    }
}