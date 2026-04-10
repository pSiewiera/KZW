/**
 * PROJEKT: problem 1||sum WiTi (witi)
 * Moduł: view.js (WIDOK)
 * Autor: M. Makuchowski
 * Data: 29.03.2026
 * * ROLA: Kompleksowa warstwa prezentacji i interakcji.
 * Odpowiada za generowanie zawartości wszystkich sekcji (Boxów):
 * 1. DANE: Interaktywny edytor instancji zadań.
 * 2. ROZWIĄZANIE: Obsługa tekstowej reprezentacji kolejności.
 * 3. WIZUALIZACJA: Renderowanie wykresu Gantta na Canvas wraz z
 * implementacją mechanizmu Drag & Drop do zmiany kolejności zadań.
 * 4. OBLICZENIA I OCENA: Dynamiczne generowanie tabeli notatek oraz wyników.
 */

 const viewConverter = {
   // 1. Zamienia literę lub liczbę na ID
   labelToId(input) {
     let s = input.trim().toUpperCase();
     if (!s) return NaN;
     // Jeśli to litera (A-Z)
     if (/[A-Z]/.test(s)) return s.charCodeAt(0) - 65;
     // Jeśli to cyfra (fallback dla wygody)
     let n = parseInt(s);
     return isNaN(n) ? NaN : (n - 1);
   },
   // 2. Zamienia ID (0, 1, 2...) zawsze na literę (A, B, C...)
   idToLabel(id) {
     if (id === null || id === undefined || isNaN(id)) return "?";
     return String.fromCharCode(65 + id);
   },
   // 3. Tłumaczy tekst z pola SOLUTION na tablicę ID
   textToOrder(text) {
     if (!text) return [];
     let elements = text.split(/[ ,;]+/);
     let result = [];
     for (let el of elements) {
       let id = this.labelToId(el);
       if (!isNaN(id)) result.push(id);
     }
     return result;
   },
   // 4. Tłumaczy tablicę ID na tekst (zawsze wielkie litery)
   orderToText(orderArray) {
     if (!orderArray) return "";
     let labels = [];
     for (let id of orderArray) {
       labels.push(this.idToLabel(id));
     }
     return labels.join(", ");
   },
   // 5. Tłumaczy tekst z pola DATA na dane dla engine
   textToData(text) {
     if (!text) return null;
     let numbers = text.match(/\d+/g);
     if (!numbers || numbers.length < 4) return null;
     let numTasks = parseInt(numbers[0]);
     let newTasks = [];
     let ptr = 1;
     for (let i = 0; i < numTasks; i++) {
       if (ptr + 2 < numbers.length) {
         let p = parseInt(numbers[ptr++]); // Pierwsza liczba po n to r
         let w = parseInt(numbers[ptr++]); // Druga to p
         let d = parseInt(numbers[ptr++]); // Trzecia to q
         newTasks.push({ p, w, d });
       }
     }
     return { tasks: newTasks };
   },
   // 6. Tłumaczy dane z engine na tekst
   dataToText(data) {
       if (!data || !data.tasks) return "";
       // Pierwsza linia to liczba zadań
       let output = [data.tasks.length];
       let id=0;
       for (let t of data.tasks) {
         // Każdy parametr (r, p, q) zamieniamy na string i dopełniamy do 4 znaków
         const p = String(t.p).padStart(3, ' ');
         const w = String(t.w).padStart(3, ' ');
         const d = String(t.d).padStart(3, ' ');
         output.push(`${p} ${w} ${d}`);
       }
       return output.join('\n');
     }
 };

 class ViewData {
   constructor(container, callback) {
     this.container = container;
     this.callback = callback;
     this.blurActive = true;
     this.textarea = null;
     this.gutter = null;
     this.init();
   }

   init() {
     // Struktura z jednym kontenerem-ramką (editor-container)
     this.container.innerHTML = `
       <div id="boxDataEditorContainer">
         <textarea id="boxDataGutter" readonly tabindex="-1"></textarea>
         <textarea id="boxDataEdit" spellcheck="false" placeholder="n\nr p q..."></textarea>
       </div>
       <button id="boxDataBtnUpdate" tabindex="-1">Zatwierdź dane</button>
       <div class="appBoxInfo">Format: n, potem linie: p w d</div>
     `;

     this.textarea = this.container.querySelector('#boxDataEdit');
     this.gutter = this.container.querySelector('#boxDataGutter');
     const btn = this.container.querySelector('#boxDataBtnUpdate');

     // Synchronizacja guttera przy wpisywaniu
     this.textarea.addEventListener('input', () => this.syncGutter());

     // Obsługa scrollowania (żeby oba okna przewijały się razem)
     this.textarea.addEventListener('scroll', () => {
         this.gutter.scrollTop = this.textarea.scrollTop;
     });

     this.textarea.onfocus = () => { this.blurActive = true; };
     this.textarea.onblur = () => {
       if (this.blurActive) this.sendToMain();
     };

     this.textarea.onkeydown = (e) => {
       if (e.key === 'Escape') {
         this.blurActive = false;
         this.textarea.blur();
         this.callback(null);
       }
     };

     btn.addEventListener('click', () => this.sendToMain());

     // Inicjalizacja pustego guttera
     this.syncGutter();
   }

   // Logika generowania etykiet n, A:, B:...
   syncGutter() {
     const lines = this.textarea.value.split('\n');
     const labels = ["n","A", "B", "C", "D", "E", "F", "G", "H"];

     // Tworzymy tekst guttera na podstawie liczby linii w danych
     let gutterText = "";
     for (let i = 0; i < lines.length; i++) {
         if (i < labels.length) {
             gutterText += labels[i] + "\n";
         }
     }
     this.gutter.value = gutterText;
   }

   sendToMain() {
     const data = viewConverter.textToData(this.textarea.value);
     if (data) this.callback(data);
   }

   update(data) {
     this.textarea.value = viewConverter.dataToText(data);
     this.syncGutter(); // Aktualizacja etykiet po załadowaniu danych
   }
 }

 class ViewSolution {
   constructor(container, callback) {
     this.container = container;
     this.callback = callback;
     this.blurActive = true;
     this.init();
   }
   init() {
     this.container.innerHTML = `
       <input type="text" id="boxSolutionEdit" placeholder="A, B, C lub 1, 2, 3" />
       <div class="appBoxInfo">litery lub numery od 1</div>`;
     this.input = this.container.querySelector('#boxSolutionEdit');
     // FOCUS: przygotowanie do edycji
     this.input.onfocus = () => { this.blurActive = true; };
     // BLUR: automatyczny zapis przy kliknięciu obok
     this.input.onblur = () => {
           if (this.blurActive) this.sendToMain();
         };
     // KEYDOWN: obsługa klawiszy
     this.input.onkeydown = (e) => {
           if (e.key === 'Enter'){
             e.preventDefault();
             this.sendToMain();
           }
           if (e.key === 'Escape'){
             this.blurActive=false;
             this.input.blur();
             this.callback(null);
           }
         };
   }
   sendToMain() {
     const order = viewConverter.textToOrder(this.input.value);
     this.callback({ order: order });
   }
   update(solutionFull) {
     if (!solutionFull || !solutionFull.raw) return;
     this.input.value = viewConverter.orderToText(solutionFull.raw.order);
   }
 }

 class ViewResult {
     constructor(container) {
         this.container = container;
         this.init();
     }
     init() {
         this.container.innerHTML = `
             <div id="boxResultTxt">0</div>
             <div class="appBoxInfo">&sum;w<sub>i</sub>T<sub>i</sub></div>
         `;
         this.refValue = this.container.querySelector('#boxResultTxt');
     }
     update(solutionFull) {
         if (!solutionFull) return;
         this.refValue.textContent = solutionFull.sumWiTi;
     }
 }

