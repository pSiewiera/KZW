#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ifstream file("neh.data.txt");
    string text;
    int n, m;

    while (file >> text) {
        if (text.find("data.") == 0) {
            file >> n >> m;

            vector<vector<int>> p(n, vector<int>(m));
            for (int i = 0; i < n; ++i) {
                for (int j = 0; j < m; ++j) {
                    file >> p[i][j];
                }
            }

            vector<int> suma(n);
            for (int i = 0; i < n; ++i) {
                int sum = 0;
                for (int j = 0; j < m; ++j) {
                    sum += p[i][j];
                }
                suma[i] = sum;
            }

            vector<int> kolejnosc(n);
            for (int i = 0; i < n; ++i) {
                kolejnosc[i] = i;
            }

            for (int i = 0; i < n - 1; ++i) {
                for (int j = 0; j < n - i - 1; ++j) {
                    if (suma[j] < suma[j + 1]) {
                        swap(suma[j], suma[j + 1]);
                        swap(kolejnosc[j], kolejnosc[j + 1]);
                    }
                }
            }

            vector<vector<int>> C(n, vector<int>(m));
            for (int i = 0; i < n; ++i) {
                C[i][0] = p[kolejnosc[i]][0];
                for (int j = 1; j < m; ++j) {
                    C[i][j] = C[i][j - 1] + p[kolejnosc[i]][j];
                }
            }

            int Cmax = 0;
            for (int i = 0; i < n; ++i) {
                if (C[i][m - 1] > Cmax) {
                    Cmax = C[i][m - 1];
                }
            }

            cout << "Cmax: " << Cmax << endl;
        }
    }
    return 0;
}