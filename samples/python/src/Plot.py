from typing import Any


class Arrays:
    @staticmethod
    def run_main():
        Arrays().start()

    def start(self):
        # 1d array
        # to convert to points see Extractor
        arrInt: list[int] = [None] * 5
        arrInt[1] = 1
        arrInt[2] = 212

        # list of points
        # to convert to lines see Extractor
        points: list[list[int]] = []
        points.append([2, 4])
        points.append([1, 7])
        points.append([5, -1])
        points.append([-4, -1])

        # list of lines
        lines: list[list[int]] = []
        lines.append([8, 4, 1, 8])
        lines.append([5, -1, 6, 8])
        lines.append([-4, -1, 2, 3])
        lines.append([3, 4, 5, 6])

        print("done")


# custom extractor
class Extractor:
    # register the types
    @staticmethod
    def register_attrs() -> list[list[str, list[str]]]:
        return [
            ["list[]", ["points"]],
            ["list[][]", ["lines"]],
        ]

    @staticmethod
    def extract(
        type: str, attr: str, obj: object, root: object
    ) -> list[str] | list[int] | list[object] | None:

        print("extract:", type, attr)
        if type == "list[]" and attr == "points":
            objObject: list[list[str]] = obj
            nodes: list[list[int]] = []
            for i in range(len(objObject)):
                if objObject[i]:
                    nodes.append([i, int(objObject[i])])
            return nodes
        elif type == "list[][]" and attr == "lines":
            objObject: str = obj
            nodes: list[list[int]] = []
            for i in range(len(obj) - 1):
                nodes.append(obj[i] + obj[i + 1])
            return nodes


Arrays.run_main()
