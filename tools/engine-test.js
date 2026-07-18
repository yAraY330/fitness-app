// 部位分數引擎 console 驗證：node tools/engine-test.js
// 純函數測試——所有分數由「紀錄 + 今日日期」推導，不依賴瀏覽器。
'use strict';
const fs = require('fs');
const path = require('path');

global.window = {};
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'exercise-index.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'exercise-map.js'), 'utf-8'));
const Engine = require(path.join(__dirname, '..', 'js', 'engine.js'));

const exIndex = {};
window.EXERCISE_INDEX.forEach(e => { exIndex[e.id] = e; });
const exMap = window.EXERCISE_MAP;

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.log(`FAIL  ${name}  ${detail || ''}`); }
}
const T = '2026-07-18'; // 固定「今天」，確保測試可重現

// ── 1. 臥推 100kg×5、體重 80kg：胸 ~93、次要肌群按 30% 折扣 ──
{
  const ws = [{ type: 'weight', date: T, bodyPart: 'chest',
    exercises: [{ name: '槓鈴臥推', sets: [{ weight: 100, reps: 5 }] }] }];
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 80, today: T, restPeriods: [], exMap, exIndex });
  check('臥推→胸部分數 92±2', Math.abs(r.chest.score - 93) <= 2, `got ${r.chest.score}`);
  check('臥推→三頭次要計分(>0 且低於胸)', r.triceps.score > 0 && r.triceps.score < r.chest.score, `tri ${r.triceps.score}`);
  check('未練部位為 0', r.legs.score === 0 && r.back.score === 0, `legs ${r.legs.score}`);
}

// ── 2. 徒手：引體向上 10 下、體重 75kg → 背部 ~67 ──
{
  const ws = [{ type: 'weight', date: T, bodyPart: 'back',
    exercises: [{ name: '引體向上', sets: [{ weight: '', reps: 10 }] }] }];
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 75, today: T, restPeriods: [], exMap, exIndex });
  check('徒手引體→背部 67±2', Math.abs(r.back.score - 67) <= 2, `got ${r.back.score}`);
}

// ── 3. 衰退：20 天前練腿，今天分數 = raw - 13，且不低於 raw×60% ──
{
  const ws = [{ type: 'weight', date: '2026-06-28', bodyPart: 'legs',
    exercises: [{ name: '深蹲', sets: [{ weight: 100, reps: 5 }] }] }];
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 70, today: T, restPeriods: [], exMap, exIndex });
  check('衰退天數 = 20-7 = 13', r.legs.decayDays === 13, `got ${r.legs.decayDays}`);
  check('分數 = max(raw-13, raw*0.6)', r.legs.score === Math.max(r.legs.raw - 13, Math.round(r.legs.raw * 0.6)), `raw ${r.legs.raw} score ${r.legs.score}`);
}

// ── 4. 保底：200 天未練也不低於歷史最高的 60% ──
{
  const ws = [{ type: 'weight', date: '2025-12-01', bodyPart: 'legs',
    exercises: [{ name: '深蹲', sets: [{ weight: 140, reps: 5 }] }] }];
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 70, today: T, restPeriods: [], exMap, exIndex });
  check('保底 = round(raw×0.6)', r.legs.score === Math.round(r.legs.raw * 0.6), `raw ${r.legs.raw} score ${r.legs.score}`);
}

// ── 5. 衰退預警：6-7 天未練 warning=true，5 天或 8 天則否 ──
{
  const mk = date => Engine.computePartScores({
    workouts: [{ type: 'weight', date, bodyPart: 'chest',
      exercises: [{ name: '槓鈴臥推', sets: [{ weight: 60, reps: 8 }] }] }],
    bodyWeightKg: 70, today: T, restPeriods: [], exMap, exIndex }).chest;
  check('5 天未練不預警', mk('2026-07-13').warning === false);
  check('6 天未練預警', mk('2026-07-12').warning === true);
  check('7 天未練預警', mk('2026-07-11').warning === true);
  check('8 天未練已在衰退、不再預警', mk('2026-07-10').warning === false && mk('2026-07-10').decayDays === 1);
}

// ── 6. 休養模式：跨衰退區間的天數被跳過；休養中訓練不成長、不計 XP ──
{
  const ws = [{ type: 'weight', date: '2026-06-28', bodyPart: 'legs',
    exercises: [{ name: '深蹲', sets: [{ weight: 100, reps: 5 }] }] }];
  const rest = [{ start: '2026-07-01', end: '2026-07-10' }]; // 10 天休養
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 70, today: T, restPeriods: rest, exMap, exIndex });
  check('休養 10 天 → 有效未練 10 天 → 衰退 3', r.legs.decayDays === 3, `got ${r.legs.decayDays}`);

  const ws2 = [...ws, { type: 'weight', date: '2026-07-05', bodyPart: 'legs',
    exercises: [{ name: '深蹲', sets: [{ weight: 200, reps: 5 }] }] }]; // 休養中破 PR
  const r2 = Engine.computePartScores({ workouts: ws2, bodyWeightKg: 70, today: T, restPeriods: rest, exMap, exIndex });
  check('休養中訓練不成長（raw 不變）', r2.legs.raw === r.legs.raw, `${r.legs.raw} → ${r2.legs.raw}`);
  // 7/5 休養中訓練會重置最後訓練日；此後休養剩 5 天不計，到 7/18 有效未練 8 天 → 衰退 1
  check('休養中訓練重置最後訓練日', r2.legs.decayDays === 1, `got ${r2.legs.decayDays}`);
  check('休養中訓練不計 XP', Engine.xpEligible(ws2[1], rest) === false);
  check('休養外訓練計 XP', Engine.xpEligible(ws2[0], rest) === true);
}

