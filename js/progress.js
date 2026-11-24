// 별·도감·스탬프 계산. 저장된 값(레벨, 푼 날짜)에서 매번 계산하므로 따로 저장할 것이 없다.
import { KIND_KEYS } from './characters.js?v=20261124100927';

// 판 크기별 별 기준 시간(초). 이 안에 풀면 시간 별을 받는다.
export const PAR = { 5: 90, 6: 150, 7: 240, 8: 360, 9: 540 };

// 풀면 별 1개, 실수와 힌트가 없으면 +1, 기준 시간 안이면 +1
export function starsFor(n, elapsed, hints, mistakes = 0) {
  return 1 + (hints === 0 && mistakes === 0 ? 1 : 0) + (elapsed <= PAR[n] ? 1 : 0);
}

// 다음 퍼즐의 판 크기를 무작위로 고른다. 처음 두 판만은 작은 판으로 시작한다.
export function pickSize(level, random = Math.random) {
  const sizes = level <= 2 ? [5, 6] : [5, 6, 7, 8, 9];
  return sizes[Math.floor(random() * sizes.length)];
}

// 떡 친구가 열리는 시점: 그 수만큼 퍼즐을 풀면 열린다 (KIND_KEYS 순서)
const UNLOCK_AT = [0, 0, 0, 2, 4, 6, 9, 12, 16, 20, 25, 30, 35];

// level은 지금 풀 차례인 레벨 번호. 깬 레벨 수는 level - 1이다.
export function unlockedCount(level) {
  return UNLOCK_AT.filter((need) => need <= level - 1).length;
}

export function unlockLevel(index) {
  return UNLOCK_AT[index];
}

// 레벨이 올라가며 새로 열린 친구 (없으면 null)
export function newFriend(levelBefore, levelAfter) {
  const before = unlockedCount(levelBefore), after = unlockedCount(levelAfter);
  return after > before ? KIND_KEYS[after - 1] : null;
}

const pad = (v) => String(v).padStart(2, '0');
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 오늘까지 7일의 스탬프 칸
export function weekStamps(times, today = new Date()) {
  return Array.from({ length: 7 }, (_, k) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - k));
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return { key, day: DAYS[date.getDay()], date: date.getDate(), done: times[key] !== undefined, isToday: k === 6 };
  });
}
