import { makeRng, pick, shuffle } from './rng.js?v=20261124100927';
import { findSolutions } from './solver.js?v=20261124100927';

const MAX_ATTEMPTS = 2000;
// 1칸짜리 구역은 답이 바로 보여 퍼즐이 쉬워지므로 한 개까지만 허용한다.
const MAX_SINGLE_REGIONS = 1;
// 한 구역이 판을 뒤덮으면 나머지 구역이 답을 거의 정해 버리므로 가장 큰 구역의 크기를 제한한다.
const MAX_REGION_RATIO = 2.4;
const MAX_REPAIRS = 400;

export function neighbors(i, n) {
  const r = Math.floor(i / n);
  const c = i % n;
  const out = [];
  if (r > 0) out.push(i - n);
  if (r < n - 1) out.push(i + n);
  if (c > 0) out.push(i - 1);
  if (c < n - 1) out.push(i + 1);
  return out;
}

function randomSolution(n, rng) {
  const cols = new Array(n).fill(-1);
  const used = new Array(n).fill(false);
  const place = (row) => {
    if (row === n) return true;
    for (const c of shuffle([...Array(n).keys()], rng)) {
      if (used[c] || (row > 0 && Math.abs(cols[row - 1] - c) <= 1)) continue;
      used[c] = true;
      cols[row] = c;
      if (place(row + 1)) return true;
      used[c] = false;
    }
    return false;
  };
  return place(0) ? cols : null;
}

// 정답 칸을 씨앗으로 구역을 넓힌다. 구역마다 넓어지는 속도를 달리해 크기가 고르지 않게 한다.
function growRegions(n, solution, rng) {
  const regions = new Array(n * n).fill(-1);
  solution.forEach((c, r) => { regions[r * n + c] = r; });
  const appetite = solution.map(() => 0.3 + rng());
  for (let open = n * n - n; open > 0; open--) {
    const options = [];
    let total = 0;
    for (let i = 0; i < n * n; i++) {
      if (regions[i] !== -1) continue;
      for (const j of neighbors(i, n)) {
        if (regions[j] === -1) continue;
        total += appetite[regions[j]];
        options.push([i, regions[j], total]);
      }
    }
    const roll = rng() * total;
    const [cell, owner] = options.find((o) => o[2] >= roll) || options[options.length - 1];
    regions[cell] = owner;
  }
  return regions;
}

function staysConnected(regions, n, region, removed) {
  const cells = [];
  for (let i = 0; i < n * n; i++) if (regions[i] === region && i !== removed) cells.push(i);
  const seen = new Set([cells[0]]);
  const queue = [cells[0]];
  while (queue.length) {
    for (const j of neighbors(queue.pop(), n)) {
      if (j === removed || regions[j] !== region || seen.has(j)) continue;
      seen.add(j);
      queue.push(j);
    }
  }
  return seen.size === cells.length;
}

// 다른 해가 쓰는 칸 하나를 옆 구역으로 넘겨 그 해를 무효로 만든다 (원래 정답 칸은 건드리지 않는다).
function breakAlternative(n, regions, solution, alt, rng) {
  const targets = [];
  alt.forEach((c, r) => { if (c !== solution[r]) targets.push(r * n + c); });
  for (const cell of shuffle(targets, rng)) {
    const own = regions[cell];
    const others = [...new Set(neighbors(cell, n).map((j) => regions[j]).filter((g) => g !== own))];
    if (!others.length || !staysConnected(regions, n, own, cell)) continue;
    regions[cell] = pick(others, rng);
    return true;
  }
  return false;
}

function makeUnique(n, regions, solution, rng) {
  for (let step = 0; step < MAX_REPAIRS; step++) {
    const alt = findSolutions(n, regions, 2).find((s) => s.some((c, r) => c !== solution[r]));
    if (!alt) return true;
    if (!breakAlternative(n, regions, solution, alt, rng)) return false;
  }
  return false;
}

// 구역 번호가 정답의 행 번호와 같으면 색만 보고 정답 줄을 알 수 있으므로 번호를 섞는다.
function relabel(regions, n, rng) {
  const map = shuffle([...Array(n).keys()], rng);
  return regions.map((g) => map[g]);
}

function wellShaped(regions, n) {
  const sizes = new Array(n).fill(0);
  regions.forEach((g) => { sizes[g] += 1; });
  const singles = sizes.filter((size) => size === 1).length;
  return singles <= MAX_SINGLE_REGIONS && Math.max(...sizes) <= n * MAX_REGION_RATIO;
}

export function generatePuzzle(n, seed) {
  const rng = makeRng(seed);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const solution = randomSolution(n, rng);
    if (!solution) continue;
    const regions = growRegions(n, solution, rng);
    if (!makeUnique(n, regions, solution, rng)) continue;
    if (!wellShaped(regions, n)) continue;
    return { n, regions: relabel(regions, n, rng), solution };
  }
  throw new Error(`퍼즐을 만들지 못했습니다 (크기 ${n}, 시드 ${seed})`);
}
