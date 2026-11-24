import { bindInput, buildBoard, flashCell, paintBoard } from './board.js?v=20261124100927';
import { KINDS, KIND_KEYS, characterSvg } from './characters.js?v=20261124100927';
import { burst, confetti } from './fx.js?v=20261124100927';
import {
  LIVES, beginStroke, claimCell, createGame, describe, endStroke, markCell, restart, snapshot, toggleMark, undo, useHint,
} from './game.js?v=20261124100927';
import { renderDex, renderPath, renderStamps, starsHtml } from './home.js?v=20261124100927';
import { PAR, newFriend, pickSize, starsFor, unlockedCount } from './progress.js?v=20261124100927';
import { ANIMAL, MARK } from './rules.js?v=20261124100927';
import { buzz, canBuzz, sound } from './sound.js?v=20261124100927';
import { currentStreak, data, recordBest, recordDaily, recordStars, save, todayKey, totalStars } from './store.js?v=20261124100927';

const SIZES = [5, 6, 7, 8, 9];
const DAILY_SIZE = 8;
const $ = (id) => document.getElementById(id);
const board = $('board');
let game = null;

function clock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function sameSpec(a, b) {
  return a && b && a.mode === b.mode && a.level === b.level && a.dateKey === b.dateKey && a.seed === b.seed;
}

function show(view) {
  $('home').hidden = view !== 'home';
  $('play').hidden = view !== 'play';
  window.scrollTo(0, 0);
}

/* ---------- 처음 화면 ---------- */

// 다음에 풀 퍼즐. 크기와 문제를 무작위로 정해 두고, 풀 때까지 같은 문제를 유지한다
// (나갔다 들어와도, 목숨을 다 써서 다시 도전해도 같은 문제다).
function nextPuzzle() {
  const store = data();
  if (store.next?.level !== store.level) {
    store.next = { mode: 'level', level: store.level, n: pickSize(store.level), seed: Math.floor(Math.random() * 2 ** 31) };
    save();
  }
  return store.next;
}

const startPuzzle = () => start(nextPuzzle());
const over = () => game.done || game.failed;

function renderHome() {
  const store = data();
  const size = nextPuzzle().n;
  const friends = unlockedCount(store.level);
  $('btn-level').innerHTML = `퍼즐 ${store.level} 시작 <small>${size}×${size}</small>`;
  $('mascot').innerHTML = characterSvg(KIND_KEYS[friends - 1]);
  $('summary').innerHTML = `<b class="gold">★</b> ${totalStars()} · 친구 ${friends}/${KIND_KEYS.length}`;
  $('dex-count').textContent = `${friends}/${KIND_KEYS.length}`;

  const today = todayKey();
  const doneTime = store.daily.times[today];
  const streak = currentStreak();
  const dailyNote = doneTime !== undefined ? `오늘 완료 ${clock(doneTime)}` : `${DAILY_SIZE}×${DAILY_SIZE}`;
  $('btn-daily').innerHTML = `오늘의 퍼즐 <small>${dailyNote}</small>`;
  $('streak').textContent = streak ? `연속 ${streak}일` : '매일 한 문제';
  renderStamps($('stamps'), store);

  const saved = store.saved;
  $('btn-resume').hidden = !saved;
  if (saved) $('btn-resume').innerHTML = `하던 판 이어하기 <small>${describe(saved.spec)} · ${clock(saved.elapsed)}</small>`;

  $('sizes').replaceChildren(...SIZES.map((n) => {
    const button = document.createElement('button');
    button.className = 'btn';
    const best = store.best[n];
    button.innerHTML = `${n}×${n}<small>${best !== undefined ? `최고 ${clock(best)}` : '기록 없음'}</small>`;
    button.addEventListener('click', () => start({ mode: 'free', n, seed: Math.floor(Math.random() * 2 ** 31) }));
    return button;
  }));
}

// 마지막 조작 뒤 흐른 시간까지 저장한다 (앱을 닫았다 열어도 시간이 줄지 않게).
function persistElapsed() {
  const saved = data().saved;
  if (!game || over() || !sameSpec(saved?.spec, game.spec)) return;
  saved.elapsed = game.elapsed;
  save();
}

