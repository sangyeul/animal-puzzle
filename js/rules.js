export const EMPTY = 0;
export const MARK = 1;
export const ANIMAL = 2;
export const WRONG = 3; // 동물이 있다고 했지만 틀린 칸 (빨간 ✕, 지울 수 없음)

function clashes(a, b, n, regions) {
  const ra = Math.floor(a / n), ca = a % n;
  const rb = Math.floor(b / n), cb = b % n;
  if (ra === rb || ca === cb || regions[a] === regions[b]) return true;
  return Math.abs(ra - rb) <= 1 && Math.abs(ca - cb) <= 1;
}

function animalCells(cells) {
  const out = [];
  cells.forEach((v, i) => { if (v === ANIMAL) out.push(i); });
  return out;
}

// 규칙을 어긴 동물 칸들
export function conflictSet(n, regions, cells) {
  const animals = animalCells(cells);
  const bad = new Set();
  for (let x = 0; x < animals.length; x++) {
    for (let y = x + 1; y < animals.length; y++) {
      if (clashes(animals[x], animals[y], n, regions)) {
        bad.add(animals[x]);
        bad.add(animals[y]);
      }
    }
  }
  return bad;
}

export function isSolved(n, regions, cells) {
  return animalCells(cells).length === n && conflictSet(n, regions, cells).size === 0;
}
