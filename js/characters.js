// 떡 친구 13종 (말랑 찹쌀떡 그림체). 문자열만 만들므로 DOM 없이 테스트한다.
// 한 SVG 안에 표정 다섯 벌을 모두 넣고, 어느 것을 보일지는 CSS가 고른다.
// 그림 원본: js/tteok-art.js(몸통) · js/tteok-face.js(얼굴) — 스토어·광고 에셋과 같은 그림
import { body, KINDS as KIND_LIST, NAMES } from './tteok-art.js?v=20261124100927';
import { face } from './tteok-face.js?v=20261124100927';

export const KIND_KEYS = KIND_LIST;
export const KINDS = Object.fromEntries(KIND_KEYS.map((k) => [k, { name: NAMES[k] }]));

// 판의 주인공(lead)에서 시작해 줄마다 다음 떡이 나온다.
// count를 주면 도감에서 열린 앞쪽 count종 안에서만 돈다.
export function kindAt(lead, offset, count = KIND_KEYS.length) {
  const start = Math.max(0, KIND_KEYS.indexOf(lead));
  return KIND_KEYS[(start + offset) % count];
}

// CSS 표정 이름 → 얼굴 부품. idle 평소, worry 오잉(틀림), happy 기쁨, yawn 하품, sleepy 졸기
export const MOODS = { idle: 'smile', worry: 'oing', happy: 'happy', yawn: 'yawn', sleepy: 'sleepy' };
const LINE = '#C9AFAA'; // 연한 구역 위에서 흰 떡이 묻히지 않게

// mood를 주면 그 표정으로 고정한다(완료 창 등). 비우면 판의 상태를 따른다.
export function characterSvg(kind, mood = '') {
  const k = KINDS[kind] ? kind : KIND_KEYS[0];
  const faces = (dy, dx) => Object.entries(MOODS).map(([m, f]) => `<g class="f-${m}">${face(f, dy, dx)}</g>`).join('');
  return `<svg class="ch${mood ? ` is-${mood}` : ''}" viewBox="0 0 100 100" aria-hidden="true">${body(k, faces, LINE)}</svg>`;
}
