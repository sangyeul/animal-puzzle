// 효과음과 진동. 음원 파일 없이 그때그때 음을 합성한다 (오프라인·용량 문제 없음).
import { data } from './store.js?v=20261124100927';

let ctx = null;

// 소리는 사용자가 화면을 누른 뒤에만 낼 수 있어서, 처음 쓸 때 만든다.
function audio() {
  if (!data().settings.sound) return null;
  const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(ac, freq, at, length, type = 'sine', peak = .16) {
  const osc = ac.createOscillator(), gain = ac.createGain();
  const t = ac.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, t + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + length + .02);
}

// 도레미솔라 음계. 떡을 맞게 놓을수록 한 음씩 올라간다.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

// 이름 → [주파수, 시작(초), 길이(초), 파형, 세기] 목록
const TUNES = {
  mark: () => [[330, 0, .05, 'triangle', .06]],
  erase: () => [[262, 0, .07, 'triangle', .07]],
  place: (step) => [[SCALE[Math.min(step, 8)], 0, .12], [SCALE[Math.min(step, 8)] * 1.5, .06, .16, 'sine', .1]],
  bad: () => [[233, 0, .12, 'triangle', .14], [196, .1, .2, 'triangle', .14]],
  fail: () => [[330, 0, .16, 'triangle', .14], [262, .14, .16, 'triangle', .14], [196, .28, .4, 'triangle', .14]],
  hint: () => [[880, 0, .1], [1174.66, .09, .18]],
  win: () => [523.25, 659.25, 783.99, 1046.5, 1318.51].map((freq, k) => [freq, k * .09, .28]),
  star: (step) => [[SCALE[4 + step], 0, .25], [SCALE[4 + step] * 2, 0, .2, 'sine', .05]],
  friend: () => [[783.99, 0, .12], [1046.5, .1, .12], [1567.98, .2, .3]],
};

export function sound(name, step = 0) {
  try {
    const ac = audio();
    if (ac) TUNES[name](step).forEach((args) => tone(ac, ...args));
  } catch { /* 소리를 못 내도 게임은 계속된다 */ }
}

// 진동(N5). 안드로이드 앱은 네이티브 다리(window.MalangNative.haptic — 권한 불필요한 performHapticFeedback)를,
// 웹은 navigator.vibrate(지원 기기만)를 쓴다. 다리는 6단계 안드로이드 셸이 넣는다.
const native = () => globalThis.MalangNative && typeof globalThis.MalangNative.haptic === 'function';
export const canBuzz = () => native() || typeof navigator.vibrate === 'function';

// kind: tap(✕ 표시) · place(떡 찾음) · bad(틀림) · fail(목숨 다 씀) · win(완료)
const PATTERNS = { tap: 8, place: 12, bad: [30, 40, 30], fail: [60, 60, 120], win: [20, 40, 20, 40, 60] };

export function buzz(kind) {
  if (!data().settings.vibrate || !canBuzz()) return;
  try {
    if (native()) globalThis.MalangNative.haptic(kind);
    else navigator.vibrate(PATTERNS[kind]);
  } catch { /* 진동을 못 해도 게임은 계속된다 */ }
}
