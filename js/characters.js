// 직접 그린 동물 캐릭터 (말랑 찹쌀떡 그림체). 문자열만 만들므로 DOM 없이 테스트한다.
// 한 SVG 안에 표정 세 벌(평소·당황·기쁨)을 모두 넣고, 어느 것을 보일지는 CSS가 고른다.
const INK = '#2B2A33';
const CREAM = '#FFF6EA';

export const KINDS = {
  cat: { name: '고양이', c: '#F6B26B', sub: '#FFE3C2', ears: 'point' },
  bear: { name: '곰', c: '#B98A62', sub: '#E9CDB0', ears: 'round', muzzle: true },
  rabbit: { name: '토끼', c: '#FBEFF0', sub: '#F7B3C0', ears: 'long', nose: '#E9839A' },
  frog: { name: '개구리', c: '#8FCB6B', sub: '#FFFFFF', ears: 'bump', face: 'frog' },
  chick: { name: '병아리', c: '#FFD95A', sub: '#F59A3A', ears: 'tuft', face: 'beak' },
  pig: { name: '돼지', c: '#F7A9B8', sub: '#E9839A', ears: 'fold', face: 'snout' },
  fox: { name: '여우', c: '#EE8A4A', sub: '#5A3A2E', ears: 'point', patch: ['chin'] },
  panda: { name: '판다', c: '#FAFAF7', sub: '#55535E', ears: 'round', earColor: INK, patch: ['eyes'], eye: '#FFFFFF' },
  koala: { name: '코알라', c: '#B5B8C4', sub: '#E6E7EE', ears: 'big', bigNose: true },
  penguin: { name: '펭귄', c: '#5B6B9A', sub: '#F59A3A', ears: 'none', face: 'beak', patch: ['face'] },
  tiger: { name: '호랑이', c: '#F5A742', sub: '#FFE3C2', ears: 'round', patch: ['chin', 'stripes'] },
  dog: { name: '강아지', c: '#EBD0AC', sub: '#A9764F', ears: 'flop', patch: ['spot'] },
};
export const KIND_KEYS = Object.keys(KINDS);

// 판의 주인공(lead)에서 시작해 줄마다 다음 동물이 나온다.
// count를 주면 도감에서 열린 앞쪽 count종 안에서만 돈다.
export function kindAt(lead, offset, count = KIND_KEYS.length) {
  const start = Math.max(0, KIND_KEYS.indexOf(lead));
  return KIND_KEYS[(start + offset) % count];
}

// 왼쪽 모양 하나를 받아 좌우 한 쌍으로 만든다. side: 1 = 왼쪽, -1 = 오른쪽
const pair = (make) => make(1) + make(-1);
const mx = (x, side) => 50 + side * (x - 50);
const soft = (color) => `fill="${color}" stroke="${color}" stroke-width="3" stroke-linejoin="round"`;

const EARS = {
  none: () => '',
  point: (a) => pair((s) => `<path d="M${mx(16, s)} 42 L${mx(21, s)} 9 L${mx(47, s)} 27 Z" ${soft(a.c)}/>`
    + `<path d="M${mx(24, s)} 31 L${mx(26, s)} 19 L${mx(37, s)} 26 Z" ${soft(a.sub)}/>`),
  fold: (a) => pair((s) => `<path d="M${mx(17, s)} 40 L${mx(18, s)} 16 L${mx(43, s)} 26 Z" ${soft(a.sub)}/>`),
  round: (a) => pair((s) => `<circle cx="${mx(22, s)}" cy="30" r="13" fill="${a.earColor ?? a.c}"/>`
    + `<circle cx="${mx(22, s)}" cy="30" r="6" fill="${a.sub}"/>`),
  big: (a) => pair((s) => `<circle cx="${mx(15, s)}" cy="40" r="16" fill="${a.c}"/>`
    + `<circle cx="${mx(15, s)}" cy="40" r="9" fill="${a.sub}"/>`),
  long: (a) => pair((s) => `<ellipse cx="${mx(34, s)}" cy="22" rx="9.5" ry="20" fill="${a.c}"/>`
    + `<ellipse cx="${mx(34, s)}" cy="22" rx="4" ry="12" fill="${a.sub}"/>`),
  bump: (a) => pair((s) => `<circle cx="${mx(30, s)}" cy="31" r="15" fill="${a.c}"/>`
    + `<circle cx="${mx(30, s)}" cy="31" r="9.5" fill="${a.sub}"/>`),
  tuft: (a) => `<path d="M50 28 Q36 14 46 6 Q50 12 54 8 Q62 6 60 14 Q58 22 50 28 Z" fill="${a.c}"/>`,
  // 늘어진 귀는 얼굴 위에 덮어 그려야 해서 FRONT에서 그린다.
  flop: () => '',
};

const FRONT = {
  flop: (a) => pair((s) => `<ellipse cx="${mx(12, s)}" cy="56" rx="9" ry="19" `
    + `transform="rotate(${s * 12} ${mx(12, s)} 56)" fill="${a.sub}"/>`),
};

