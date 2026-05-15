import math
import random
import matplotlib.pyplot as plt

class SA_TS:
    def __init__(self, num_nodes=40):
        self.num_nodes = num_nodes
        self.nodes = [(random.randint(0, 100), random.randint(0, 50)) for _ in range(num_nodes)]
        self.path = list(range(num_nodes))
        random.shuffle(self.path)
        self.path.append(self.path[0])

    def get_dist(self, a, b):
        """Odległość miedzy mastami a i b"""
        node_a = self.nodes[a]
        node_b = self.nodes[b]
        dx = node_a[0] - node_b[0]
        dy = node_a[1] - node_b[1]
        return math.floor(0.5 + math.sqrt(dx*dx + dy*dy))