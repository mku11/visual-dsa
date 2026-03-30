class Hashes():
    @staticmethod
    def run_main():
        Hashes().start()

    def start(self):
        h1: dict[str,int] = {}
        h1["1"] = 1
        h1["2"] = 2

        hs1: set[str] = set()
        hs1.add("1")
        hs1.add("2")

        print("done")
            
Hashes.run_main()