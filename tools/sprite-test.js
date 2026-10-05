// 像素角色模組測試：node tools/sprite-test.js
global.window = global;
const D = require('../js/sprite-data.js');
const S = require('../js/sprite.js');
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };
const all = v => ({ chest: v, back: v, shoulders: v, biceps: v, triceps: v, core: v, legs: v });
// 身體寬度：只量脖子以下（幼兒頭髮比身體寬）
const width = (r, neck) => { const xs = r.rows.slice(neck + 1).flatMap(row => [...row].map((c, x) => c === '.' ? -1 : x).filter(x => x >= 0)); return Math.max(...xs) - Math.min(...xs); };
const height = r => r.rows.filter(row => /[^.]/.test(row)).length;

// 選圖：等級 → 稱號、壯碩指數 → 體型
ok(S.pick(D, { level: 1 }).key === 'i1', 'Lv1 用 i1');
ok(S.pick(D, { level: 31, bmi: 19, weeklyVolPerKg: 20 }).type === 'lean', '低 BMI 低訓練量＝精實');
ok(S.pick(D, { level: 31, bmi: 26, weeklyVolPerKg: 280 }).type === 'bulk', '高 BMI 高訓練量＝壯碩');
ok(Math.abs(S.bulkIndex({ bmi: 22.5, weeklyVolPerKg: 150 }) - 0.5) < 1e-9, '壯碩指數中點＝0.5');

for (const b of D.bases) {
  const r0 = S.build(b, all(0)), r50 = S.build(b, all(50)), r100 = S.build(b, all(100));
  ok(width(r0, b.meta.neck) < width(r50, b.meta.neck) && width(r50, b.meta.neck) < width(r100, b.meta.neck), `${b.key} 寬度 0<50<100 分遞增`);
  ok(height(r0) === height(r50) && height(r50) === height(r100), `${b.key} 分數不改身高（不垂直拉長）`);
  ok(JSON.stringify(S.build(b, all(70)).rows) === JSON.stringify(S.build(b, all(70)).rows), `${b.key} 同分數輸出相同`);
  const pal = new Set(Object.keys(b.palette).concat('.'));
  ok(r100.rows.every(row => [...row].every(c => pal.has(c))), `${b.key} 像素都在色票內`);
  ok(Object.values(r50.partPos).every(([x, y]) => x > 0 && x < 100 && y > 0 && y < 100), `${b.key} 部位座標在畫布內`);
}
// 稱號越高越高（同體型）
const tall = D.titles.map((_, i) => height(S.build(D.bases.find(b => b.title === i && b.type !== 'bulk'), all(50))));
ok(tall.every((h, i) => i === 0 || h > tall[i - 1]), '稱號升級身高遞增 ' + tall.join('<'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