class ViewDraft {
  constructor(container, onOrderChanged) {
      this.container = container;
      this.onOrderChanged = onOrderChanged;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'drafCanvas';
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = 886;
      this.canvas.height = 276;
      this.container.appendChild(this.canvas);
      // Stan lokalny widoku
      this.instance = null;      // Dane z Data {tasks: []}
      this.full = null;          // Dane z SolutionFull
      this.maxHorizon = 0;       // Stała skala X
      // Interakcja
      this.draggedId = null;     // ID przeciąganego zadania
      this.mouseX = 0;
      this.mouseY = 0;
      //
      this.buffer= {x0:80,y0:40,step:60, r:24};
      this.gantt = {x0:50,y0:240,xLen:780,yLen:120,h:50};
      this.initEvents();
  }
  /* IN/OUT */
  setData(data) {
      this.instance = data;
      this.maxHorizon = data.tasks.reduce((sum, t) => sum + t.p, 0) * 1.0;
  }
  update(solutionFull) {
      this.full = solutionFull;
      this.render();
  }
  getSolutionRaw() {
      // Jeśli nie ma jeszcze rozwiązania, zwracamy pustą kolejność
      if (!this.full) return { order: [] };
      return this.full.raw;
  }
  /* ZDARZENIA */
  initEvents() {
    this.canvas.addEventListener('mousedown', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width/rect.width;
      const scaleY = this.canvas.height/rect.height;
      this.mouseX = (e.clientX - rect.left)*scaleX;
      this.mouseY = (e.clientY - rect.top)*scaleY;
      this.handleDown();
    });
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width/rect.width;
      const scaleY = this.canvas.height/rect.height;
      this.mouseX = (e.clientX - rect.left)*scaleX;
      this.mouseY = (e.clientY - rect.top)*scaleY;
      if (this.draggedId !== null) this.render();
    });
    window.addEventListener('mouseup', () => {
      if (this.draggedId !== null) this.handleUp();
    });
  }
  handleDown() {
    if (!this.instance) return;
    const currentOrder = this.full ? this.full.raw.order : [];
    // 1. Sprawdź BUFOR (Poczekalnię)
    const { x0: bx0, y0: by0, step: bStep } = this.buffer;
    this.instance.tasks.forEach((t, i) => {
      const x = bx0 + i * bStep;
      // Jeśli zadania nie ma w order i kliknięto w kółko (promień 25)
      if (!currentOrder.includes(i)) {
        if (Math.hypot(this.mouseX - x, this.mouseY - by0) < 25) {
          this.draggedId = i; // Zapamiętujemy INDEKS
        }
      }
    });
    // 2. Sprawdź GANTTA (Jeśli nic nie złapano w buforze)
    if (this.draggedId === null && this.full) {
      const { x0, y0, xLen, yLen } = this.gantt;
      const scale = xLen / this.maxHorizon;
      this.full.timeTable.forEach(task => {
        // task.mS i task.mC to czasy startu i końca na maszynie (Etap 1)
        const x = x0 + task.S * scale;
        const w = (task.C - task.S) * scale;
        // Sprawdzamy czy mysz jest wewnątrz klocka (wysokość yLen, np. 50px)
        if (this.mouseX >= x && this.mouseX <= x + w &&
            this.mouseY >= y0 - yLen && this.mouseY <= y0) {
          this.draggedId = task.id;
          // AKTYWNE WYCIĄGNIĘCIE:
          // Informujemy Main, że zadania już nie ma w grafiku
          const newOrder = currentOrder.filter(id => id !== task.id);
          this.onOrderChanged({ order: newOrder });
        }
      });
    }
    this.render();
  }
  handleUp() {
    if (this.draggedId === null) return;
    const { x0, y0, xLen, yLen } = this.gantt;
    const scale = xLen / this.maxHorizon;
    // 1. Czy upuszczono w obszarze wykresu? (y0 to dół, y0-yLen to góra)
    // Rozszerzamy nieco margines dla wygody (np. o 50px w górę i dół)
    const isDroppedOnGantt = this.mouseY > (y0 - yLen) && this.mouseY < y0;
    // 2. Pobieramy aktualną kolejność (indeksy) i usuwamy z niej przenoszone zadanie
    let currentOrder = this.full ? [...this.full.raw.order] : [];
    currentOrder = currentOrder.filter(index => index !== this.draggedId);
    if (isDroppedOnGantt) {
      // Przeliczamy pozycję myszki X na "moment w czasie" na osi
      const dropTime = (this.mouseX - x0) / scale;
      let insertIdx = 0;
      // Szukamy miejsca wstawienia w aktualnym szeregu
      for (let i = 0; i < currentOrder.length; i++) {
        const taskIndex = currentOrder[i];
        // Znajdujemy dane tego zadania w timeTable, żeby znać jego położenie
        const taskData = this.full.timeTable.find(t => t.id === taskIndex);
        if (taskData) {
          // Obliczamy środek klocka na maszynie (S + C) / 2
          const taskCenter = (taskData.S + taskData.C) / 2;
          // Jeśli upuściliśmy przed środkiem zadania, to wskakujemy w to miejsce (i)
          if (dropTime < taskCenter) break;
          if (dropTime < taskCenter) {insertIdx=i;break;}
        }
        insertIdx = i + 1;
      }
      // Wstawiamy indeks przeciąganego zadania w wyliczone miejsce
      currentOrder.splice(insertIdx, 0, this.draggedId);
    }
    // Jeśli upuszczono poza (isDroppedOnGantt = false), zadanie po prostu
    // nie zostanie dodane do currentOrder, czyli "wróci" do bufora.
    const finalOrder = currentOrder;
    this.draggedId = null;
    // Wywołujemy callback do silnika (Etap 1), który przeliczy maxHorizon i timeTable
    if (this.onOrderChanged) {
      this.onOrderChanged({ order: finalOrder });
    }
    this.render();
  }
  /* RYSOWANIE */
  render() {
    if (!this.instance) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBuffer();
    this.drawAxes();
    this.drawDLines();
    this.drawGantt();
    this.drawSprite();
  }
  drawBuffer() {
      // W Etapie 1 ustaliliśmy, że order zawiera INDEKSY zadań z tablicy tasks
      const currentOrder = this.full ? this.full.raw.order : [];
      const { x0, y0, step, r } = this.buffer;
      this.instance.tasks.forEach((t, i) => {
        const x = x0 + i * step;
        // Sprawdzamy, czy INDEKS 'i' jest już w użyciu lub czy jest przeciągany
        const isInUse = currentOrder.includes(i);
        const isDragged = (i === this.draggedId);
        if (isInUse || isDragged) {
          // Rysujemy "pusty slot" (miejsce, z którego zabrano zadanie i)
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.setLineDash([5, 5]);
          this.ctx.arc(x, y0, r, 0, Math.PI * 2);
          this.ctx.strokeStyle = "#888";
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          this.ctx.restore();
        } else {
          this.drawTaskCircle(this.ctx, x, y0, i);
        }
      });
    }
  drawAxes() {
    const labelMax = 15;
    const lineMax = 100;
    const labelColor = "#444";
    const lineColor = "#888";
    // 1. POBIERAMY PARAMETRY Z KONSTRUKTORA (this.gantt)
    const { x0, y0, xLen, yLen } = this.gantt;
    const xMax = x0 + xLen;
    const yMax = y0 - yLen;
    // 2. LICZYMY SKALĘ W ŚRODKU
    const scale = xLen / this.maxHorizon;
    // 3. LOGIKA WYBORU KROKU (Twoja nienaruszona logika)
    const getBestStep = (maxHorizon, limit) => {
      const bases = [1, 2, 5];
      let magnitude = Math.pow(10, Math.floor(Math.log10(maxHorizon / limit)));
      for (let m = magnitude; m < magnitude * 100; m *= 10) {
        for (let b of bases) {
          let candidateStep = b * m;
          if (maxHorizon / candidateStep <= limit) return candidateStep;
        }
      }
      return 1;
    };
    const labelStep = getBestStep(this.maxHorizon, labelMax);
    const lineStep  = getBestStep(this.maxHorizon, lineMax);
    this.ctx.save();
    // 4. RYSOWANIE GĘSTEJ SIATKI (używamy x0 i scale)
    this.ctx.beginPath();
    this.ctx.strokeStyle = lineColor;
    this.ctx.lineWidth = 0.5;
    for (let t = 0; t <= this.maxHorizon; t += lineStep) {
      if (t === 0 || Math.abs(t % labelStep) < 0.0001) continue;
      const x = x0 + t * scale; // t to czas, scale to piksele
      if (x > xMax) break;
      this.ctx.moveTo(x, y0 + 5);
      this.ctx.lineTo(x, yMax);
    }
    this.ctx.stroke();
    // 5. RYSOWANIE ETYKIET
    this.ctx.beginPath();
    this.ctx.strokeStyle = labelColor;
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    for (let t = 0; t <= this.maxHorizon; t += labelStep) {
      const x = x0 + t * scale;
      if (x > xMax) break;
      if (t > 0) {
        this.ctx.moveTo(x, y0 + 10);
        this.ctx.lineTo(x, yMax - 5);
      }
      this.ctx.fillText(Math.round(t), x, y0 + 20);
    }
    this.ctx.stroke();
    // --- 6. OSIE GŁÓWNE (X i Y) ---
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    // Oś X (pozioma)
    this.ctx.moveTo(x0 - 20, y0);
    this.ctx.lineTo(xMax + 20, y0);
    // Oś Y (pionowa)
    this.ctx.moveTo(x0, y0 + 10);
    this.ctx.lineTo(x0, yMax - 30);
    this.ctx.stroke();
    // --- 7. STRZAŁKI I OZNACZENIA ---
    this.ctx.fillStyle = "#000";
    this.ctx.font = "italic 14px Arial";
    // Strzałka i etykieta "t"
    this.drawArrow(this.ctx, xMax + 20, y0, 0);
    this.ctx.fillText("t", xMax + 15, y0 + 25);
    // Strzałka i etykieta "M"
    this.drawArrow(this.ctx, x0, yMax - 40, -Math.PI / 2);
    this.ctx.fillText("M", x0 - 20, yMax - 10);
    this.ctx.restore();
  }
  drawGantt() {
    if (!this.full) return;
    const { x0, y0, xLen, yLen, h } = this.gantt;
    const scale = xLen / this.maxHorizon;
    const fixedY = y0 -yLen/2- (h / 2);
    //ZADANIA
    this.full.timeTable.forEach((task, i) => {
      if (task.id === this.draggedId) return;
      const original = this.instance.tasks[task.id];
      const x = x0 + task.S * scale; // Start klocka
      const w = (task.C - task.S) * scale; // Szerokość klocka (p)
      this.drawTaskRect(this.ctx, x,fixedY, w, h, task.id, task.T>0);
    });
  }
  drawDLines() {
      if (!this.instance || !this.instance.tasks) return;

      const { x0, y0, xLen, yLen } = this.gantt; // Pobieram Twoje parametry
      const scale = xLen / this.maxHorizon;      // Twoja skala
      const ctx = this.ctx;

      ctx.save();

      // 1. Grupowanie zadań po ich terminie d (dokładnie z Twojej instancji)
      const deadlineGroups = {};
      this.instance.tasks.forEach((task, index) => {
          const d = task.d;
          const label = viewConverter.idToLabel(index);
          if (!deadlineGroups[d]) {
              deadlineGroups[d] = "";
          }
          deadlineGroups[d] += label;
      });

      // 2. Styl linii d
      ctx.beginPath();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.textAlign = "left";

      // 3. Rysowanie linii i etykiet
      for (let dVal in deadlineGroups) {
          const t = parseInt(dVal);
          const idsLabel = deadlineGroups[dVal];
          const x = x0 + t * scale; // Dokładnie Twoje obliczenie pozycji X

          // Pionowa linia pomocnicza: od osi X (y0) w górę przez cały wykres (yLen)
          ctx.moveTo(x, y0 + 5);
          ctx.lineTo(x, y0 - yLen-5);

          // --- Logika etykiety d_ID ---
          ctx.font = "14px Arial";
          const dWidth = ctx.measureText("d").width;

          ctx.font = "10px Arial";
          const idsWidth = ctx.measureText(idsLabel).width;

          const totalWidth = dWidth + 2 + idsWidth;
          const xStart = x - totalWidth / 2;

          ctx.fillStyle = "#000";

          // Rysujemy "d" oraz indeks nad wykresem (nad yLen)
          ctx.font = "14px Arial";
          ctx.fillText("d", xStart, y0 - yLen -10);

          ctx.font = "12px Arial";
          ctx.fillText(idsLabel, xStart + dWidth + 2, y0 - yLen - 5 );
      }

      ctx.stroke();
      ctx.restore();
  }
  drawSprite() {
    if (this.draggedId === null) return;
    const { x0, y0, xLen, yLen, h } = this.gantt;
    const scale = xLen / this.maxHorizon;
    const t = this.instance.tasks[this.draggedId];
    if (!t) return;
    this.ctx.globalAlpha = 0.6;
    // Sprawdzamy, czy myszka jest w obszarze wykresu (żeby rysować kloc, a nie kółko)
    // Jeśli chcesz, żeby zawsze był kloc, usuń ten warunek IF
    if (this.mouseY > y0 - yLen) {
      const w = t.p * scale;
      this.drawTaskRect(
        this.ctx, this.mouseX - w/2, this.mouseY - h/2,  //ctx,  x,y
        t.p * scale,h,                                   // w,h
        this.draggedId,false,true                        //id, forceGrey
      );
    }else this.drawTaskCircle(this.ctx, this.mouseX, this.mouseY, this.draggedId);
    this.ctx.globalAlpha = 1.0;
  }
  drawTaskCircle(ctx, x, y, id) {
    ctx.beginPath();
    ctx.arc(x, y, this.buffer.r, 0, Math.PI * 2);
    // Wypełnienie: szary dla bufora i ducha
    ctx.fillStyle = "#ccc";
    ctx.fill();
    // Obramowanie: ZAWSZE czarne i wyraźne
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Tekst
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = "20px Arial"; // Opcjonalnie, by upewnić się co do czytelności
    ctx.fillText(viewConverter.idToLabel(id), x, y + 8);
  }
  drawTaskRect(ctx, x, y, w, h, id, isLate = false, forceGrey = false) {
    // Logika wyboru koloru: priorytet ma forceGrey (dla ducha)
    if (forceGrey) {
            ctx.fillStyle = "rgba(200, 200, 200, 0.8)"; // Szary prześwitujący (#ccc)
        } else {
            // Czerwony prześwitujący (#ff4d4d) lub Zielony prześwitujący (#4dff4d)
            ctx.fillStyle = isLate ? "rgba(200, 100, 100, 0.8)" : "rgba(100, 200, 100, 0.8)";
        }
    ctx.fillRect(x, y, w, h);
    // 2. Rysowanie wyraźnej czarnej ramki
    ctx.strokeStyle = "#000"; // Wymuszamy czarny kolor ramki
    ctx.lineWidth = 3;        // Standardowa grubość linii
    ctx.strokeRect(x, y, w, h);
    // 3. ETYKIETA
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(viewConverter.idToLabel(id), x + w/2, y + h/2 + 6);
  }
  drawArrow(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-12, 4);
    ctx.fill();
    ctx.restore();
  }
}

