from typing import Any, List


class Arrays:
    @staticmethod
    def run_main():
        Arrays().start()

    def start(self):
        # 1d array
        # to convert to points see Extractor
        arrInt: List[int] = [None] * 5
        arrInt[1] = 1
        arrInt[2] = 212

        # list of points
        # to convert to lines see Extractor
        points: List[List[int]] = []
        points.append([2, 4])
        points.append([1, 7])
        points.append([5, -1])
        points.append([-4, -1])

        # list of lines
        lines: List[List[int]] = []
        lines.append([8, 4, 1, 8])
        lines.append([5, -1, 6, 8])
        lines.append([-4, -1, 2, 3])
        lines.append([3, 4, 5, 6])

        print("done")


# custom extractor
class Extractor:
    # register the types
    @staticmethod
    def register_types() -> List[str]:
        return [
            # uncomment for custom conversions, see below
            "list[]",
            "list[][]",
        ]

    @staticmethod
    def get_plot_points(obj: Any, root: Any) -> List[List[int]]:
        if not isinstance(obj, List):
            return []

            # if there are
        if isinstance(obj[0], List):
            return obj

            # convert list of numbers to list of points (i,xi)
        nodes: List[List[int]] = []
        for i in range(len(obj)):
            if obj[i]:
                nodes.append([i, int(obj[i])])
        return nodes

    @staticmethod
    def get_plot_lines(obj: Any, root: Any) -> List[List[int]]:
        if not isinstance(obj, List):
            return []

        if not isinstance(obj[0], List) or len(obj[0]) != 2:
            return obj

            # convert list of points to list of lines
        nodes: List[List[int]] = []
        for i in range(len(obj) - 1):
            nodes.append(obj[i] + obj[i + 1])
        return nodes


Arrays.run_main()
