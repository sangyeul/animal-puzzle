// 화면 위에 잠깐 떴다 사라지는 조각 효과 (별 조각, 색종이). 게임 상태와 무관하다.
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const COLORS = ['#F7B9B0', '#F9D58B', '#BFE3A1', '#A9DCE3', '#B9C6F2', '#E0B8EC', '#DDB660'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function layer() {
  let el = document.getElementById('fx');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fx';
    el.setAttribute('aria-hidden', 'true');
    document.body.append(el);
  }
  return el;
}

function piece(className, x, y) {
  const el = document.createElement('i');
  el.className = className;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.background = pick(COLORS);
  layer().append(el);
  return el;
}

// 칸 가운데에서 별 조각이 사방으로 튄다.
export function burst(target, count = 8) {
  if (calm.matches || !target) return;
  const box = target.getBoundingClientRect();
  const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  for (let k = 0; k < count; k++) {
    const angle = ((k + Math.random() * .6) / count) * Math.PI * 2;
    const reach = box.width * (.7 + Math.random() * .5);
    const dx = Math.cos(angle) * reach, dy = Math.sin(angle) * reach;
    const el = piece('spark', cx, cy);
    el.animate([
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(90deg)`, opacity: 1, offset: .6 },
      { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy * 1.15 + 8}px)) scale(.2) rotate(140deg)`, opacity: 0 },
    ], { duration: 560, easing: 'cubic-bezier(.2, .8, .3, 1)' }).onfinish = () => el.remove();
  }
}

// 화면 위에서 색종이가 떨어진다.
export function confetti(count = 48) {
  if (calm.matches) return;
  const width = innerWidth, height = innerHeight;
  for (let k = 0; k < count; k++) {
    const el = piece('confetti', Math.random() * width, -20);
    const drift = (Math.random() - .5) * 160;
    const spin = (Math.random() - .5) * 1080;
    el.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${drift}px, ${height + 60}px) rotate(${spin}deg)`, opacity: 1 },
    ], { duration: 1700 + Math.random() * 1300, delay: Math.random() * 500, easing: 'cubic-bezier(.3, .2, .6, 1)', fill: 'backwards' })
      .onfinish = () => el.remove();
  }
}
