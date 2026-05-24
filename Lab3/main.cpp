#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

struct Job {
    int id;
    int total_time;
};

bool compareJobs(const Job& a, const Job& b) {
    if (a.total_time == b.total_time) return a.id < b.id;
    return a.total_time > b.total_time;
}

int main() {
    ifstream file("neh.data.txt");
    if (!file.is_open()) {
        cerr << "Blad: Nie mozna otworzyc pliku neh.data.txt!" << endl;
        return 1;
    }
    string text;
    int n, m;

    while (file >> text) {
        if (text.find("data.") == 0) {
            file >> n >> m;

            vector<vector<int>> p(n, vector<int>(m));
            vector<Job> jobs(n);

            for (int i = 0; i < n; ++i) {
                jobs[i].id = i;
                jobs[i].total_time = 0;
                for (int j = 0; j < m; ++j) {
                    file >> p[i][j];
                    jobs[i].total_time += p[i][j];
                }
            }

            sort(jobs.begin(), jobs.end(), compareJobs);

            vector<int> seq; 

            for (int k = 0; k < n; ++k) {
                int curr_job = jobs[k].id;

                if (seq.empty()) {
                    seq.push_back(curr_job);
                    continue;
                }

                int current_k = seq.size();

                vector<vector<int>> e(current_k + 2, vector<int>(m, 0));
                for (int i = 1; i <= current_k; ++i) {
                    int j_id = seq[i - 1];
                    for (int j = 0; j < m; ++j) {
                        int top = e[i - 1][j];
                        int left = (j > 0) ? e[i][j - 1] : 0;
                        e[i][j] = max(top, left) + p[j_id][j];
                    }
                }

                vector<vector<int>> q(current_k + 2, vector<int>(m, 0));
                for (int i = current_k; i >= 1; --i) {
                    int j_id = seq[i - 1];
                    for (int j = m - 1; j >= 0; --j) {
                        int bottom = q[i + 1][j];
                        int right = (j < m - 1) ? q[i][j + 1] : 0;
                        q[i][j] = max(bottom, right) + p[j_id][j];
                    }
                }

                int best_pos = -1;
                int min_cmax = INT_MAX;
                vector<int> f(m, 0); 

                for (int pos = 0; pos <= current_k; ++pos) {
                    for (int j = 0; j < m; ++j) {
                        int top = e[pos][j];
                        int left = (j > 0) ? f[j - 1] : 0;
                        f[j] = max(top, left) + p[curr_job][j];
                    }

                    int local_cmax = 0;
                    for (int j = 0; j < m; ++j) {
                        int potential = f[j] + q[pos + 1][j];
                        if (potential > local_cmax) {
                            local_cmax = potential;
                        }
                    }

                    if (local_cmax < min_cmax) {
                        min_cmax = local_cmax;
                        best_pos = pos;
                    }
                }

                seq.insert(seq.begin() + best_pos, curr_job);
            }

            vector<int> end_time(m, 0);
            for (int i = 0; i < n; ++i) {
                int j_id = seq[i];
                for (int j = 0; j < m; ++j) {
                    int left = (j > 0) ? end_time[j - 1] : 0;
                    end_time[j] = max(end_time[j], left) + p[j_id][j];
                }
            }

            cout << "Cmax: " << end_time[m - 1] << endl;
        }
    }
    return 0;
}