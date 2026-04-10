/**
 * PROJEKT: problem 1||sum WiTi (witi)
 * Moduł: engine.js (MODEL)
 * Autor: M. Makuchowski
 * Data: 29.03.2026
 * * ROLA: Serce obliczeniowe systemu. Odpowiada wyłącznie za matematyczną
 * stronę problemu: wyznaczanie momentów zakończenia zadań (Ci),
 * obliczanie spóźnień (Ti) oraz sumarycznej kary (wi * Ti).
 */

/*
 * ARCHITEKTURA DANYCH:
 * 1. Data: { tasks: [{p,w,d}...] }  nie ma id !!!
 * 2. SolutionRaw: { order: [id1, id2, ...] }
 * 3. SolutionFull: { timeTable: [...], cMax, sumWiTi, raw }
 */

class Engine {
  constructor() {
    this.data =     { tasks: [] };
    this.solution = { order: [] };
  }
  setData(data) {
    this.data = { tasks: data.tasks };
    this.solution = { order: this.validateOrder(this.solution.order) };
  }
  setSolution(solution) {
    this.solution = { order: this.validateOrder(solution.order) };
  }
  validateOrder(rawOrder) {
    if (!this.data || !this.data.tasks || !Array.isArray(rawOrder)) return [];
    // 1. Legalne ID to indeksy tablicy tasks: [0, 1, 2, ..., n-1]
    const validIds = new Set(this.data.tasks.map((_, index) => index));
    const seen = new Set();
    const cleanOrder = [];
    for (let id of rawOrder) {
      if (validIds.has(id) && !seen.has(id)) {
        seen.add(id);
        cleanOrder.push(id);
      }
    }
    return cleanOrder;
  }
  makeSolutionFull(){
    if (!this.data || !this.data.tasks) return null;
    let currentTime = 0;
    let totalSumWiTi = 0;
   // Wyciągamy order z kontenera SolutionRaw
    const timeTable = this.solution.order.map(taskId => {
      const task = this.data.tasks[taskId];
      if (!task) return null;
      const start = currentTime;
      const end = start + task.p;
      const tardiness = Math.max(0, end - task.d);
      totalSumWiTi += (task.w * tardiness);
      currentTime = end;
      return { id: taskId, S: start, C: end, T: tardiness };
    }).filter(op => op !== null);
    // Zwracamy pełne rozpakowane rozwiązanie
    return {
      timeTable: timeTable,
      cMax: currentTime,
      sumWiTi: totalSumWiTi,
      raw: this.solution
    };
  }
}
