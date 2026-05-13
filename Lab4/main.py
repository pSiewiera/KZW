import math
import random
import matplotlib.pyplot as plt

class TSP_SA:
    def __init__(self, num_nodes=40):
        self.num_nodes = num_nodes
        # Losowanie miast (x: 0-100, y: 0-50) 
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

    def get_path_dist(self, path):
        """Oblicza całkowitą długość ścieżki"""
        total = 0
        for i in range(len(path) - 1):
            total += self.get_dist(path[i], path[i+1])
        return total

    def move_2opt(self, path):
        """Zamiana segmentu trasy """
        new_path = path[:]
        a = random.randint(1, self.num_nodes - 1)
        b = random.randint(1, self.num_nodes - 1)
        if a > b: a, b = b, a
        
        new_path[a:b+1] = reversed(new_path[a:b+1])
        return new_path

    def run_sa(self, iterations=100000, start_temp=2000):
        temp = start_temp
        cooling_rate = 0.99993 
        
        current_path = self.path
        current_dist = self.get_path_dist(current_path)
        
        history = []
        iter_count = []

        print(f"Start. Dystans początkowy: {current_dist}")

        for i in range(iterations):
            new_path = self.move_2opt(current_path)
            new_dist = self.get_path_dist(new_path)
            
            delta = new_dist - current_dist
            
            if delta < 0 or random.random() < math.exp(-delta / temp):
                current_path = new_path
                current_dist = new_dist
            
            temp *= cooling_rate
            
            if i % 200 == 0:
                history.append(current_dist)
                iter_count.append(i)

        print(f"Koniec. Dystans końcowy: {current_dist}")
        return iter_count, history

# --- Uruchomienie i Wykres ---
tsp = TSP_SA(40)
iters, dists = tsp.run_sa(iterations=100000)

plt.figure(figsize=(10, 6))
plt.plot(iters, dists, color='#322', linewidth=2)
plt.title('Zbieżność algorytmu Symulowanego Wyżarzania (TSP)', fontsize=14)
plt.xlabel('Iteracja', fontsize=12)
plt.ylabel('Długość drogi', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.6)
plt.show()