class ViewNotes {
    constructor(container, count = 0) {
        this.container = container;
        this.count = count;
        this.rows = [];
        this.refSumWiTi = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <table id="boxNotesTable">
                <thead>
                    <tr>
                        <th>id</th>
                        <th>p</th><th>w</th><th>d</th>
                        <th>S</th>
                        <th>C = S + p</th>
                        <th>T = max(0, C - d)</th>
                        <th>wT = w * T</th>
                    </tr>
                </thead>
                <tbody id="notes-body"></tbody>
                <tfoot>
                    <tr class="tfoot-row">
                        <td class="td-empty"></td><td class="td-empty"></td>
                        <td class="td-empty"></td><td class="td-empty"></td>
                        <td class="td-empty"></td><td class="td-empty"></td>
                        <td class="td-empty"></td>
                        <td class="col-wt tfoot-value">
                            Σ w<sub>i</sub>T<sub>i</sub> = <span id="stat-sumwiti">0</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;

        const tbody = this.container.querySelector('#notes-body');
        this.refSumWiTi = this.container.querySelector('#stat-sumwiti');
        this.rows = [];

        for (let i = 0; i < this.count; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-id">\u00A0</td>
                <td class="col-p">\u00A0</td>
                <td class="col-w">\u00A0</td>
                <td class="col-d">\u00A0</td>
                <td class="col-s">\u00A0</td>
                <td class="col-c">\u00A0</td>
                <td class="col-t">\u00A0</td>
                <td class="col-wt">\u00A0</td>
            `;
            tbody.appendChild(tr);

            this.rows.push({
                id: tr.querySelector('.col-id'),
                p:  tr.querySelector('.col-p'),
                w:  tr.querySelector('.col-w'),
                d:  tr.querySelector('.col-d'),
                s:  tr.querySelector('.col-s'),
                c:  tr.querySelector('.col-c'),
                t:  tr.querySelector('.col-t'),
                wt: tr.querySelector('.col-wt')
            });
        }
    }

    reset(newCount) {
        this.count = newCount;
        this.init();
    }

    update(solutionFull, instance) {
        if (!solutionFull || !instance || !solutionFull.timeTable) return;

        if (solutionFull.timeTable.length !== this.rows.length) {
            this.reset(solutionFull.timeTable.length);
        }

        solutionFull.timeTable.forEach((item, i) => {
            const row = this.rows[i];
            const taskData = instance.tasks[item.id];
            if (!row || !taskData) return;

            // Dane wejściowe
            row.id.textContent = viewConverter.idToLabel(item.id);
            row.p.textContent = taskData.p;
            row.w.textContent = taskData.w;
            row.d.textContent = taskData.d;

            // Logika WITI
            row.s.textContent = item.S;
            row.c.textContent = `${item.S}+${taskData.p}=${item.C}`;

            // Obliczanie spóźnienia T
            row.t.textContent = `max(0,${item.C}-${taskData.d})=${item.T}`;

            // Obliczanie kary wT
            // Obliczanie kary wT - czysty tekst bez formatowania
            const wT = taskData.w * item.T;
            row.wt.textContent = `${taskData.w} · ${item.T} = ${wT}`;
        });

        this.refSumWiTi.textContent = solutionFull.sumWiTi;
    }
}
