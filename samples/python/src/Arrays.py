import numpy as np


class Arrays:

    @staticmethod
    def runMain():
        Arrays().test()

    def test(self):
        # byte array
        arrInt: bytearray = bytearray([0] * 5)
        arrInt[1] = 1
        arrInt[2] = 212

        # np array
        arrInt: np.array = np.zeros(5, np.int32)
        arrInt[1] = 1
        arrInt[2] = 212

        # 2d np array
        arr2D: np.array = np.zeros((5, 5), np.int32)
        arr2D[1][1] = 122
        arr2D[2][2] = 2
        arr2D[2][3] = 3

        # 3d np array
        arr3D: np.array = np.zeros((5, 5, 5), np.int32)

        # z = 0
        arr3D[0][1][1] = 1
        arr3D[0][2][2] = 2
        arr3D[0][2][3] = 3

        # z = 1
        arr3D[1][1][1] = 1
        arr3D[1][2][2] = 2
        arr3D[1][2][3] = 3

Arrays().runMain()