const PATCH = {
  chin: () => `<ellipse cx="50" cy="77" rx="22" ry="12" fill="${CREAM}"/>`,
  face: () => '<ellipse cx="50" cy="68" rx="32" ry="24" fill="#FFFFFF"/>',
  eyes: () => pair((s) => `<ellipse cx="${mx(32, s)}" cy="58" rx="8.5" ry="10" `
    + `transform="rotate(${s * 18} ${mx(32, s)} 58)" fill="${INK}"/>`),
  stripes: () => '<path d="M50 30 v8 M39 32 l1.5 7 M61 32 l-1.5 7" fill="none" stroke="#8A5524" stroke-width="4" stroke-linecap="round"/>',
  spot: (a) => `<ellipse cx="32" cy="57" rx="11" ry="12" fill="${a.sub}"/>`,
};

const HEAD = (a) => `<ellipse cx="50" cy="60" rx="43" ry="34" fill="${a.c}"/>`;
const CHEEKS = pair((s) => `<ellipse cx="${mx(21, s)}" cy="71" rx="6" ry="4" fill="#FF7F96" opacity=".5"/>`);
const SWEAT = '<path d="M88 26 Q94 36 88 39 Q82 36 88 26 Z" fill="#7CC6F2"/>';

const line = (d, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const open = (d) => `<path d="${d}" fill="#E5566B" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;

function eyes(a, mood) {
  const onBump = a.face === 'frog';
  const y = onBump ? 31 : 58;
  const gap = onBump ? 20 : 18;
  const color = a.eye ?? INK;
  const drawn = pair((s) => {
    const cx = 50 - s * gap;
    if (mood === 'happy') return line(`M${cx - 6} ${y + 2} Q${cx} ${y - 8} ${cx + 6} ${y + 2}`, color).replace('2.6', '3.4');
    if (mood !== 'worry') return `<circle cx="${cx}" cy="${y}" r="3.8" fill="${color}"/>`;
    const brow = onBump ? '' : line(`M${cx - s * 7} ${y - 10} L${cx + s * 5} ${y - 14}`, color);
    return `<circle cx="${cx}" cy="${y}" r="3" fill="${color}"/>${brow}`;
  });
  return `<g class="eyes">${drawn}</g>`;
}

const MOUTH = {
  frog: (a, mood) => {
    if (mood === 'happy') return open('M33 66 Q50 86 67 66 Z');
    return line(mood === 'worry' ? 'M37 73 Q50 66 63 73' : 'M33 67 Q50 78 67 67');
  },
  beak: (a, mood) => `<path d="M43 64 L57 64 L50 ${mood === 'happy' ? 77 : 73} Z" ${soft(a.sub).replace('"3"', '"2"')}/>`,
  snout: (a, mood) => {
    const snout = `<ellipse cx="50" cy="69" rx="13" ry="9" fill="${a.sub}"/>`
      + `<circle cx="45.5" cy="69" r="2.2" fill="${INK}"/><circle cx="54.5" cy="69" r="2.2" fill="${INK}"/>`;
    if (mood === 'happy') return snout + line('M43 82 Q50 89 57 82');
    return snout + (mood === 'worry' ? line('M45 85 Q50 81 55 85') : '');
  },
  plain: (a, mood) => {
    const drop = a.bigNose ? 6 : 0;
    const muzzle = a.muzzle ? `<ellipse cx="50" cy="71" rx="14" ry="10.5" fill="${a.sub}"/>` : '';
    const nose = a.bigNose
      ? `<ellipse cx="50" cy="66" rx="5.5" ry="7" fill="${INK}"/>`
      : `<ellipse cx="50" cy="65.5" rx="3.2" ry="2.3" fill="${a.nose ?? INK}"/>`;
    if (mood === 'happy') return muzzle + open(`M43 ${70 + drop} Q50 ${83 + drop} 57 ${70 + drop} Z`) + nose;
    if (mood === 'worry') return muzzle + nose + line(`M43 ${75 + drop} q3.5 -4 7 0 q3.5 -4 7 0`);
    return muzzle + nose + line(`M43 ${70 + drop} q3.5 4.5 7 0 q3.5 4.5 7 0`);
  },
};

function face(a, mood) {
  const mouth = MOUTH[a.face ?? 'plain'](a, mood);
  return `<g class="f-${mood}">${eyes(a, mood)}${mouth}${mood === 'worry' ? SWEAT : ''}</g>`;
}

// mood를 주면 그 표정으로 고정한다(완료 창 등). 비우면 놓인 칸의 상태를 따른다.
export function characterSvg(kind, mood = '') {
  const a = KINDS[kind] ?? KINDS.cat;
  const patches = (a.patch ?? []).map((name) => PATCH[name](a)).join('');
  const front = FRONT[a.ears]?.(a) ?? '';
  const faces = ['idle', 'worry', 'happy'].map((m) => face(a, m)).join('');
  return `<svg class="ch${mood ? ` is-${mood}` : ''}" viewBox="0 0 100 100" aria-hidden="true">`
    + `${EARS[a.ears](a)}${HEAD(a)}${patches}${front}${CHEEKS}${faces}</svg>`;
}
