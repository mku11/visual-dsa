class Hashes():
    x = 4
    y = 4
    
    @staticmethod
    def run_main():
        Hashes().test()

    def test(self):
        h1: dict[str,int] = {}
        h1["1"] = 1
        h1["2"] = 2

        hs1: set[str] = set()
        hs1.add("1")
        hs1.add("2")
            
Hashes.run_main()