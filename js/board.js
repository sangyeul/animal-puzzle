import { characterSvg, kindAt } from './characters.js?v=20261117212916';
import { ANIMAL, MARK, WRONG } from './rules.js?v=20261117212916';

function edgeClasses(game, i) {
  const { n, regions } = game;
  const r = Math.floor(i / n), c = i % n;
  const differs = (j) => regions[j] !== regions[i];
  const out = [];
  if (r > 0 && differs(i - n)) out.push('et');
  if (r < n - 1 && differs(i + n)) out.push('eb');
  if (c > 0 && differs(i - 1)) out.push('el');
  if (c < n - 1 && differs(i + 1)) out.push('er');
  return out;
}

export function buildBoard(el, game) {
  el.style.setProperty('--n', game.n);
  el.classList.remove('won');
  el.replaceChildren();
  for (let i = 0; i < game.n * game.n; i++) {
    const cell = document.createElement('div');
    cell.className = ['cell', ...edgeClasses(game, i)].join(' ');
    cell.dataset.i = i;
    cell.style.setProperty('--c', `var(--region-${game.regions[i]})`);
    cell.style.setProperty('--order', Math.floor(i / game.n));
    // 동물들이 한꺼번에 눈을 깜빡이지 않게 칸마다 박자를 어긋나게 한다.
    cell.style.setProperty('--blink', `${-((i * 37) % 38) / 10}s`);
    cell.append(document.createElement('span'));
    el.append(cell);
  }
}

const STATES = { [ANIMAL]: 'animal', [MARK]: 'mark', [WRONG]: 'wrong' };
const TEXT = { mark: '✕', wrong: '✕', empty: '' };

export function paintBoard(el, game) {
  [...el.children].forEach((cell, i) => {
    const state = STATES[game.cells[i]] ?? 'empty';
    // 상태가 바뀐 칸만 고쳐야 놓기 애니메이션이 그 칸에서만 다시 돈다.
    if (cell.dataset.state === state) return;
    cell.dataset.state = state;
    if (state === 'animal') cell.firstChild.innerHTML = characterSvg(kindAt(game.animal, Math.floor(i / game.n), game.friends));
    else cell.firstChild.textContent = TEXT[state];
  });
  el.classList.toggle('won', game.done);
}

export function flashCell(el, i) {
  const cell = el.children[i];
  cell.classList.remove('flash');
  void cell.offsetWidth;
  cell.classList.add('flash');
  setTimeout(() => cell.classList.remove('flash'), 1200);
}

function cellAt(el, event) {
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.cell');
  return target && el.contains(target) ? Number(target.dataset.i) : null;
}

const DOUBLE_MS = 350;

// 누르고 떼면 onTap, 같은 칸을 빠르게 한 번 더 누르면 onDoubleTap,
// 다른 칸으로 끌면 지나간 칸마다 onDrag. 끌기 한 번은 onDragEnd로 닫는다.
export function bindInput(el, { onTap, onDoubleTap, onDragStart, onDrag, onDragEnd }) {
  let start = null;
  let last = { cell: null, time: 0 };
  let dragging = false;
  el.addEventListener('pointerdown', (event) => {
    start = cellAt(el, event);
    dragging = false;
    // 손가락이 판 밖으로 나가도 끌기가 끊기지 않게 한다. 캡처를 못 해도 누르기는 동작해야 한다.
    try { if (start !== null) el.setPointerCapture(event.pointerId); } catch { /* 캡처 불가 */ }
  });
  el.addEventListener('pointermove', (event) => {
    if (start === null) return;
    const over = cellAt(el, event);
    if (over === null || (!dragging && over === start)) return;
    if (!dragging) {
      dragging = true;
      onDragStart();
      onDrag(start);
    }
    onDrag(over);
  });
  const finish = (event) => {
    if (start === null) return;
    if (dragging) onDragEnd();
    else if (event.type === 'pointerup') tap(start, event.timeStamp);
    start = null;
  };
  const tap = (cell, time) => {
    if (last.cell === cell && time - last.time < DOUBLE_MS) {
      last = { cell: null, time: 0 };
      onDoubleTap(cell);
    } else {
      last = { cell, time };
      onTap(cell);
    }
  };
  // 두 번 누를 때 브라우저가 화면을 확대하지 않게 한다.
  el.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
  el.addEventListener('dblclick', (event) => event.preventDefault());
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
}
