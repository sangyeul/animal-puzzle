// 떡 13종 몸통 (100×100, 그림체 1-A 납작한 벡터). 얼굴은 tteok-face.js 공통 부품.
// 게임(js/characters.js)과 에셋 스크립트(scripts/assets/)가 함께 쓰는 단일 출처.
// 모양·색 근거: docs/plan/characters-2026-11-22.md "떡 13종" — 40px에서 모양만으로 구분되게.
// 몸통 함수는 F(dy, dx)로 얼굴을 받는다: 에셋은 표정 하나, 게임은 표정 다섯 벌을 넣는다.
import { BODY, face, GROUND } from './tteok-face.js?v=20261124100927';

const stroke = (line, c) => (line ? ` stroke="${c}" stroke-width="1.6"` : '');
const shine = (x, y, rx, ry, rot, op = 0.5) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(${rot} ${x} ${y})"/>`;

// 찹쌀떡: 납작한 둥근 언덕
function mochi(F, line) {
  return `${GROUND}
    <path d="${BODY}" fill="#FCF1EF"${stroke(line, line)}/>
    <path d="M85 69 C83 80 70 84 50 84 C36 84 25 82 19 77 C33 80 63 81 74 72 C82 65 84 55 82 46 C86 53 87 61 85 69Z" fill="#F0D9D6"/>
    <ellipse cx="38" cy="41" rx="10" ry="5" fill="#fff" opacity=".55" transform="rotate(-24 38 41)"/>
    <g fill="#E9D3CF" opacity=".8"><circle cx="66" cy="38" r=".9"/><circle cx="72" cy="47" r=".7"/><circle cx="28" cy="70" r=".8"/><circle cx="60" cy="76" r=".7"/><circle cx="76" cy="60" r=".8"/></g>
    ${F(0)}`;
}

// 송편: 양끝이 뾰족한 반달 + 위 가장자리에 살짝 눌린 자국 (주름 대신 — 만두처럼 보이지 않게)
function songpyeon(F, line) {
  const body = 'M7 75 C9 47 28 31 50 31 C72 31 91 47 93 75 C72 83 28 83 7 75Z';
  return `${GROUND}<path d="${body}" fill="#C3DB9E"${stroke(line, '#8FAA6E')}/>
    <path d="M93 75 C72 83 28 83 7 75 C30 79 70 79 88 70 C91 72 92 73 93 75Z" fill="#A9C783"/>
    <g stroke="#A9C783" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M36 35 q3 3 6 0"/><path d="M47 33 q3 3 6 0"/><path d="M58 35 q3 3 6 0"/></g>
    <ellipse cx="34" cy="46" rx="9" ry="4" fill="#fff" opacity=".4" transform="rotate(-20 34 46)"/>
    ${F(2)}`;
}

