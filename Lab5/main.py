import numpy as np
import matplotlib.pyplot as plt
import random
import time

NUM_NODES = 50
TIME_LIMIT = 180.0  
SA_TEMP_START = 10000.0
SA_TEMP_ALPHA = 0.99
TS_TABU_SIZE = 32

random.seed(42)
nodes = [(random.randint(0, 399), random.randint(0, 199)) for _ in range(NUM_NODES)]

def path_dist(path, nodes):
    dist = 0
    n = len(path)
    for i in range(n):
        n0 = path[i]
        n1 = path[(i + 1) % n]
        x0, y0 = nodes[n0]
        x1, y1 = nodes[n1]
        dist += int(round(np.sqrt((x0 - x1)**2 + (y0 - y1)**2)))
    return dist

def path_move(path, move):
    a, b = move
    path[a:b+1] = path[a:b+1][::-1]

def rand_ab(n):
    a = random.randint(1, n - 1)
    b = random.randint(1, n - 2)
    if b >= a:
        b += 1
    if a > b:
        a, b = b, a
    return a, b

def sa_step(path, temp, nodes, sa_best_dist, sa_best_path):
    c0 = path_dist(path, nodes)
    n = len(nodes)
    N_inner = int((n - 1) * (n - 2) / 2)
    for _ in range(N_inner):
        move = rand_ab(n)
        path_move(path, move)
        c1 = path_dist(path, nodes)
        akce = False
        if c1 > c0:
            praw = np.exp((c0 - c1) / temp)
            akce = (random.random() < praw)
        if c1 <= c0 or akce:
            c0 = c1
        else:
            path_move(path, move) 
        if sa_best_dist > c0:
            sa_best_dist = c0
            sa_best_path = list(path)
    return sa_best_dist, sa_best_path

def ts_is_path_tabu(path, tabu_list):
    for pos, city in tabu_list:
        if path[pos] == city:
            return True
    return False

def ts_add_move_tabu(path, move, tabu_list, tabu_size):
    a, b = move
    if a == 0 and b == 0:
        if len(tabu_list) >= 2:
            del tabu_list[:2]
        return
    tabu_list.append((a, path[a]))
    tabu_list.append((b, path[b]))
    if len(tabu_list) > (2 * tabu_size):
        del tabu_list[:2]

def ts_find_best_move(path, nodes, tabu_list, ts_best_dist, ts_best_path):
    best_a, best_b = 0, 0
    best_dist = 999999999
    n = len(nodes)
    for a in range(1, n - 1):
        for b in range(a + 1, n):
            path_move(path, (a, b))
            dist = path_dist(path, nodes)
            if not ts_is_path_tabu(path, tabu_list) and dist < best_dist:
                best_a, best_b = a, b
                best_dist = dist
            if dist < ts_best_dist:
                best_a, best_b = a, b
                best_dist = dist
            if ts_best_dist > best_dist:
                ts_best_dist = best_dist
                ts_best_path = list(path)
            path_move(path, (a, b)) 
    return (best_a, best_b), ts_best_dist, ts_best_path

def rand_path(n):
    path = list(range(n))
    for i in range(n - 1, 0, -1):
        j = random.randint(1, i)
        path[i], path[j] = path[j], path[i]
    return path

start_path = rand_path(NUM_NODES)
start_dist = path_dist(start_path, nodes)

sa_path = list(start_path)
ts_path = list(start_path)

sa_best_dist = start_dist
sa_best_path = list(start_path)
ts_best_dist = start_dist
ts_best_path = list(start_path)

ts_tabu = []
sa_temp = SA_TEMP_START

sa_history = [(0.0, start_dist)]
ts_history = [(0.0, start_dist)]

print(f"Rozpoczynam obliczenia z limitem {TIME_LIMIT}s na algorytm...")

print("Trwa uruchamianie SA...")
sa_start_time = time.time()
while True:
    current_time = time.time() - sa_start_time
    if current_time >= TIME_LIMIT:
        break    
    sa_best_dist, sa_best_path = sa_step(sa_path, sa_temp, nodes, sa_best_dist, sa_best_path)
    sa_temp *= SA_TEMP_ALPHA
    
    sa_history.append((current_time, path_dist(sa_path, nodes)))

print("Trwa uruchamianie TS...")
ts_start_time = time.time()
while True:
    current_time = time.time() - ts_start_time
    if current_time >= TIME_LIMIT:
        break
        
    move, ts_best_dist, ts_best_path = ts_find_best_move(ts_path, nodes, ts_tabu, ts_best_dist, ts_best_path)
    ts_add_move_tabu(ts_path, move, ts_tabu, TS_TABU_SIZE)
    path_move(ts_path, move)
    
    ts_history.append((current_time, path_dist(ts_path, nodes)))

sa_path = sa_best_path
ts_path = ts_best_path

with open("sciezki.txt", "w") as f:
    f.write(f"SA_BEST_DIST: {sa_best_dist}\n")
    f.write(f"SA_BEST_PATH: {sa_best_path}\n\n")
    f.write(f"TS_BEST_DIST: {ts_best_dist}\n")
    f.write(f"TS_BEST_PATH: {ts_best_path}\n")

fig_maps, axs_maps = plt.subplots(1, 2, figsize=(12, 5))
fig_maps.patch.set_facecolor('white')

def draw_route(ax, path, nodes, title):
    x = [nodes[i][0] for i in path] + [nodes[path[0]][0]]
    y = [nodes[i][1] for i in path] + [nodes[path[0]][1]]
    ax.plot(x, y, color='red', linewidth=2, zorder=1)
    ax.scatter([n[0] for n in nodes], [n[1] for n in nodes], color='black', s=40, zorder=2)
    ax.set_title(title, color='black')
    ax.set_facecolor('white')
    ax.grid(True, color='lightgray')

draw_route(axs_maps[0], sa_path, nodes, f"SA: ścieżka ({sa_best_dist})")
draw_route(axs_maps[1], ts_path, nodes, f"TS: ścieżka ({ts_best_dist})")
plt.tight_layout()
plt.savefig("mapy_miast.png")
plt.close(fig_maps)

fig_graphs, axs_graphs = plt.subplots(1, 2, figsize=(12, 5))
fig_graphs.patch.set_facecolor('white')

sa_times = [h[0] for h in sa_history]
sa_dists = [h[1] for h in sa_history]
ts_times = [h[0] for h in ts_history]
ts_dists = [h[1] for h in ts_history]

axs_graphs[0].plot(sa_times, sa_dists, color='red')
axs_graphs[0].set_title("SA: długość funkcji czasu", color='black')
axs_graphs[0].set_xlabel("Czas [s]")
axs_graphs[0].set_ylabel("Dystans")
axs_graphs[0].set_facecolor('white')
axs_graphs[0].grid(True, color='lightgray')

axs_graphs[1].plot(ts_times, ts_dists, color='red')
axs_graphs[1].set_title("TS: długość w funkcji czasu", color='black')
axs_graphs[1].set_xlabel("Czas [s]")
axs_graphs[1].set_ylabel("Dystans")
axs_graphs[1].set_facecolor('white')
axs_graphs[1].grid(True, color='lightgray')

plt.tight_layout()
plt.savefig("wykresy_wynikow.png")

print("=" * 40)
print(f"Ostateczny wynik SA (Wyżarzanie): {sa_best_dist}")
print(f"Ostateczny wynik TS (Tabu Search): {ts_best_dist}")
print("=" * 40)

plt.show()