function goHome() {
  persistElapsed();
  game = null;
  renderHome();
  show('home');
  // 가로로 넘기는 길은 화면에 보인 뒤에야 지금 레벨 위치로 옮길 수 있다.
  renderPath($('path'), data(), startPuzzle);
}

// 화면 안의 뒤로 버튼. 쌓아 둔 방문 기록을 되감아 브라우저 뒤로가기와 같은 길로 돌아간다.
function leavePlay() {
  if (history.state?.play) history.back();
  else goHome();
}

window.addEventListener('popstate', (event) => {
  const dialogs = [...document.querySelectorAll('dialog[open]')];
  dialogs.forEach((dialog) => dialog.close());
  const playing = !$('play').hidden;
  // 게임 중에 창(게임 방법 등)이 열려 있었다면 뒤로가기는 그 창만 닫는다. 완료·실패 창은 예외로 처음 화면까지 간다.
  if (playing && dialogs.length && !over()) history.pushState({ play: true }, '');
  else if (playing) goHome();
  // 앞으로 가기로 게임 기록에 다시 들어온 경우: 보여줄 판이 없으니 처음 화면 기록으로 돌려보낸다.
  else if (event.state?.play) history.back();
});

/* ---------- 게임 화면 ---------- */

function start(spec) {
  const saved = data().saved;
  try {
    game = createGame(spec, sameSpec(saved?.spec, spec) ? saved : null, unlockedCount(data().level));
  } catch (error) {
    alert(error.message);
    return;
  }
  buildBoard(board, game);
  $('play-title').textContent = `${describe(spec)} · ${game.n}×${game.n}`;
  say('');
  show('play');
  // 브라우저·휴대폰의 뒤로가기로도 처음 화면에 돌아올 수 있게 방문 기록을 한 칸 쌓는다.
  if (!history.state?.play) history.pushState({ play: true }, '');
  refresh();
  // 처음 하는 사람은 누르는 방법을 모른다. 첫 판에서 한 번 게임 방법을 보여준다.
  if (!data().seenHow) {
    data().seenHow = true;
    save();
    $('dlg-how').showModal();
  }
}

function say(text) {
  $('message').textContent = text;
}

function renderTimer() {
  $('timer').hidden = !data().settings.showTimer;
  $('timer').textContent = clock(game.elapsed);
}

const animalCount = () => game.cells.filter((v) => v === ANIMAL).length;

// 찾은 떡 수만큼 점이 채워진다.
function renderPips() {
  const found = animalCount();
  const pips = $('play-size');
  pips.setAttribute('aria-label', `찾은 떡 ${found}개, 전체 ${game.n}개`);
  while (pips.children.length < game.n) pips.append(document.createElement('i'));
  while (pips.children.length > game.n) pips.lastChild.remove();
  [...pips.children].forEach((pip, k) => pip.classList.toggle('on', k < found));
}

// 떡을 찾았을 때: 별 조각과 올라가는 음
function cheer(i) {
  burst(board.children[i]);
  if (over()) return;
  sound('place', animalCount() - 1);
  buzz('place');
}

function renderLives() {
  const left = LIVES - game.mistakes;
  const hearts = $('lives');
  hearts.setAttribute('aria-label', `남은 목숨 ${left}개`);
  hearts.innerHTML = Array.from({ length: LIVES }, (_, k) => `<i class="${k < left ? 'on' : ''}">♥</i>`).join('');
}

// 목숨을 다 썼을 때: 같은 문제를 처음부터 다시 풀 수 있다.
function fail() {
  if (sameSpec(data().saved?.spec, game.spec)) data().saved = null;
  save();
  say('');
  sound('fail');
  buzz('fail');
  $('fail-animal').innerHTML = characterSvg(game.animal, 'worry');
  setTimeout(() => game?.failed && $('dlg-fail').showModal(), 700);
}

// 떡이 없는 칸을 골랐을 때: 목숨이 하나 줄고 판 위의 친구들이 잠깐 당황한다.
function oops() {
  board.classList.add('oops');
  setTimeout(() => board.classList.remove('oops'), 900);
  if (game.failed) return fail();
  say(`여기엔 친구가 없어요. 목숨이 ${LIVES - game.mistakes}개 남았어요.`);
  sound('bad');
  buzz('bad');
}

