class GraphsPrimitivesEdges:
    @staticmethod
    def run_main():
        # graph with hashmap primitives
        gmap: dict[str, list[list[str]]] = {}
        gmap["1"] = [["2", "3"], ["10", "20"]]
        gmap["2"] = [["3", "4"], ["30", "40"]]
        gmap["3"] = []
        gmap["4"] = []
        gmap["5"] = []

# custom extractor
class Extractor:
    # register the custom types
    @staticmethod
    def register_types():
        return ["dict", "str"]

    @staticmethod
    def get_nodes(node: any, root: dict[str, list[list[str]]]):
        if isinstance(node, dict):
            nodes: list[str] = []
            for k in root.keys():
                nodes.append(k)
                break
            return nodes
        elif isinstance(node, str):
            nodes: list[str] = []
            nodeObj: str = node
            if nodeObj in root:
                if len(root[nodeObj]) >= 1:
                    return root[nodeObj][0]
        return []

    def get_edges(node: any, root: dict[str, list[list[str]]]):
        if isinstance(node, dict):
            return [""]
        elif isinstance(node, str):
            nodeObj: str = node
            if nodeObj in root:
                if len(root[nodeObj]) == 2:
                    return root[nodeObj][1]
        return []

    @staticmethod
    def __str__(node: str) -> str:
        if isinstance(node, dict):
            return ""
        elif isinstance(node, list):
            return str(node[0])
        return ""


GraphsPrimitivesEdges.run_main()
