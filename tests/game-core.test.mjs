import assert from "node:assert/strict";
import test from "node:test";
import { CatchDachshundGame } from "../game-core.js";

test("новая игра длится 30 секунд и начинается с нулевого счёта", () => {
  const game = new CatchDachshundGame();
  assert.deepEqual(game.start(1_000), { status: "running", score: 0, remainingMs: 30_000, seconds: 30 });
});

test("успешный клик добавляет ровно одно очко", () => {
  const game = new CatchDachshundGame();
  game.start(0);
  assert.equal(game.catch(500), true);
  assert.equal(game.score, 1);
});

test("клики до старта и после завершения не засчитываются", () => {
  const game = new CatchDachshundGame();
  assert.equal(game.catch(0), false);
  game.start(0);
  assert.equal(game.catch(30_000), false);
  assert.equal(game.score, 0);
  assert.equal(game.status, "finished");
});

test("пауза останавливает таймер и блокирует очки", () => {
  const game = new CatchDachshundGame();
  game.start(0);
  assert.equal(game.pause(7_500), true);
  assert.equal(game.snapshot(20_000).remainingMs, 22_500);
  assert.equal(game.catch(20_000), false);
});

test("после паузы игра продолжается с оставшегося времени", () => {
  const game = new CatchDachshundGame();
  game.start(0);
  game.pause(10_000);
  assert.equal(game.resume(50_000), true);
  assert.equal(game.snapshot(55_000).remainingMs, 15_000);
  assert.equal(game.catch(55_000), true);
});

test("повторный старт полностью сбрасывает раунд", () => {
  const game = new CatchDachshundGame();
  game.start(0);
  game.catch(1_000);
  game.start(9_000);
  assert.equal(game.score, 0);
  assert.equal(game.snapshot(9_000).seconds, 30);
});

