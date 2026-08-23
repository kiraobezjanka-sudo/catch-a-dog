import { CatchDachshundGame } from "./game-core.js";

const RECORD_KEY = "catch-dachshund.best-score.v1";
const engine = new CatchDachshundGame();
const elements = {
  best: document.querySelector("#best-value"),
  dachshund: document.querySelector("#dachshund"),
  overlay: document.querySelector("#game-overlay"),
  playfield: document.querySelector("#playfield"),
  score: document.querySelector("#score-value"),
  start: document.querySelector("#start-button"),
  time: document.querySelector("#time-value"),
};

let bestScore = readBestScore();
let lastPosition = null;
let renderedFinish = false;

elements.best.textContent = String(bestScore);
elements.dachshund.disabled = true;
elements.start.addEventListener("click", startRound);
elements.dachshund.addEventListener("click", catchDachshund);
elements.overlay.addEventListener("click", handleOverlayAction);
window.addEventListener("keydown", handleKeyboard);
requestAnimationFrame(updateFrame);

function startRound() {
  engine.start(performance.now());
  renderedFinish = false;
  elements.score.textContent = "0";
  elements.time.textContent = "30";
  elements.start.querySelector("span").textContent = "Начать заново";
  elements.dachshund.disabled = false;
  elements.dachshund.classList.remove("is-preview");
  elements.playfield.dataset.state = "running";
  hideOverlay();
  placeDachshund();
}

function catchDachshund() {
  if (!engine.catch(performance.now())) return;
  elements.score.textContent = String(engine.score);
  placeDachshund();
}

function placeDachshund() {
  const field = elements.playfield.getBoundingClientRect();
  const dog = elements.dachshund.getBoundingClientRect();
  const padding = 26;
  const maxX = Math.max(padding, field.width - dog.width - padding);
  const maxY = Math.max(padding, field.height - dog.height - padding);
  let next;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    next = {
      x: padding + Math.random() * (maxX - padding),
      y: padding + Math.random() * (maxY - padding),
    };
    if (!lastPosition || Math.hypot(next.x - lastPosition.x, next.y - lastPosition.y) > 145) break;
  }

  lastPosition = next;
  elements.dachshund.style.left = `${Math.round(next.x)}px`;
  elements.dachshund.style.top = `${Math.round(next.y)}px`;
  elements.dachshund.style.right = "auto";
  elements.dachshund.style.bottom = "auto";
  elements.dachshund.classList.remove("is-caught");
  void elements.dachshund.offsetWidth;
  elements.dachshund.classList.add("is-caught");
}

function handleKeyboard(event) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (engine.status === "running") pauseRound();
  else if (engine.status === "paused") resumeRound();
}

function pauseRound() {
  if (!engine.pause(performance.now())) return;
  elements.dachshund.disabled = true;
  elements.playfield.dataset.state = "paused";
  showOverlay({ kicker: "Пауза", title: "Такса ждёт!", text: "Таймер остановлен. Нажмите Esc или кнопку ниже, чтобы продолжить.", action: "Продолжить", actionType: "resume" });
}

function resumeRound() {
  if (!engine.resume(performance.now())) return;
  elements.dachshund.disabled = false;
  elements.playfield.dataset.state = "running";
  hideOverlay();
}

function finishRound() {
  if (renderedFinish) return;
  renderedFinish = true;
  elements.dachshund.disabled = true;
  elements.playfield.dataset.state = "finished";
  elements.time.textContent = "0";
  const isRecord = engine.score > bestScore;
  if (isRecord) {
    bestScore = engine.score;
    elements.best.textContent = String(bestScore);
    saveBestScore(bestScore);
  }
  showOverlay({
    kicker: isRecord ? "Новый рекорд!" : "Время вышло",
    title: `${engine.score} ${scoreWord(engine.score)}`,
    text: isRecord ? "Отличная реакция — этот результат сохранён." : `Ваш рекорд: ${bestScore}. Попробуйте ещё раз!`,
    action: "Сыграть ещё",
    actionType: "restart",
  });
}

function handleOverlayAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "resume") resumeRound();
  if (button.dataset.action === "restart") startRound();
}

function updateFrame(now) {
  const snapshot = engine.tick(now);
  if (snapshot.status === "running") elements.time.textContent = String(snapshot.seconds);
  if (snapshot.status === "finished") finishRound();
  requestAnimationFrame(updateFrame);
}

function showOverlay({ kicker, title, text, action, actionType }) {
  elements.overlay.innerHTML = `<p class="overlay-kicker">${kicker}</p><h2>${title}</h2><p>${text}</p><button class="overlay-action" type="button" data-action="${actionType}">${action}</button>`;
  elements.overlay.classList.add("is-visible");
  elements.overlay.querySelector("button").focus();
}

function hideOverlay() {
  elements.overlay.classList.remove("is-visible");
}

function readBestScore() {
  try {
    const value = Number.parseInt(localStorage.getItem(RECORD_KEY) || "0", 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem(RECORD_KEY, String(value));
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

function scoreWord(value) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "очков";
  if (last === 1) return "очко";
  if (last >= 2 && last <= 4) return "очка";
  return "очков";
}