// 인절미: 각진 네모 + 콩가루 점
function injeolmi(F, line) {
  const dots = [[24, 40], [70, 38], [78, 52], [22, 74], [64, 79], [44, 37], [80, 72], [30, 52]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join('');
  return `${GROUND}<rect x="15" y="33" width="70" height="51" rx="11" fill="#EBCB82"${stroke(line, '#B8944C')}/>
    <rect x="15" y="73" width="70" height="11" rx="6" fill="#DDB766"/>
    <rect x="21" y="36" width="58" height="6" rx="3" fill="#F6E2AE" opacity=".8"/>
    <g fill="#C49A4C" opacity=".75">${dots}</g>
    ${F(1)}`;
}

// 꿀떡: 작은 공, 반짝임 (분홍)
function kkultteok(F, line) {
  return `${GROUND}<circle cx="50" cy="55" r="30" fill="#F4B6C4"${stroke(line, '#D58A9E')}/>
    <path d="M80 55 A30 30 0 0 1 22 66 C38 78 66 76 78 62 C79 60 80 58 80 55Z" fill="#E89AAE"/>
    <ellipse cx="37" cy="38" rx="9" ry="5" fill="#fff" opacity=".65" transform="rotate(-30 37 38)"/>
    <path d="M70 31 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6Z" fill="#fff" opacity=".9"/>
    ${F(0)}`;
}

// 무지개떡: 층층 네모(파스텔 줄무늬). 얼굴은 가운데 크림 층에. clipPath를 쓰지 않는다(한 화면에 여러 장 — id 충돌·숨은 그림 참조 문제)
function mujigae(F, line) {
  return `${GROUND}<path d="M14 41 V40 a10 10 0 0 1 10 -10 H76 a10 10 0 0 1 10 10 V41Z" fill="#F2BFCB"/>
    <rect x="14" y="41" width="72" height="8" fill="#F3DE9C"/><rect x="14" y="49" width="72" height="26" fill="#FBF5EA"/>
    <path d="M14 75 H86 V74 a10 10 0 0 1 -10 10 H24 a10 10 0 0 1 -10 -10Z" fill="#BFD9AE"/>
    <rect x="14" y="30" width="72" height="54" rx="10" fill="none"${stroke(line, '#C2AE9C')}/>
    ${F(1)}`;
}

// 절편: 넓고 납작한 둥근 사각 + 위쪽 꽃무늬 도장 3개 (흰 떡 — 찹쌀떡과는 각진 모양으로 구분)
function jeolpyeon(F, line) {
  const flower = (cx) => [0, 72, 144, 216, 288].map((a) =>
    `<ellipse cx="${cx}" cy="45" rx="2" ry="3.4" transform="rotate(${a} ${cx} 47.6) translate(0 -1)"/>`).join('');
  return `${GROUND}<rect x="9" y="38" width="82" height="45" rx="15" fill="#F8F4EB"${stroke(line, '#C9BBA6')}/>
    <path d="M9 70 C10 80 18 83 24 83 L76 83 C82 83 90 80 91 70 C86 76 80 77 74 77 L26 77 C20 77 14 76 9 70Z" fill="#E7DFCF"/>
    <g fill="none" stroke="#C8DBB0" stroke-width="1.3">${flower(30)}${flower(50)}${flower(70)}</g>
    <g fill="#B5CE98">${[30, 50, 70].map((x) => `<circle cx="${x}" cy="47" r="1.5"/>`).join('')}</g>
    ${F(4)}`;
}

// 가래떡: 세로로 선 짧은 원기둥 + 위에 썬 단면 (키 큰 실루엣)
function garaetteok(F, line) {
  return `${GROUND}<path d="M27 30 L27 78 C27 84 73 84 73 78 L73 30Z" fill="#F7F4EE"${stroke(line, '#C7BFB2')}/>
    <path d="M62 31 L62 82 C68 81 73 80 73 78 L73 30Z" fill="#E9E3D8"/>
    <ellipse cx="50" cy="30" rx="23" ry="7.5" fill="#FFFFFF"${stroke(line, '#C7BFB2')}/>
    <ellipse cx="50" cy="30" rx="15" ry="4.2" fill="#F1ECE2"/>
    ${shine(34, 46, 3, 9, 0, 0.7)}
    ${F(1)}`;
}

// 시루떡: 납작 네모 + 위아래 팥고물 층 (흰 쌀 층에 얼굴)
function sirutteok(F, line) {
  const crumbs = (y) => [14, 24, 33, 43, 52, 61, 70, 80].map((x, i) =>
    `<circle cx="${x + (i % 2) * 2}" cy="${y + (i % 3)}" r="1.6"/>`).join('');
  const bumpy = 'M10 46 L10 40 Q14 35 18 39 Q22 34 27 38 Q32 33 37 38 Q42 34 47 38 Q52 33 57 38 Q62 34 67 38 Q72 33 77 38 Q82 34 86 39 Q90 36 90 41 L90 46Z';
  return `${GROUND}<rect x="10" y="44" width="80" height="40" rx="6" fill="#FBF7EF"${stroke(line, '#B9A08F')}/>
    <path d="${bumpy}" fill="#9C5E4C"${stroke(line, '#7A4436')}/>
    <path d="M10 74 L90 74 L90 79 Q90 84 85 84 L15 84 Q10 84 10 79Z" fill="#9C5E4C"/>
    <g fill="#6E3A2E" opacity=".7">${crumbs(40)}${crumbs(78)}</g>
    ${F(1)}`;
}

// 쑥개떡: 손바닥으로 누른 납작한 타원 + 손가락 자국 (잎맥 없음 — 나뭇잎처럼 보이지 않게)
function ssukgaetteok(F, line) {
  return `${GROUND}<path d="M8 62 C8 44 30 36 50 36 C70 36 92 44 92 62 C92 78 72 84 50 84 C28 84 8 78 8 62Z" fill="#93AF7C"${stroke(line, '#65804F')}/>
    <path d="M92 62 C92 78 72 84 50 84 C28 84 8 78 8 62 C16 74 34 78 50 78 C66 78 84 74 92 62Z" fill="#7F9C69"/>
    <g fill="none" stroke="#7F9C69" stroke-width="2.4" stroke-linecap="round">
      <path d="M70 41 q6 4 9 11"/><path d="M76 42 q6 4 8 10"/><path d="M64 41 q6 4 9 11"/></g>
    ${shine(28, 46, 8, 3.5, -12, 0.35)}
    ${F(2)}`;
}

// 화전: 납작한 원반 + 위에 진달래 꽃잎과 작은 잎
function hwajeon(F, line) {
  const petals = [-60, -20, 20, 60, 180].map((a) =>
    `<ellipse cx="50" cy="31" rx="5.2" ry="8" transform="rotate(${a} 50 38)"/>`).join('');
  return `${GROUND}<ellipse cx="50" cy="62" rx="41" ry="22" fill="#FBF6F0"${stroke(line, '#CDB9B1')}/>
    <path d="M9 62 C10 76 28 84 50 84 C72 84 90 76 91 62 C84 74 68 78 50 78 C32 78 16 74 9 62Z" fill="#EEE2D9"/>
    <path d="M60 41 q9 -7 16 -2 q-6 6 -16 2Z" fill="#9DBB84"/>
    <g fill="#E98FB0">${petals}</g><circle cx="50" cy="38" r="2.6" fill="#F7D774"/>
    ${F(3)}`;
}

// 약식: 위 면이 보이는 비스듬한 덩어리 + 밤·대추·잣이 박힘 (인절미 네모와 실루엣이 다르게, 캐러멜 갈색은 얼굴이 묻히지 않게 밝게)
function yaksik(F, line) {
  const bits = [['#F1D79A', 30, 34, 5, 2.6], ['#9A3430', 60, 31, 4, 2.2], ['#FFF3DA', 46, 37, 2.2, 1.2],
    ['#F1D79A', 76, 72, 3.4, 4.2], ['#9A3430', 21, 76, 3.2, 2.8], ['#FFF3DA', 62, 80, 2.2, 1.4]]
    .map(([c, x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join('');
  return `${GROUND}<path d="M14 44 L30 26 L86 26 L86 70 L72 84 L14 84Z" fill="#C68F5E" stroke-linejoin="round"${stroke(line, '#8A5A34')}/>
    <path d="M14 44 L30 26 L86 26 L72 44Z" fill="#D9A673"/>
    <path d="M72 44 L86 26 L86 70 L72 84Z" fill="#A9744A"/>
    ${bits}${F(4, -7)}`;
}

// 개성주악: 도톰한 원반 + 위 가운데 오목한 구멍 + 대추 고명, 꿀 윤기
function juak(F, line) {
  return `${GROUND}<ellipse cx="50" cy="58" rx="38" ry="27" fill="#DCA25A"${stroke(line, '#A66F2E')}/>
    <path d="M12 58 C12 74 30 85 50 85 C70 85 88 74 88 58 C82 72 68 79 50 79 C32 79 18 72 12 58Z" fill="#C5873F"/>
    <ellipse cx="50" cy="38" rx="9" ry="4.6" fill="#A66F2E"/><ellipse cx="50" cy="39.5" rx="6" ry="2.6" fill="#8C5A24"/>
    <g fill="#B5373A">${[0, 90, 180, 270].map((r) => `<ellipse cx="50" cy="26" rx="3" ry="4.4" transform="rotate(${r} 50 30.5)"/>`).join('')}</g>
    <circle cx="50" cy="30.5" r="1.8" fill="#F1D79A"/>
    ${shine(28, 48, 7, 3.4, -30, 0.55)}${F(3)}`;
}

// 오메기떡: 오톨도톨한 팥고물 공 + 차조 노란 점 (꿀떡의 매끈한 공과 질감으로 구분)
function omegi(F, line) {
  // 오톨도톨: 테두리 있는 작은 공 12개를 두르고 가운데 공으로 안쪽 선을 덮는다
  const bumps = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<circle cx="${(50 + 24 * Math.cos(a)).toFixed(1)}" cy="${(56 + 23 * Math.sin(a)).toFixed(1)}" r="7.5"/>`;
  }).join('');
  const dots = [[30, 40], [66, 36], [76, 54], [24, 60], [42, 80], [70, 74], [50, 32], [58, 80]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('');
  return `${GROUND}<g fill="#B07C6C"${stroke(line, '#7A4C40')}>${bumps}</g><circle cx="50" cy="56" r="25" fill="#B07C6C"/>
    <g fill="#8E5C4E">${[[38, 46], [62, 44], [72, 66], [28, 70], [54, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>
    <g fill="#F0CF5E">${dots}</g>${F(0)}`;
}

// 도감 순서 = 열리는 순서 (js/progress.js UNLOCK_AT)
const BODIES = { mochi, songpyeon, injeolmi, kkultteok, mujigae, jeolpyeon, garaetteok, sirutteok, ssukgaetteok, hwajeon, yaksik, juak, omegi };
export const KINDS = Object.keys(BODIES);

// F: (dy, dx) => 얼굴 SVG. line: 테두리 색(연한 바탕에서 흰 떡이 묻히지 않게, 없으면 테두리 없음)
export const body = (kind, F, line = '') => BODIES[kind](F, line);

// 표정 하나로 그린다. face: smile | oing | happy | yawn | sleepy
export function tteok(kind, { face: f = 'smile', line = '' } = {}) {
  return body(kind, (dy, dx) => face(f, dy, dx), line);
}

// 얼굴 대비 검사용 — 눈·입 아래 깔리는 몸통 색
export const FACE_BG = { mochi: '#FCF1EF', songpyeon: '#C3DB9E', injeolmi: '#EBCB82', kkultteok: '#F4B6C4', mujigae: '#FBF5EA',
  jeolpyeon: '#F8F4EB', garaetteok: '#F7F4EE', sirutteok: '#FBF7EF', ssukgaetteok: '#93AF7C', hwajeon: '#FBF6F0',
  yaksik: '#C68F5E', juak: '#DCA25A', omegi: '#B07C6C' };
export const NAMES = { mochi: '찹쌀떡', songpyeon: '송편', injeolmi: '인절미', kkultteok: '꿀떡', mujigae: '무지개떡',
  jeolpyeon: '절편', garaetteok: '가래떡', sirutteok: '시루떡', ssukgaetteok: '쑥개떡', hwajeon: '화전',
  yaksik: '약식', juak: '개성주악', omegi: '오메기떡' };
