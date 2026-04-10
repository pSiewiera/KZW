/**
 * PROJEKT: problem 1||sum WiTi (witi)
 * Moduł: main.js (KONTROLER)
 * Autor: M. Makuchowski
 * Data: 29.03.2026
 * * ROLA: Mediator systemu (Kontroler). Inicjalizuje komponenty,
 * zarządza przepływem danych między Modelem a Widokiem oraz
 * obsługuje zdarzenia wejściowe (zmiana danych instancji, zmiana kolejności).
 */

let engine;
let views = {};

// 1. Start po pełnym załadowaniu strony i stylów
window.addEventListener('load', () => {
    init();
    resizeApp();
});

window.addEventListener('resize', resizeApp);

function init()
{

  const data = {
      tasks: [
          {p: 2, w: 3, d: 4},
          {p: 4, w: 3, d: 3},
          {p: 1, w: 4, d: 5},
          {p: 3, w: 2, d: 2},
      ]
  };
  const solution = { order: [0,1,2,3,4,5,6,7] };

  engine = new Engine();
  views.data       = new ViewData(document.getElementById('boxData'),updateData);
  views.solution   = new ViewSolution(document.getElementById('boxSolution'), updateSolution);
  views.result     = new ViewResult(document.getElementById('boxResult'));
  views.draft      = new ViewDraft(document.getElementById('boxDraft'), updateSolution);
  views.notes      = new ViewNotes(document.getElementById('boxNotes'));

  engine.setData( data );
  engine.setSolution( solution );
  views.data.update( data );
  views.draft.setData( data );


  refreshSolution();
}

function updateSolution(solutionRaw) {
  if(solutionRaw) engine.setSolution(solutionRaw);
  refreshSolution()
}

function updateData(data) {
  if(data && data.tasks.length<=10) engine.setData(data);
  views.data.update(engine.data);
  views.draft.setData(engine.data);
  refreshSolution();
}

function refreshSolution() {
  const solutionFull = engine.makeSolutionFull();
  views.solution.update(solutionFull);
  views.result.update(solutionFull);
  views.draft.update(solutionFull);
  views.notes.update(solutionFull,engine.data);
}

/**
 * Automatyczne skalowanie aplikacji do rozmiaru okna przeglądarki
 * Zachowuje oryginalne proporcje 1190x680 (lub 1210x700 z paddingiem)
 */
function resizeApp() {
    const app = document.getElementById('app');
    if (!app) return;
    // Zaktualizowane wymiary sztywnej aplikacji (Siatka 1190 + 20px paddingu)
    const appWidth = 1210;
    const appHeight = 700;
    // Rozmiar aktualnego okna przeglądarki
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // Obliczamy ile razy aplikacja zmieści się na ekranie w poziomie i pionie
    const scaleX = windowWidth / appWidth;
    const scaleY = windowHeight / appHeight;
    // Wybieramy mniejszy mnożnik, żeby nic nie ucięło (zachowujemy proporcje)
    // Jeśli ekran jest duży, ograniczamy skalowanie do 1 (nie powiększamy pikseli na siłę)
    const appScale = Math.min(scaleX, scaleY);
    // Aplikujemy sprzętowe skalowanie CSS
    app.style.transform = `scale(${appScale})`;
    app.style.transformOrigin = 'center center';
}
