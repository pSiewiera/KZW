#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ifstream file("witi.data.txt");
    string text;

    if (!file.is_open()) {
        cout << "Nie udalo sie otworzyc pliku!" << endl;
        return 1;
    }

    while (file >> text) {
        if (text.find("data.") == 0) { 
            int n;
            file >> n; 
            
            vector<int> p(n), w(n), d(n);
            int total_time = 0;
            for (int i = 0; i < n; ++i) {
                file >> p[i] >> w[i] >> d[i];
                total_time += p[i]; // Sumujemy calkowity czas trwania wszystkich zadan
            }

            vector<int> potega(n);
            int p2 = 1;
            for (int i = 0; i < n; i++) {
                potega[i] = p2;
                p2 = p2 * 2;
            }
            int ROZMIAR = p2;

            // F[mask] oznacza koszt zadan umieszczonych na KONCU harmonogramu
            vector<int> F(ROZMIAR, 999999999);
            vector<int> poprzednik(ROZMIAR, -1);
            
            F[0] = 0;

            for (int mask = 0; mask < ROZMIAR; mask++) {
                if (F[mask] == 999999999) continue;

                // Obliczamy sume czasow zadan, ktore juz sa na koncu
                int czas_maski = 0;
                for (int j = 0; j < n; j++) {
                    if ((mask & potega[j]) != 0) {
                        czas_maski += p[j];
                    }
                }
                
                // Zadanie 'i' skonczy sie dokladnie w momencie t_not_in_mask
                int t_not_in_mask = total_time - czas_maski;

                for (int i = 0; i < n; i++) {
                    if ((mask & potega[i]) == 0) {
                        int nowa_maska = mask + potega[i]; 
                        int czas_po_wykonaniu = t_not_in_mask;
                        int spoznienie = czas_po_wykonaniu - d[i];
                        
                        if (spoznienie < 0) {
                            spoznienie = 0;
                        }
                        
                        int kara = w[i] * spoznienie;
                        
                        // Warunek <= w polaczeniu z backward DP daje idealny tie-breaking
                        if (F[mask] + kara <= F[nowa_maska]) {
                            F[nowa_maska] = F[mask] + kara;
                            poprzednik[nowa_maska] = i;
                        }
                    }
                }
            }

            cout << "Instancja: " << text << endl;
            cout << "Minimalna kara: " << F[ROZMIAR - 1] << endl;
            
            cout << "Kolejnosc zadan: ";
            vector<int> kolejnosc;
            int curr_mask = ROZMIAR - 1;
            while (curr_mask > 0) {
                int zadanie = poprzednik[curr_mask];
                kolejnosc.push_back(zadanie + 1);
                curr_mask -= potega[zadanie];
            }
            
            // UWAGA: Tutaj NIE odwracamy wektora (brak reverse).
            // Przechodzenie od pelnej maski w dol w tym podejsciu generuje zadania
            // od pierwszego do ostatniego.
            for (int i = 0; i < kolejnosc.size(); i++) {
                cout << kolejnosc[i] << " ";
            }
            cout << "\n" << "------------------------" << endl;
        }
    }
    
    file.close();
    return 0;
}