function refresh() {
  paintBoard(board, game);
  renderTimer();
  renderPips();
  renderLives();
  $('btn-undo').disabled = over() || !game.undoStack.length;
  $('btn-hint').disabled = over();
  if (game.done) return win();
  if (game.failed) return;
  const touched = game.cells.some((v) => v !== 0);
  data().saved = touched ? snapshot(game) : (sameSpec(data().saved?.spec, game.spec) ? null : data().saved);
  save();
}

function win() {
  const store = data();
  const { spec, n, elapsed, hints, mistakes } = game;
  const levelBefore = store.level;
  if (spec.mode === 'level' && spec.level === store.level) {
    store.level += 1;
    store.next = null;
  }
  const stars = starsFor(n, elapsed, hints, mistakes);
  if (spec.mode === 'level') recordStars(spec.level, stars);
  const friend = newFriend(levelBefore, store.level);
  if (spec.mode === 'daily') recordDaily(spec.dateKey, elapsed);
  const isBest = hints === 0 && recordBest(n, elapsed);
  if (sameSpec(store.saved?.spec, spec)) store.saved = null;
  save();

  const lines = [`${describe(spec)} · ${n}×${n}`, `걸린 시간 ${clock(elapsed)} (별 기준 ${clock(PAR[n])})`];
  lines.push(mistakes ? `실수 ${mistakes}번` : '실수 없이 풀었어요');
  if (hints) lines.push(`힌트 ${hints}번 사용`);
  if (isBest) lines.push(`${n}×${n} 최고 기록이에요`);
  $('win-title').textContent = ['풀었어요!', '잘했어요!', '완벽해요!'][stars - 1];
  $('win-animal').innerHTML = characterSvg(game.animal, 'happy');
  confetti();
  sound('win');
  buzz('win');
  $('win-detail').textContent = lines.join('\n');
  $('win-stars').innerHTML = starsHtml(stars);
  $('win-friend').hidden = !friend;
  if (friend) $('win-friend').innerHTML = `${characterSvg(friend, 'happy')}<span>새 친구 <b>${KINDS[friend].name}</b> 등장! 도감에서 만나요.</span>`;
  $('btn-next').textContent = spec.mode === 'level' ? '다음 퍼즐' : '자유 플레이 새 문제';
  $('btn-next').hidden = spec.mode === 'daily';
  setTimeout(() => {
    if (!game?.done) return;
    $('dlg-win').showModal();
    for (let k = 0; k < stars; k++) setTimeout(() => sound('star', k), k * 180);
    if (friend) setTimeout(() => sound('friend'), stars * 180 + 150);
  }, 1500);
}

function nextAfterWin() {
  $('dlg-win').close();
  const { spec, n } = game;
  if (spec.mode === 'level') startPuzzle();
  else start({ mode: 'free', n, seed: Math.floor(Math.random() * 2 ** 31) });
}

function onHint() {
  const hint = useHint(game);
  if (!hint) return;
  say('떡 친구 하나를 찾아 줬어요.');
  refresh();
  flashCell(board, hint.cell);
  cheer(hint.cell);
}

// 한 번 누르기: ✕ 표시를 하거나 지운다.
function onTap(i) {
  if (over()) return;
  const before = game.cells[i];
  beginStroke(game); toggleMark(game, i); endStroke(game);
  if (game.cells[i] === before) return;
  say('');
  sound(game.cells[i] === MARK ? 'mark' : 'erase');
  if (game.cells[i] === MARK) buzz('tap');
  refresh();
}

// 두 번 누르기: 떡이 있는 칸인지 확인한다.
function onDoubleTap(i) {
  if (over()) return;
  const result = claimCell(game, i);
  if (!result) return;
  say('');
  refresh();
  if (result === 'right') cheer(i);
  else oops();
}

