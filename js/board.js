import { characterSvg, kindAt } from './characters.js?v=20261124100927';
import { ANIMAL, MARK, WRONG } from './rules.js?v=20261124100927';

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
  armIdle(el);
  el.replaceChildren();
  for (let i = 0; i < game.n * game.n; i++) {
    const cell = document.createElement('div');
    cell.className = ['cell', ...edgeClasses(game, i)].join(' ');
    cell.dataset.i = i;
    cell.style.setProperty('--c', `var(--region-${game.regions[i]})`);
    cell.style.setProperty('--order', Math.floor(i / game.n));
    // 떡들이 한꺼번에 눈을 깜빡이지 않게 칸마다 박자를 어긋나게 한다.
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
    // 빈칸에서 떡이 막 나타났으면 잠깐 "오잉" 얼굴 (판을 처음 그릴 때·이어 하기는 제외)
    const fresh = state === 'animal' && cell.dataset.state === 'empty';
    cell.dataset.state = state;
    if (fresh) { cell.classList.remove('squish'); flag(cell, 'fresh', OING_MS); } // 나타날 때는 눌림 대신 오잉
    if (state === 'animal') cell.firstChild.innerHTML = characterSvg(kindAt(game.animal, Math.floor(i / game.n), game.friends));
    else cell.firstChild.textContent = TEXT[state];
  });
  el.classList.toggle('won', game.done);
}

// 클래스를 잠깐 붙였다 뗀다. 같은 클래스를 다시 붙이면 애니메이션이 처음부터 돈다.
function flag(node, name, ms) {
  node.classList.remove(name);
  void node.offsetWidth;
  node.classList.add(name);
  clearTimeout(node[`_${name}`]);
  node[`_${name}`] = setTimeout(() => node.classList.remove(name), ms);
}

const OING_MS = 600; // design/tokens.json motion.oing
const SQUASH_MS = 220; // motion.squash
// 입력이 없을 때 하품(15초)·졸기(30초). 시간은 가설 — 실제로 해 보고 조정한다 (PRD N3)
const YAWN_AFTER = 15000, SLEEP_AFTER = 30000, YAWN_MS = 2400;

// 마지막 입력부터 시간을 다시 잰다. 판이 숨었거나 끝났으면 졸지 않는다.
function armIdle(el) {
  clearTimeout(el._yawn); clearTimeout(el._sleep);
  el.classList.remove('yawn', 'sleepy');
  const awake = () => !el.closest('[hidden]') && !el.classList.contains('won');
  el._yawn = setTimeout(() => { if (awake()) flag(el, 'yawn', YAWN_MS); }, YAWN_AFTER);
  el._sleep = setTimeout(() => { if (awake()) el.classList.add('sleepy'); }, SLEEP_AFTER);
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
    armIdle(el); // 졸던 떡은 화들짝 깬다
    // 말랑 눌림(PRD N2): 누르는 순간 그 칸의 떡·✕가 눌렸다 돌아온다
    if (start !== null) flag(el.children[start], 'squish', SQUASH_MS);
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
