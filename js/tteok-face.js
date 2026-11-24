// 떡 캐릭터 공통 얼굴(눈·볼·입·느낌표·콧물 방울). 13종이 같은 부품을 쓴다. 100×100 좌표.
// 게임(js/characters.js)과 에셋 스크립트(scripts/assets/)가 함께 쓰는 단일 출처. DOM 없이 문자열만 만든다.
// 표정 근거: docs/plan/characters-2026-11-22.md 0-2
export const INK = '#4A2B27';
export const BODY = 'M15 69 C11 45 29 27 50 27 C71 27 89 45 85 69 C83 80 70 84 50 84 C30 84 17 80 15 69Z';

function eyes(face) {
  if (face === 'yawn') { // 질끈 감은 눈 (> <)
    return `<g stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M33 54 L42 58 L33 62"/><path d="M67 54 L58 58 L67 62"/></g>`;
  }
  if (face === 'sleepy') { // 반쯤 감긴 눈
    return `<g stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M32.5 58 H43.5"/><path d="M56.5 58 H67.5"/></g>
      <path d="M33.5 58 A4.5 3.6 0 0 0 42.5 58Z M57.5 58 A4.5 3.6 0 0 0 66.5 58Z" fill="${INK}"/>`;
  }
  if (face === 'happy') { // 웃는 눈(∩ 모양)
    return `<g stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M32.5 59 Q38 52.5 43.5 59"/><path d="M56.5 59 Q62 52.5 67.5 59"/></g>`;
  }
  const k = face === 'oing' ? 1.3 : 1; // "오잉" = 눈 1.3배
  const e = 5.4 * k;
  const hx = (k - 1) * 1.5;
  return `<circle cx="38" cy="58" r="${e}" fill="${INK}"/><circle cx="62" cy="58" r="${e}" fill="${INK}"/>
    <circle cx="${39.6 + hx}" cy="${56.2 - hx}" r="${1.7 * k}" fill="#fff"/>
    <circle cx="${63.6 + hx}" cy="${56.2 - hx}" r="${1.7 * k}" fill="#fff"/>`;
}

function mouth(face) {
  if (face === 'yawn') return '<ellipse cx="50" cy="69" rx="5.4" ry="6.6" fill="#4A2B27"/><ellipse cx="50" cy="72" rx="3.4" ry="2.6" fill="#D9897C"/>';
  if (face === 'sleepy') return `<path d="M47 66 Q50 67.6 53 66" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  if (face === 'oing') return '<ellipse cx="50" cy="68.5" rx="4.2" ry="5.2" fill="#4A2B27"/><ellipse cx="50" cy="70.6" rx="2.6" ry="2" fill="#D9897C"/>';
  if (face === 'happy') return `<path d="M44.5 64 Q50 71 55.5 64Z" fill="${INK}"/><path d="M47 67.2 Q50 69.4 53 67.2" fill="#D9897C"/>`;
  return `<path d="M46.5 64.5 Q50 68 53.5 64.5" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
}

// 공통 얼굴(눈·볼·입·"!") — 13종이 같은 부품을 쓴다. kind: smile|oing|happy|yawn|sleepy, dy·dx: 얼굴 위치 보정
export function face(kind = 'smile', dy = 0, dx = 0) {
  const bang = kind === 'oing'
    ? '<path d="M88 12 l-3 14" stroke="#DDB660" stroke-width="4.4" stroke-linecap="round"/><circle cx="83.6" cy="32.5" r="2.5" fill="#DDB660"/>'
    : kind === 'sleepy' // 콧물 방울(움직임은 CSS가 .bubble 크기를 바꾼다) + 작은 z
      ? `<circle class="bubble" cx="58" cy="${64 + dy}" r="3.6" fill="#CFE6F2" stroke="#8FB7CC" stroke-width=".9" opacity=".9"/>
        <path class="zz" d="M76 16 h8 l-8 9 h8" stroke="#8C93A8" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      : '';
  return `<g transform="translate(${dx} ${dy})"><g class="eyes">${eyes(kind)}</g>
    <ellipse cx="29.5" cy="66" rx="4.4" ry="2.6" fill="#F2A391" opacity=".85"/>
    <ellipse cx="70.5" cy="66" rx="4.4" ry="2.6" fill="#F2A391" opacity=".85"/>
    ${mouth(kind)}</g>${bang}`;
}

export const GROUND = '<ellipse cx="50" cy="83" rx="33" ry="4.5" fill="#000" opacity=".10"/>';
