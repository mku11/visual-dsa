class GraphsPrimitivesEdges:
    @staticmethod
    def run_main():
        GraphsPrimitivesEdges().start()

    def start(self):
        # graph with hashmap primitives
        gmap: dict[str, list[list[str]]] = {}
        gmap["1"] = [  # node value
            ["2", "3"],  # children nodes
            ["10", "20"],  # chidlren edges
        ]
        gmap["2"] = [["3", "4"], ["30", "40"]]
        gmap["3"] = []  # no children nodes
        gmap["4"] = []
        gmap["5"] = []

        print("done")


# custom extractor
class Extractor:
    # register the custom attributes
    @staticmethod
    def register_attrs() -> list[list[str, list[str]]]:
        return [
            ["dict", ["customNodes"]],
            ["str", ["customNodes", "customEdges"]],
        ]

    @staticmethod
    def extract(
        type: str, attr: str, obj: object, root: object
    ) -> list[str] | list[int] | list[object] | None:

        print("extract:", type, attr)
        if type == "dict" and attr == "customNodes":
            rootObject: dict[str, list[list[str]]] = root
            nodes: list[str] = []
            for k in rootObject.keys():
                nodes.append(k)
                break
            return nodes
        elif type == "str" and attr == "customNodes":
            rootObject: dict[str, list[list[str]]] = root
            objObject: str = obj
            nodes: list[list[str]] | None = rootObject.get(objObject)
            if objObject in root and len(root[objObject]) >= 1:
                return root[objObject][0]
        elif type == "str" and attr == "customEdges":
            rootObject: dict[str, list[list[str]]] = root
            objObject: str = obj
            if objObject in root and len(rootObject[objObject]) == 2:
                return rootObject[objObject][1]


GraphsPrimitivesEdges.run_main()