function bindPlay() {
  bindInput(board, {
    onTap,
    onDoubleTap,
    onDragStart: () => { if (!over()) beginStroke(game); },
    onDrag: (i) => {
      if (over() || !game.stroke) return;
      markCell(game, i);
      paintBoard(board, game);
    },
    onDragEnd: () => { if (game.stroke) { endStroke(game); refresh(); } },
  });
  $('btn-undo').addEventListener('click', () => { if (undo(game)) { say(''); sound('erase'); refresh(); } });
  $('btn-hint').addEventListener('click', onHint);
  $('btn-restart').addEventListener('click', () => {
    if (!confirm('처음부터 다시 풀까요? 시간과 실수 기록도 처음으로 돌아갑니다.')) return;
    restart(game);
    say('처음부터 다시 시작해요.');
    sound('erase');
    refresh();
  });
  $('btn-back').addEventListener('click', leavePlay);
  $('btn-next').addEventListener('click', nextAfterWin);
  // 완료 창은 Esc로 닫히지 않게 한다. 닫히면 다 푼 판에 갈 곳 없이 남는다.
  $('dlg-win').addEventListener('cancel', (event) => event.preventDefault());
  $('dlg-fail').addEventListener('cancel', (event) => event.preventDefault());
  $('btn-retry').addEventListener('click', () => {
    $('dlg-fail').close();
    restart(game);
    say('같은 문제를 처음부터 다시 풀어요.');
    refresh();
  });
  $('btn-fail-home').addEventListener('click', () => { $('dlg-fail').close(); leavePlay(); });
  $('btn-win-home').addEventListener('click', () => { $('dlg-win').close(); leavePlay(); });
  setInterval(() => {
    if (!game || over() || document.hidden || $('play').hidden) return;
    game.elapsed += 1;
    renderTimer();
  }, 1000);
}

/* ---------- 처음 화면 버튼·설정 ---------- */

function bindHome() {
  $('btn-level').addEventListener('click', startPuzzle);
  $('btn-dex').addEventListener('click', () => {
    renderDex($('dex'), data());
    $('dlg-dex').showModal();
  });
  $('btn-daily').addEventListener('click', () => start({ mode: 'daily', dateKey: todayKey(), n: DAILY_SIZE }));
  $('btn-resume').addEventListener('click', () => start(data().saved.spec));
  $('btn-how').addEventListener('click', () => $('dlg-how').showModal());
  $('btn-how-play').addEventListener('click', () => $('dlg-how').showModal());
  $('btn-settings').addEventListener('click', openSettings);
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
}

function openSettings() {
  $('opt-timer').checked = data().settings.showTimer;
  $('opt-sound').checked = data().settings.sound;
  $('opt-vibrate').checked = data().settings.vibrate;
  $('row-vibrate').hidden = !canBuzz();
  $('dlg-settings').showModal();
}

function bindSettings() {
  $('opt-timer').addEventListener('change', (e) => { data().settings.showTimer = e.target.checked; save(); });
  $('opt-sound').addEventListener('change', (e) => { data().settings.sound = e.target.checked; save(); sound('hint'); });
  $('opt-vibrate').addEventListener('change', (e) => { data().settings.vibrate = e.target.checked; save(); buzz('place'); });
  $('btn-wipe').addEventListener('click', () => {
    if (!confirm('푼 퍼즐 수, 별, 최고 기록, 하던 판이 모두 지워집니다. 지울까요?')) return;
    const store = data();
    Object.assign(store, { level: 1, best: {}, stars: {}, next: null, saved: null, daily: { lastDate: null, streak: 0, times: {} } });
    save();
    $('dlg-settings').close();
    goHome();
  });
}

// 글자나 빈 곳을 빠르게 두 번 눌러도 화면이 확대되지 않게 한다 (버튼·입력은 그대로 둔다).
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const quick = event.timeStamp - lastTouchEnd < 350;
  lastTouchEnd = event.timeStamp;
  if (quick && !event.target.closest('button, input, label')) event.preventDefault();
}, { passive: false });
document.addEventListener('gesturestart', (event) => event.preventDefault());

document.addEventListener('visibilitychange', () => { if (document.hidden) persistElapsed(); });
window.addEventListener('pagehide', persistElapsed);

bindHome();
bindSettings();
bindPlay();
// 게임 중에 새로고침하면 방문 기록에 게임 칸이 남아 있다. 처음 화면에서 시작하므로 지운다.
if (history.state?.play) history.replaceState(null, '');
goHome();
window.__booted = true;

// 한 번 연 뒤에는 인터넷 없이도 열리게 한다.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
