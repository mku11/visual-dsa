class Lists:
    listOfLists = None

    @staticmethod
    def run_main():
        Lists().test()

    def test(self):
        arrString: list[str] = [None] * 5
        arrString[1] = "one"
        arrString[2] = "two"

        # list
        arrayList: list[int] = []
        arrayList.append(1)
        arrayList.append(2)

        # list of lists
        listOfLists: list[list[int]] = []
        a1 = []
        a1.append(1)
        a1.append(2)
        a2 = []
        a2.append(3)
        a2.append(4)
        listOfLists.append(a1)
        listOfLists.append(a2)

        # list of lists of char (2d rugged)
        arrChar2D = [None] * 5
        arrChar2D[0] = [None] * 3
        arrChar2D[1] = [None] * 4
        arrChar2D[2] = [None] * 4
        arrChar2D[4] = [None]

        arrChar2D[1][1] = "a"
        arrChar2D[2][2] = "b"
        arrChar2D[2][3] = "c"

        # list of lists of lists (3d rugged)
        arr3D: list[list[list[int]]] = [None] * 5

        # z = 0
        arr3D[0] = [None] * 5
        arr3D[0][0] = [None] * 3
        arr3D[0][1] = [None] * 4
        arr3D[0][2] = [None] * 4
        arr3D[0][4] = [None]
        arr3D[0][1][1] = 1
        arr3D[0][2][2] = 2
        arr3D[0][2][3] = 3

        # z = 1
        arr3D[1] = [None] * 5
        arr3D[1][0] = [None] * 3
        arr3D[1][1] = [None] * 4
        arr3D[1][2] = [None] * 4
        arr3D[1][4] = [None]
        arr3D[1][1][1] = 11
        arr3D[1][2][2] = 21
        arr3D[1][2][3] = 31


Lists.run_main()
