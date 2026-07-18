// ── 部位強壯度引擎 ──────────────────────────────────────────────────────────
//
// 設計原則（與 XP 相同）：所有分數皆為純函數——由「全部訓練紀錄 + 體重紀錄 +
// 休養區間 + 今天日期」推導，不儲存累計值；編輯/刪除紀錄自動修正。
//
// 依賴（瀏覽器）：window.EXERCISE_INDEX（js/exercise-index.js，資料集精簡索引）
//               window.EXERCISE_MAP（js/exercise-map.js，中文名 → 資料集 id）
// Node 測試時由參數注入，不讀全域。

(function () {
'use strict';

// ── 肌肉 → 七部位 ──────────────────────────────────────────────────────────
// 資料集 target / secondary_muscles 詞彙 → App 的七部位。
// 查無對應（如 cardiovascular system）回傳 null，不計分。
const MUSCLE_TO_PART = {
  pectorals: 'chest', chest: 'chest', 'serratus anterior': 'chest',
  lats: 'back', 'latissimus dorsi': 'back', 'upper back': 'back', 'middle back': 'back',
  'lower back': 'back', rhomboids: 'back', spine: 'back',
  delts: 'shoulders', deltoids: 'shoulders', shoulders: 'shoulders',
  traps: 'shoulders', trapezius: 'shoulders', 'levator scapulae': 'shoulders', 'rotator cuff': 'shoulders',
  glutes: 'legs', quads: 'legs', quadriceps: 'legs', hamstrings: 'legs',
  calves: 'legs', soleus: 'legs', adductors: 'legs', abductors: 'legs',
  'ankle stabilizers': 'legs', ankles: 'legs',
  biceps: 'biceps', forearms: 'biceps', 'wrist flexors': 'biceps',
  'wrist extensors': 'biceps', wrists: 'biceps', hands: 'biceps',
  triceps: 'triceps',
  abs: 'core', abdominals: 'core', obliques: 'core', core: 'core',
  waist: 'core', 'hip flexors': 'core',
};

const SECONDARY_DISCOUNT = 0.3; // 次要肌群按 30% 計分

// ── 力量標準錨點：相對強度（e1RM ÷ 體重）→ 分數 ──────────────────────────
// 錨點間分段線性插值；低於首點自 (0,0) 線性起算；高於末點依末段斜率外插，上限 100。
// core 錨點為自行設計：負重核心動作的相對 e1RM 門檻（見下方 core 計分說明）。
const PART_ANCHORS = {
  legs:      [[0.5, 20], [1.0, 50], [1.5, 75], [2.0, 95]],
  chest:     [[0.35, 20], [0.75, 50], [1.1, 75], [1.5, 95]],
  back:      [[0.5, 20], [1.0, 50], [1.5, 75], [2.0, 95]],
  shoulders: [[0.25, 20], [0.5, 50], [0.75, 75], [1.0, 95]],
  biceps:    [[0.15, 20], [0.35, 50], [0.55, 75], [0.75, 95]],
  triceps:   [[0.15, 20], [0.35, 50], [0.55, 75], [0.75, 95]],
  core:      [[0.10, 20], [0.25, 50], [0.40, 75], [0.60, 95]],
};

// ── 徒手動作等效負重 ───────────────────────────────────────────────────────
// 無重量紀錄的徒手動作，以「移動的體重比例」換算等效負重：
//   等效重量 = 體重 × 係數 + 已記錄的額外負重
//   e1RM 與相對強度沿用同一公式，故 10 下引體向上 ≈ 相對強度 1.33 ≈ 背部 66 分。
// 係數依動作型態（生物力學上身體被移動的比例，取常見文獻近似值）：
//   引體/撐體/懸吊類 1.0（全身懸空）、伏地挺身類 0.64（俯撐斜面）、
//   徒手腿部類 0.85（站姿蹲類）、背伸展 0.4、核心徒手 0.25（軀幹屈伸）。
function bodyweightFactor(name, part) {
  if (/引體|撐體|懸吊|dip|pull.?up|chin.?up/i.test(name)) return 1.0;
  if (/伏地挺身|push.?up/i.test(name)) return 0.64;
  if (/背伸展|hyperextension/i.test(name)) return 0.4;
  if (part === 'legs') return 0.85;
  if (part === 'core') return 0.25;
  return 0.5;
}

// ── 工具 ───────────────────────────────────────────────────────────────────
function toDate(s) { return new Date(s + 'T00:00:00'); }
function dayDiff(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }

function interpolate(rel, anchors) {
  if (!(rel > 0)) return 0;
  const pts = [[0, 0], ...anchors];
  for (let i = 1; i < pts.length; i++) {
    if (rel <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (rel - x0) / (x1 - x0) * (y1 - y0);
    }
  }
  const [x0, y0] = pts[pts.length - 2], [x1, y1] = pts[pts.length - 1];
  return Math.min(100, y1 + (rel - x1) * (y1 - y0) / (x1 - x0));
}

// 休養區間：periods = [{start:'YYYY-MM-DD', end:'YYYY-MM-DD'|null}]（null = 進行中）
function isInRest(dateStr, periods) {
  return (periods || []).some(p =>
    dateStr >= p.start && (!p.end || dateStr <= p.end));
}

// [from, to] 兩日期間（不含 from、含 to）落在休養區間內的天數
function restDaysBetween(from, to, periods) {
  let n = 0;
  const d = toDate(from);
  for (;;) {
    d.setDate(d.getDate() + 1);
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (s > to) break;
    if (isInRest(s, periods)) n++;
  }
  return n;
}

// ── 動作 → 部位歸屬 ────────────────────────────────────────────────────────
// 權威來源：EXERCISE_MAP（中文名 → 資料集 id）→ EXERCISE_INDEX（id → 肌群）。
// 對照不到的動作（自訂動作等）fallback 到訓練紀錄所選的部位（權重 1.0）。
function attributions(name, workoutPart, exMap, exIndex) {
  const entry = exMap && exMap[name];
  const ex = entry && entry.l && exIndex ? exIndex[entry.l] : null;
  if (!ex) return workoutPart ? [{ part: workoutPart, w: 1.0 }] : [];
  const out = [], seen = {};
  const primary = MUSCLE_TO_PART[ex.target];
  if (primary) { out.push({ part: primary, w: 1.0 }); seen[primary] = true; }
  (ex.secondary_muscles || []).forEach(m => {
    const p = MUSCLE_TO_PART[m];
    if (p && !seen[p]) { out.push({ part: p, w: SECONDARY_DISCOUNT }); seen[p] = true; }
  });
  if (!out.length && workoutPart) out.push({ part: workoutPart, w: 1.0 });
  return out;
}

// ── 部位分數 ───────────────────────────────────────────────────────────────
// 每部位：
//   raw     = 歷史最佳（加權）相對強度經錨點映射的分數（只增不減 → 即「歷史最高分」）
//   score   = raw 經衰退：有效未練天數 > 7 起每天 -1，保底 raw × 60%
//   warning = 距開始衰退 ≤ 2 天（提示「該練了」）
// 有效未練天數 = 實際天數 − 期間落在休養區間的天數。
// 休養區間內的訓練紀錄不計入成長（暫停成長），也由 xpEligible() 排除 XP。
//
// core 特例（規格允許自行設計）：核心少有大負重，單靠 e1RM 會失真，
// 改為「負重/等效負重分數 × 0.5 + 頻率分數 × 0.5」：
//   頻率分數 = min(100, 近 30 天有核心訓練的天數 × 12)（每月 8 天 ≈ 96 分）
function computePartScores(opts) {
  const { workouts, bodyWeightKg, today, restPeriods, exMap, exIndex } = opts;
  const bw = bodyWeightKg > 0 ? bodyWeightKg : 65;
  const parts = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];
  const best = {}, lastDate = {}, coreDays = new Set();

  workouts.forEach(w => {
    if (w.type !== 'weight' || !w.date || w.date > today) return;
    const inRest = isInRest(w.date, restPeriods);
    (w.exercises || []).forEach(ex => {
      const attrs = attributions(ex.name, w.bodyPart, exMap, exIndex);
      if (!attrs.length) return;
      let bestSet = 0;
      (ex.sets || []).forEach(s => {
        const reps = parseInt(s.reps) || 0;
        if (!reps) return;
        let load = parseFloat(s.weight) || 0;
        if (load <= 0) load = bw * bodyweightFactor(ex.name, w.bodyPart);
        else if (/引體|撐體|懸吊|伏地挺身|dip|pull.?up|push.?up/i.test(ex.name)) {
          load += bw * bodyweightFactor(ex.name, w.bodyPart); // 徒手動作的額外負重
        }
        const e1rm = load * (1 + Math.min(reps, 30) / 30); // Epley；30 下封頂避免高次數灌分
        if (e1rm > bestSet) bestSet = e1rm;
      });
      if (!bestSet) return;
      attrs.forEach(({ part, w: weight }) => {
        lastDate[part] = !lastDate[part] || w.date > lastDate[part] ? w.date : lastDate[part];
        if (part === 'core' && dayDiff(w.date, today) <= 30) coreDays.add(w.date);
        if (inRest) return; // 休養期間：維持「最後訓練日」但不成長
        const rel = (bestSet * weight) / bw;
        if (!best[part] || rel > best[part]) best[part] = rel;
      });
    });
  });

  const result = {};
  parts.forEach(part => {
    let raw = Math.round(interpolate(best[part] || 0, PART_ANCHORS[part]));
    if (part === 'core') {
      const freq = Math.min(100, coreDays.size * 12);
      raw = Math.round(raw * 0.5 + freq * 0.5);
    }
    let daysSince = null, effDays = null, decayDays = 0, warning = false;
    if (lastDate[part]) {
      daysSince = dayDiff(lastDate[part], today);
      effDays = daysSince - restDaysBetween(lastDate[part], today, restPeriods);
      decayDays = Math.max(0, effDays - 7);
      warning = effDays >= 6 && effDays <= 7 && raw > 0;
    }
    const resting = isInRest(today, restPeriods);
    if (resting) decayDays = Math.max(0, decayDays); // 今天休養中：衰退天數已由 effDays 扣除
    const score = raw > 0 ? Math.max(Math.round(raw * 0.6), raw - decayDays) : 0;
    result[part] = { score, raw, daysSince, effDays, decayDays, warning, resting };
  });
  return result;
}

// ── 耐力分數 ───────────────────────────────────────────────────────────────
// 近 30 天有氧換算「等效跑量 km」：跑步 ×1、單車 ×0.4、游泳 ×4（每 km）；
// 無距離時以時間概算（每 10 分鐘 ≈ 1 等效 km）。休養區間內的紀錄不計。
// 體重相對化（精神）：等效跑量 × (體重/65)^0.25，夾在 0.85–1.15 之間——
// 同距離下較重的身體作功較多，給予溫和加成，反之亦然。
// 錨點：10km→30、25km→60、50km→85、80km→100。
const ENDURANCE_ANCHORS = [[10, 30], [25, 60], [50, 85], [80, 100]];
const CARDIO_KM_FACTOR = { indoor_run: 1, outdoor_run: 1, bike: 0.4, swim: 4 };

function computeEndurance(opts) {
  const { workouts, bodyWeightKg, today, restPeriods } = opts;
  const bw = bodyWeightKg > 0 ? bodyWeightKg : 65;
  let eqKm = 0;
  workouts.forEach(w => {
    const f = CARDIO_KM_FACTOR[w.type];
    if (!f || !w.date || w.date > today || dayDiff(w.date, today) > 30) return;
    if (isInRest(w.date, restPeriods)) return;
    let km = parseFloat(w.distance) || 0;
    if (w.type === 'swim' && w.distanceUnit !== 'km') km /= 1000;
    if (km > 0) eqKm += km * f;
    else if (w.duration > 0) eqKm += w.duration / 10;
  });
  const adj = Math.max(0.85, Math.min(1.15, Math.pow(bw / 65, 0.25)));
  return { score: Math.round(interpolate(eqKm * adj, ENDURANCE_ANCHORS)), eqKm: Math.round(eqKm * 10) / 10 };
}

// ── 體重時間序列 ───────────────────────────────────────────────────────────
// entries = [{date, weight}]；回傳 ≤ 指定日期的最近一筆（無則 fallback）。
function weightOn(entries, dateStr, fallback) {
  const past = (entries || []).filter(e => e.date <= dateStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  return past.length ? past[past.length - 1].weight : fallback;
}

// 距上次體重更新的天數（無紀錄回傳 null）
function daysSinceWeightUpdate(entries, today) {
  if (!entries || !entries.length) return null;
  const last = entries.reduce((m, e) => e.date > m ? e.date : m, entries[0].date);
  return dayDiff(last, today);
}

// XP 資格：休養區間內的訓練不累積 XP
function xpEligible(w, restPeriods) { return !isInRest(w.date, restPeriods); }

const Engine = {
  MUSCLE_TO_PART, PART_ANCHORS, SECONDARY_DISCOUNT,
  attributions, bodyweightFactor, interpolate,
  isInRest, restDaysBetween,
  computePartScores, computeEndurance,
  weightOn, daysSinceWeightUpdate, xpEligible,
};

if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
if (typeof window !== 'undefined') window.Engine = Engine;
})();
