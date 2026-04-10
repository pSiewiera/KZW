#include <iostream>
#include <fstream>
#include <string>
#include <chrono> 
#include <iomanip> 

using namespace std;

int countCmax(int n, int R[], int P[], int Q[], int order[]) {
    int t = 0;
    int Cmax = 0;

    for (int i = 0; i < n; i++) {
        int j = order[i];
        if (t < R[j]) t = R[j];
        t += P[j];
        Cmax = max(Cmax, t + Q[j]);
    }

    return Cmax;
}

int main() {
    int n;
    int R[100], P[100], Q[100];
    bool done[100];
    int order[100];

    for (int j = 1; j <= 4; j++) {
        string name = "data" + to_string(j) + ".txt";
        ifstream file(name);

        if (!file.is_open()) {
            cout << "Nie udalo sie otworzyc pliku: " << name << endl;
            continue;
        }

        file >> n;
        for (int i = 0; i < n; i++) {
            file >> R[i] >> P[i] >> Q[i];
            done[i] = false;
        }
        file.close();

        auto start = chrono::high_resolution_clock::now();

        int t = 0;
        for (int k = 0; k < n; k++) {
            int best = -1;
            for (int i = 0; i < n; i++) {
                if (!done[i] && R[i] <= t) {
                    if (best == -1 || Q[i] > Q[best])
                        best = i;
                }
            }

            if (best == -1) {
                int minR = 1000000;
                for (int i = 0; i < n; i++) {
                    if (!done[i] && R[i] < minR) {
                        minR = R[i];
                        best = i;
                    }
                }
                t = minR;
            }

            order[k] = best;
            t += P[best];
            done[best] = true;
        }

        int bestCmax = countCmax(n, R, P, Q, order);

        for (int i = 0; i < n - 1; i++) {
            for (int k = i + 1; k < n; k++) {
                swap(order[i], order[k]);
                int newCmax = countCmax(n, R, P, Q, order);
                if (newCmax < bestCmax) {
                    bestCmax = newCmax;
                } else {
                    swap(order[i], order[k]);
                }
            }
        }

        auto end = chrono::high_resolution_clock::now();
        
        chrono::duration<double> elapsed = end - start;

        cout << fixed << setprecision(6); 
        cout <<" Cmax = " << bestCmax 
             << " Czas: " << elapsed.count() << " s" << endl;

        ofstream out("wynik" + to_string(j) + ".txt");
        out << bestCmax << endl;
        out.close();
    }

    return 0;
}