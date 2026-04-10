
# UI settings
# Expression: x
#   Type: int
#     Layout: None
#     Save: Object Attributes

# Expression: x1
#   Type: float
#     Layout: None
#     Save: Object Attributes

class Primitives:
    @staticmethod
    def run_main():
        Primitives().start()

    def start(self):
        x: int = 1
        x = 2
        x = 3

        x1: float = 1.1
        x1 = 2.2
        x1 = 3.3

        print("done")


Primitives().run_main()
