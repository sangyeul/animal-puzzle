// 처음 화면의 그림 부분: 레벨 길, 스탬프, 도감, 별
import { KINDS, KIND_KEYS, characterSvg, kindAt } from './characters.js?v=20261117212916';
import { unlockLevel, unlockedCount, weekStamps } from './progress.js?v=20261117212916';

export function starsHtml(count, total = 3) {
  const stars = Array.from({ length: total }, (_, k) => `<i class="${k < count ? 'on' : ''}">★</i>`).join('');
  return `<span class="stars" role="img" aria-label="별 ${count}개">${stars}</span>`;
}

// 지금까지 푼 퍼즐과 다음에 풀 퍼즐을 한 줄로 그린다. 퍼즐은 무작위라 지나온 것을 다시 풀 수는 없다.
export function renderPath(el, store, onStart) {
  const friends = unlockedCount(store.level);
  const nodes = [];
  for (let level = Math.max(1, store.level - 20); level <= store.level + 3; level++) {
    const state = level < store.level ? 'done' : level === store.level ? 'now' : 'next';
    const node = document.createElement(state === 'now' ? 'button' : 'div');
    node.className = `node ${state}`;
    if (state === 'done') {
      node.setAttribute('aria-label', `퍼즐 ${level}, 별 ${store.stars[level] ?? 0}개`);
      node.innerHTML = `<b>${level}</b>${starsHtml(store.stars[level] ?? 0)}`;
    } else if (state === 'now') {
      node.setAttribute('aria-label', `퍼즐 ${level} 시작`);
      node.innerHTML = `<span class="rider">${characterSvg(kindAt('cat', friends - 1, friends))}</span><b>${level}</b>`;
      node.addEventListener('click', onStart);
    } else {
      node.setAttribute('aria-hidden', 'true');
      node.innerHTML = '<b>?</b>';
    }
    nodes.push(node);
  }
  el.replaceChildren(...nodes);
  const now = el.querySelector('.now');
  el.scrollLeft = now.offsetLeft - (el.clientWidth - now.offsetWidth) / 2;
}

export function renderStamps(el, store) {
  const friends = unlockedCount(store.level);
  el.innerHTML = weekStamps(store.daily.times).map((stamp, k) => `
    <div class="stamp${stamp.done ? ' done' : ''}${stamp.isToday ? ' today' : ''}">
      <span>${stamp.day}</span>
      <div>${stamp.done ? characterSvg(kindAt('cat', k, friends), 'happy') : stamp.date}</div>
    </div>`).join('');
}

export function renderDex(el, store) {
  const friends = unlockedCount(store.level);
  el.replaceChildren(...KIND_KEYS.map((kind, index) => {
    const open = index < friends;
    const card = document.createElement('button');
    card.className = `friend${open ? '' : ' locked'}`;
    card.disabled = !open;
    card.innerHTML = `${characterSvg(kind)}<b>${open ? KINDS[kind].name : '?'}</b>`
      + `<small>${open ? '' : `퍼즐 ${unlockLevel(index)}개 풀기`}</small>`;
    // 누르면 잠깐 웃으며 뛴다.
    card.addEventListener('click', () => {
      card.classList.add('cheer');
      setTimeout(() => card.classList.remove('cheer'), 900);
    });
    return card;
  }));
}
