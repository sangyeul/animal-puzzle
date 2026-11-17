const KEY = 'animal-puzzle:v1';

const DEFAULTS = {
  settings: { showTimer: true, sound: true, vibrate: true },
  level: 1,
  daily: { lastDate: null, streak: 0, times: {} },
  best: {},
  stars: {},
  seenHow: false,
  next: null,
  saved: null,
};

let cache = null;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...DEFAULTS,
      ...raw,
      settings: { ...DEFAULTS.settings, ...raw.settings },
      daily: { ...DEFAULTS.daily, ...raw.daily },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function data() {
  if (!cache) cache = read();
  return cache;
}

// 사생활 보호 모드처럼 저장이 막힌 환경에서도 게임은 계속되어야 한다.
export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data()));
  } catch { /* 저장 불가 환경 */ }
}

export function todayKey(date = new Date()) {
  const pad = (v) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayBefore(key) {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d - 1));
}

export function recordDaily(dateKey, seconds) {
  const daily = data().daily;
  // 지난 날짜 판을 뒤늦게 마쳐도 이미 쌓인 연속 일수는 건드리지 않는다.
  const isLater = !daily.lastDate || dateKey > daily.lastDate;
  if (daily.times[dateKey] === undefined && isLater) {
    daily.streak = daily.lastDate === dayBefore(dateKey) ? daily.streak + 1 : 1;
    daily.lastDate = dateKey;
  }
  daily.times[dateKey] = Math.min(seconds, daily.times[dateKey] ?? Infinity);
}

// 어제도 오늘도 풀지 않았으면 연속 기록은 끊긴 것이다.
export function currentStreak() {
  const { lastDate, streak } = data().daily;
  const today = todayKey();
  return lastDate === today || lastDate === dayBefore(today) ? streak : 0;
}

// 레벨마다 가장 많이 받은 별 수를 남긴다.
export function recordStars(level, count) {
  const stars = data().stars;
  stars[level] = Math.max(count, stars[level] ?? 0);
}

export function totalStars() {
  return Object.values(data().stars).reduce((sum, count) => sum + count, 0);
}

export function recordBest(n, seconds) {
  const best = data().best;
  const isNew = best[n] === undefined || seconds < best[n];
  if (isNew) best[n] = seconds;
  return isNew;
}
