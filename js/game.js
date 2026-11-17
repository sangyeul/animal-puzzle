import { KIND_KEYS as ANIMALS } from './characters.js?v=20261117212916';
import { generatePuzzle } from './generator.js?v=20261117212916';
import { hashSeed } from './rng.js?v=20261117212916';
import { ANIMAL, EMPTY, MARK, WRONG, isSolved } from './rules.js?v=20261117212916';

// 틀린 칸을 이만큼 고르면 그 판은 실패다. (원 앱의 목숨 수는 확인하지 못해 3으로 정했다)
export const LIVES = 3;

export function describe(spec) {
  if (spec.mode === 'level') return `퍼즐 ${spec.level}`;
  if (spec.mode === 'daily') return `오늘의 퍼즐 ${spec.dateKey.slice(5).replace('-', '/')}`;
  return '자유 플레이';
}

function seedOf(spec) {
  // 퍼즐은 무작위 시드로 낸다. 시드가 없는 것은 예전(번호로 고정된 레벨) 방식으로 저장된 판이다.
  if (spec.mode === 'level') return spec.seed ?? hashSeed(`level-${spec.level}`);
  if (spec.mode === 'daily') return hashSeed(`daily-${spec.dateKey}`);
  return spec.seed;
}

// friends: 도감에서 열린 동물 수. 판에는 열린 동물만 나온다 (문제 자체는 시드로만 정해진다).
export function createGame(spec, snapshot = null, friends = ANIMALS.length) {
  const seed = seedOf(spec);
  const { n, regions, solution } = generatePuzzle(spec.n, seed);
  const game = {
    spec, n, regions, solution,
    animal: ANIMALS[seed % friends],
    friends,
    cells: new Array(n * n).fill(EMPTY),
    undoStack: [],
    stroke: null,
    elapsed: 0,
    hints: 0,
    mistakes: 0,
    done: false,
    failed: false,
  };
  if (snapshot && snapshot.cells?.length === n * n) {
    // 예전 조작 방식으로 저장된 판에는 틀린 자리의 동물이 있을 수 있다. 그런 칸은 비운다.
    game.cells = snapshot.cells.map((v, i) => (v === ANIMAL && !isCorrect(game, i) ? EMPTY : v));
    game.elapsed = snapshot.elapsed || 0;
    game.hints = snapshot.hints || 0;
    game.mistakes = snapshot.mistakes || 0;
    game.failed = game.mistakes >= LIVES;
    game.done = isSolved(game.n, game.regions, game.cells);
  }
  return game;
}

export function snapshot(game) {
  return { spec: game.spec, cells: game.cells, elapsed: game.elapsed, hints: game.hints, mistakes: game.mistakes };
}

function isCorrect(game, i) {
  return game.solution[Math.floor(i / game.n)] === i % game.n;
}

// 동물과 빨간 ✕는 확정된 칸이라 다시 바꿀 수 없다.
const isLocked = (value) => value === ANIMAL || value === WRONG;

// 한 번의 조작(누르기 또는 끌기)을 되돌리기 한 단위로 묶는다.
export function beginStroke(game) {
  game.stroke = [];
}

export function endStroke(game) {
  if (game.stroke?.length) game.undoStack.push(game.stroke);
  game.stroke = null;
}

function setCell(game, i, value) {
  if (game.cells[i] === value) return;
  game.stroke.push([i, game.cells[i]]);
  game.cells[i] = value;
}

// 한 번 누르기: 빈칸 ↔ ✕ (여기엔 동물이 없다는 메모)
export function toggleMark(game, i) {
  if (game.cells[i] === EMPTY) setCell(game, i, MARK);
  else if (game.cells[i] === MARK) setCell(game, i, EMPTY);
}

// 끌기: 지나간 빈칸에 ✕
export function markCell(game, i) {
  if (game.cells[i] === EMPTY) setCell(game, i, MARK);
}

// 두 번 누르기: 동물이 있는 칸인지 확인한다. 맞으면 동물이 나타나고, 틀리면 빨간 ✕가 남고 목숨이 준다.
export function claimCell(game, i) {
  if (game.failed || isLocked(game.cells[i])) return null;
  const right = isCorrect(game, i);
  game.cells[i] = right ? ANIMAL : WRONG;
  if (!right) game.mistakes += 1;
  game.failed = game.mistakes >= LIVES;
  game.done = isSolved(game.n, game.regions, game.cells);
  return right ? 'right' : 'wrong';
}

// ✕ 표시만 되돌린다. 확정된 칸을 건드리는 기록은 건너뛴다.
export function undo(game) {
  while (game.undoStack.length) {
    const stroke = game.undoStack.pop();
    let changed = false;
    for (let k = stroke.length - 1; k >= 0; k--) {
      const [i, before] = stroke[k];
      if (isLocked(game.cells[i]) || game.cells[i] === before) continue;
      game.cells[i] = before;
      changed = true;
    }
    if (changed) return true;
  }
  return false;
}

// 처음부터 다시: 판, 시간, 힌트·실수 횟수를 모두 처음으로 돌린다.
export function restart(game) {
  game.cells.fill(EMPTY);
  Object.assign(game, { undoStack: [], stroke: null, elapsed: 0, hints: 0, mistakes: 0, done: false, failed: false });
}

// 아직 못 찾은 동물 한 마리를 놓아 준다.
export function useHint(game) {
  const row = game.solution.findIndex((c, r) => game.cells[r * game.n + c] !== ANIMAL);
  if (row < 0) return null;
  const cell = row * game.n + game.solution[row];
  game.cells[cell] = ANIMAL;
  game.hints += 1;
  game.done = isSolved(game.n, game.regions, game.cells);
  return { cell };
}
