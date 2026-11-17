// 행마다 한 마리씩 놓아 보며 해를 limit개까지 찾는다.
// 대각선 맞닿음은 바로 윗줄과만 생기므로 윗줄 열과의 차이만 보면 된다.
export function findSolutions(n, regions, limit = 2) {
  const found = [];
  const cols = new Array(n).fill(-1);
  const walk = (row, usedCols, usedRegions) => {
    if (found.length >= limit) return;
    if (row === n) {
      found.push(cols.slice());
      return;
    }
    for (let c = 0; c < n; c++) {
      if (usedCols & (1 << c)) continue;
      if (row > 0 && Math.abs(cols[row - 1] - c) <= 1) continue;
      const region = regions[row * n + c];
      if (usedRegions & (1 << region)) continue;
      cols[row] = c;
      walk(row + 1, usedCols | (1 << c), usedRegions | (1 << region));
    }
    cols[row] = -1;
  };
  walk(0, 0, 0);
  return found;
}
