#include <iostream>
#include <fstream>
#include <string>
#include <vector>

using namespace std;

int main() {
    ifstream file("witi.data.txt");
    string text;

    while (file >> text) {
        if (text.find("data.") == 0) { 
            int n;
            file >> n; 
            
            vector<int> p(n), w(n), d(n);
            for (int i = 0; i < n; ++i) {
                file >> p[i] >> w[i] >> d[i];
            }

            vector<int> potega(n);
            int p2 = 1;
            for (int i = 0; i < n; i++) {
                potega[i] = p2;
                p2 = p2 * 2;
            }
            int ROZMIAR = p2;

            vector<int> F(ROZMIAR, 999999999);
            vector<int> poprzednik(ROZMIAR, -1);
            
            F[0] = 0;

            for (int mask = 0; mask < ROZMIAR; mask++) {
                
                int czas = 0;
                for (int j = 0; j < n; j++) {
                    if ((mask & potega[j]) != 0) {
                        czas = czas + p[j];
                    }
                }

                for (int i = 0; i < n; i++) {
                    
                    if ((mask & potega[i]) == 0) {
                        
                        int nowa_maska = mask + potega[i]; 
                        
                        int czas_po_wykonaniu = czas + p[i];
                        int spoznienie = czas_po_wykonaniu - d[i];
                        
                        if (spoznienie < 0) {
                            spoznienie = 0;
                        }
                        
                        int kara = w[i] * spoznienie;
                        
                        if (F[mask] + kara < F[nowa_maska]) {
                            F[nowa_maska] = F[mask] + kara;
                            poprzednik[nowa_maska] = i;
                        }
                    }
                }
            }




            

        }
    }
    
    file.close();
    return 0;
}