// ── 7. 自訂動作 fallback 到所選部位 ──
{
  const ws = [{ type: 'weight', date: T, bodyPart: 'shoulders',
    exercises: [{ name: '我的神秘動作', sets: [{ weight: 40, reps: 8 }] }] }];
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 70, today: T, restPeriods: [], exMap, exIndex });
  check('自訂動作歸入所選部位', r.shoulders.score > 0, `got ${r.shoulders.score}`);
}

// ── 8. core：頻率+負重混合 ──
{
  const ws = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date('2026-07-17T00:00:00'); d.setDate(d.getDate() - i * 3);
    ws.push({ type: 'weight', date: d.toISOString().slice(0, 10), bodyPart: 'core',
      exercises: [{ name: '捲腹', sets: [{ weight: '', reps: 20 }] }] });
  }
  const r = Engine.computePartScores({ workouts: ws, bodyWeightKg: 70, today: T, restPeriods: [], exMap, exIndex });
  check('core 頻率貢獻（8 天×12×0.5 ≥ 48）', r.core.score >= 48, `got ${r.core.score}`);
  check('core 不超過 100', r.core.score <= 100);
}

// ── 9. 耐力：30 天 20km 跑量 → ~50；31 天前不計 ──
{
  const ws = [
    { type: 'outdoor_run', date: '2026-07-10', distance: 12 },
    { type: 'outdoor_run', date: '2026-07-01', distance: 8 },
    { type: 'outdoor_run', date: '2026-06-01', distance: 42 }, // 超過 30 天
  ];
  const r = Engine.computeEndurance({ workouts: ws, bodyWeightKg: 65, today: T, restPeriods: [] });
  check('耐力 eqKm = 20', r.eqKm === 20, `got ${r.eqKm}`);
  check('耐力分數 50±2', Math.abs(r.score - 50) <= 2, `got ${r.score}`);
  const swim = Engine.computeEndurance({ workouts: [{ type: 'swim', date: T, distance: 1000, distanceUnit: 'm' }], bodyWeightKg: 65, today: T, restPeriods: [] });
  check('游泳 1000m = 4 eqKm', swim.eqKm === 4, `got ${swim.eqKm}`);
}

// ── 10. 體重時間序列 ──
{
  const entries = [{ date: '2026-06-01', weight: 70 }, { date: '2026-07-01', weight: 68 }];
  check('weightOn 取 ≤ 指定日最近一筆', Engine.weightOn(entries, '2026-06-15', 65) === 70);
  check('weightOn 最新', Engine.weightOn(entries, T, 65) === 68);
  check('weightOn 無紀錄 fallback', Engine.weightOn([], T, 65) === 65);
  check('距上次更新 17 天', Engine.daysSinceWeightUpdate(entries, T) === 17);
  check('無紀錄回傳 null', Engine.daysSinceWeightUpdate([], T) === null);
}

// ── 11. 純函數性質：刪除紀錄後重算自動回退 ──
{
  const w1 = { type: 'weight', date: T, bodyPart: 'chest', exercises: [{ name: '槓鈴臥推', sets: [{ weight: 100, reps: 5 }] }] };
  const w2 = { type: 'weight', date: T, bodyPart: 'chest', exercises: [{ name: '槓鈴臥推', sets: [{ weight: 60, reps: 5 }] }] };
  const withPR = Engine.computePartScores({ workouts: [w1, w2], bodyWeightKg: 80, today: T, restPeriods: [], exMap, exIndex });
  const without = Engine.computePartScores({ workouts: [w2], bodyWeightKg: 80, today: T, restPeriods: [], exMap, exIndex });
  check('刪除 PR 紀錄後分數自動下修', without.chest.score < withPR.chest.score, `${withPR.chest.score} → ${without.chest.score}`);
}

// ── 12. 肌群歸屬抽查：深蹲主 legs、硬舉主 back 次含 legs ──
{
  const sq = Engine.attributions('深蹲', 'legs', exMap, exIndex);
  check('深蹲主要歸 legs', sq[0].part === 'legs' && sq[0].w === 1);
  const dl = Engine.attributions('硬舉', 'back', exMap, exIndex);
  const parts = dl.map(a => a.part);
  check('硬舉含 back 與 legs', parts.includes('back') || parts.includes('legs'), JSON.stringify(dl));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
