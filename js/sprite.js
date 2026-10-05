// 像素角色模組（資料：js/sprite-data.js，由 design/characters/pixel/build_base.py 產生；預覽：design/characters/pixel/sprite-lab.html）
//
// 三層決定外觀（使用者 2026-10-05 定）：
//   等級        → 稱號 → 年紀（哪一組圖）
//   體重＋訓練量 → 體型（同稱號的精實 lean／壯碩 bulk 圖）
//   部位分數     → 各部位肌肉寬度＋陰影深淺（逐列把片段撐寬／收窄）
// 比例只來自原圖：**不做任何垂直拉長**（使用者明確禁止），只有水平的肌肉寬度變化。
//
// Sprite.pick(data, { level, bmi, weeklyVolPerKg }) → 基底
// Sprite.build(base, scores) → { w, h, rows, partPos }
// Sprite.toCanvas(built, palette, { resting })
// Sprite.render(data, opts, scores, { resting }) → { url, w, h, partPos, key }（App 用，結果快取）
(function (root) {
'use strict';

// ── 選圖 ─────────────────────────────────────────────────────────────
function titleIndex(titles, level) {
  let i = 0; titles.forEach((t, k) => { if ((level || 1) >= t.min) i = k; }); return i;
}
// 壯碩指數 0～1：一半看體重（BMI 18→27），一半看近 4 週平均每週重訓量（舉重公斤數 ÷ 體重，0→300）
function bulkIndex({ bmi = 21, weeklyVolPerKg = 0 } = {}) {
  const c = v => Math.max(0, Math.min(1, v));
  return 0.5 * c((bmi - 18) / 9) + 0.5 * c(weeklyVolPerKg / 300);
}
function pick(data, opts = {}) {
  const ti = titleIndex(data.titles, opts.level);
  const type = bulkIndex(opts) >= 0.5 ? 'bulk' : 'lean';
  const cands = data.bases.filter(b => b.title === ti);
  return cands.find(b => b.type === type) || cands.find(b => b.type === 'both') || cands[0];
}

// ── 肌肉寬度 ─────────────────────────────────────────────────────────
// 50 分＝原圖；往下縮 KD、往上撐 KU（100 分刻意誇張）；年紀越小變化越小（AGE_K，依稱號）
const KD = { chest: 0.22, shoulders: 0.35, back: 0.25, core: 0.12, arm: 0.4, hips: 0.15, thigh: 0.3, calf: 0.3 };
const KU = { chest: 0.45, shoulders: 0.7, back: 0.5, core: 0.15, arm: 0.8, hips: 0.25, thigh: 0.6, calf: 0.55 };
const AGE_K = [0.25, 0.4, 0.6, 0.8, 0.95, 1];
const ROLE_PART = { chest: 'chest', shoulders: 'shoulders', back: 'back', core: 'core', hips: 'legs', thigh: 'legs', calf: 'legs', foot: 'legs' };

const smooth = (a, b, t) => { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
const bandT = (y, y0, y1) => (y - y0) / Math.max(1, y1 - y0);
const TAPER = {                               // 列內漸變：三角肌中段鼓、上臂往手肘收、小腿上粗下細
  delt:  t => smooth(0, 0.55, t) * (1 - 0.3 * smooth(0.6, 1, t)),
  chest: t => smooth(0, 0.3, t),
  arm:   t => 1 - 0.45 * smooth(0, 1, t),
  calf:  t => 1 - 0.75 * smooth(0.15, 1, t),
};
const taperF = (fv, w) => 1 + (fv - 1) * w;

function runs(row) {
  const out = []; let s = -1;
  for (let x = 0; x <= row.length; x++) {
    const on = x < row.length && row[x] !== '.';
    if (on && s < 0) s = x;
    if (!on && s >= 0) { out.push([s, x - 1]); s = -1; }
  }
  return out;
}
// 片段縮放：保留兩側外框＋邊緣光，內部以中心對齊的最近鄰取樣
function resample(seg, w2) {
  const w = seg.length;
  if (w2 === w || w < 4) return seg.slice();
  const b = w >= 16 ? 4 : w >= 8 ? 2 : 1, n = w - 2 * b, m = Math.max(1, w2 - 2 * b);
  const out = seg.slice(0, b);
  for (let j = 0; j < m; j++) out.push(seg[b + Math.min(n - 1, Math.floor((j + 0.5) * n / m))]);
  return out.concat(seg.slice(w - b));
}
// 肌肉線條：皮膚色階中比主膚色暗的才是陰影；低分往亮推（變平），高分往暗推（線條變深）
function makeShade(base) {
  const ramp = base.skinRamp, idx = {};
  [...ramp].forEach((c, i) => idx[c] = i);
  const cnt = {}; rowsOf(base).forEach(r => { for (const c of r) if (c in idx) cnt[c] = (cnt[c] || 0) + 1; });
  const main = idx[Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]];
  return (c, s) => {
    const i = idx[c];
    if (i == null || i >= main) return c;
    const step = s < 10 ? 3 : s < 30 ? 2 : s < 40 ? 1 : s >= 90 ? -2 : s >= 70 ? -1 : 0;
    return ramp[Math.max(0, Math.min(main, i + step))];
  };
}

// 列以 RLE 儲存（「次數＋字元」，次數 1 省略），第一次用時解開並快取在基底上
function decodeRow(r) { return r.replace(/(\d+)(\D)/g, (_, n, c) => c.repeat(+n)); }
function rowsOf(base) { return base._rows || (base._rows = base.rows.map(decodeRow)); }

function build(base, scores) {
  const m = base.meta, rows = rowsOf(base), cx = m.cx;
  const sc = p => (scores && scores[p] != null ? scores[p] : 50);
  const armScore = (sc('biceps') + sc('triceps')) / 2;
  const ak = AGE_K[base.title] != null ? AGE_K[base.title] : 1;
  const factor = (role, s) => { s = Math.max(0, Math.min(100, s));
    const d = s < 50 ? -(50 - s) / 50 * (KD[role] || 0) : (s - 50) / 50 * (KU[role] || 0); return 1 + d * ak; };
  const f = {
    chest: factor('chest', sc('chest')), shoulders: factor('shoulders', sc('shoulders')), back: factor('back', sc('back')),
    core: factor('core', sc('core')), arm: factor('arm', armScore), hips: factor('hips', sc('legs')),
    thigh: factor('thigh', sc('legs')), calf: factor('calf', sc('legs')),
  };
  const roleScore = { chest: sc('chest'), shoulders: sc('shoulders'), back: sc('back'), core: sc('core'),
    arm: armScore, thigh: sc('legs'), calf: sc('legs') };   // hips（褲＋繩）、手、腳不調陰影
  const shade = makeShade(base);

  // 代表寬度（量自基底）：腋下列的軀幹寬、三角肌寬、褲管寬
  const rA = runs(rows[m.armpit]);
  const torsoA = rA.find(r => r[0] <= cx && r[1] >= cx) || [cx - 10, cx + 10];
  const CHEST_W = torsoA[1] - torsoA[0] + 1;
  const rS = runs(rows[m.neck + Math.round((m.armpit - m.neck) * 0.6)]);
  const shoulderW = rS.length ? rS[rS.length - 1][1] - rS[0][0] + 1 : CHEST_W * 1.4;
  const DELT_W = Math.max(3, Math.round((shoulderW - CHEST_W) / 2));
  const rT = runs(rows[Math.round((m.split + m.shortsEnd) / 2)]).filter(r => r[1] < cx);
  const THIGH_W = rT.length ? rT[rT.length - 1][1] - rT[rT.length - 1][0] + 1 : 12;

  const armShift = Math.round(CHEST_W * (Math.max(f.chest, f.back) - 1) / 2 + DELT_W * (f.shoulders - 1) / 2);
  const legShift = Math.round(THIGH_W * (f.thigh - 1) / 2);

  const baseW = Math.max(...rows.map(r => r.length));
  const W = Math.round(baseW * 1.5), H = rows.length + 2;
  const OFF = Math.round(W / 2) - cx;
  const out = Array.from({ length: H }, () => Array(W).fill('.'));
  const acc = {};
  const put = (y, x0, seg, role, side) => {
    for (let i = 0; i < seg.length; i++) {
      const x = x0 + i, c = seg[i];
      if (c === '.' || x < 0 || x >= W) continue;
      out[y][x] = role && roleScore[role] != null ? shade(c, roleScore[role]) : c;
      const part = role === 'arm' ? (side < 0 ? 'biceps' : 'triceps') : ROLE_PART[role];
      if (part) { const a = acc[part] || (acc[part] = [0, 0, 0]); a[0] += x; a[1] += y; a[2]++; }
    }
  };
  const place = (y, row, [a, b], role, shift, side, fv) => {
    const seg = row.slice(a, b + 1).split('');
    const ns = resample(seg, Math.max(3, Math.round(seg.length * fv)));
    put(y, Math.round((a + b) / 2 + OFF + shift - (ns.length - 1) / 2), ns, role, side);
  };
  const torsoRole = y => y < m.armpit + (m.belt - m.armpit) * 0.35 ? 'back' : y < m.belt ? 'core' : 'hips';
  const legRole = y => y <= m.shortsEnd ? 'thigh' : y <= m.ankle ? 'calf' : 'foot';
  const legF = (role, y) => role === 'calf' ? taperF(f.calf, TAPER.calf(bandT(y, m.shortsEnd, m.ankle)))
    : role === 'foot' ? taperF(f.calf, 0.25) : f.thigh;

  // 手臂與身體的分界欄：透明或很暗的格（外框、腋下陰影）連成的縫。看不出縫的列，用上下列內插，
  // 讓整條手臂一起移動（壯碩型手臂和身體之間是深色陰影、不是透明，只看透明會把手臂撕成兩截）
  const lum = {};
  Object.entries(base.palette).forEach(([k, h]) => { lum[k] = parseInt(h.slice(1, 3), 16) * 0.3 + parseInt(h.slice(3, 5), 16) * 0.59 + parseInt(h.slice(5, 7), 16) * 0.11; });
  const gapc = c => c === '.' || lum[c] < 55;
  const minHalf = Math.round(CHEST_W * 0.3);
  const seam = (row, side) => {
    const r = runs(row); if (!r.length) return null;
    const lo = r[0][0], hi = r[r.length - 1][1];
    const [a, b] = side < 0 ? [lo + 2, cx - minHalf] : [cx + minHalf, hi - 2];
    let best = null, s0 = -1;
    for (let x = a; x <= b + 1; x++) {
      const g = x <= b && gapc(row[x]);
      if (g && s0 < 0) s0 = x;
      if (!g && s0 >= 0) {
        // 縫必須含真正透明格：只有深色的段可能是肌肉陰影線，不算分界
        if (row.slice(s0, x).includes('.') && (!best || x - s0 > best[1] - best[0])) best = [s0, x];
        s0 = -1;
      }
    }
    return best && best[1] - best[0] >= 2 ? Math.round((best[0] + best[1] - 1) / 2) : null;
  };
  const fill = arr => {
    const known = []; for (let y = m.armpit; y <= m.handEnd; y++) if (arr[y] != null) known.push(y);
    if (!known.length) return arr;
    for (let y = m.armpit; y <= m.handEnd; y++) {
      if (arr[y] != null) continue;
      const a = known.filter(k => k < y).pop(), b = known.find(k => k > y);
      arr[y] = a == null ? arr[b] : b == null ? arr[a] : Math.round(arr[a] + (arr[b] - arr[a]) * (y - a) / (b - a));
    }
    return arr;
  };
  const bL = [], bR = [];
  for (let y = m.armpit; y <= m.handEnd; y++) { bL[y] = seam(rows[y], -1); bR[y] = seam(rows[y], 1); }
  fill(bL); fill(bR);

  rows.forEach((row, y) => {
    const all = runs(row);
    if (!all.length) return;
    // 1～2 格寬的零碎片段（散髮絲、外框殘點）不參與分段，原地照貼，避免被當成手臂往外推成橫線
    const rs = y <= m.neck ? all : all.filter(r => r[1] - r[0] >= 2);
    if (y > m.neck) all.filter(r => r[1] - r[0] < 2).forEach(r => put(y, r[0] + OFF, row.slice(r[0], r[1] + 1).split(''), null, 0));
    if (!rs.length) return;
    const lo = rs[0][0], hi = rs[rs.length - 1][1];
    if (y <= m.neck) {                                   // 頭（含長髮）：不變形
      put(y, lo + OFF, row.slice(lo, hi + 1).split(''), null, 0);
      return;
    }
    if (y < m.armpit) {                                  // 肩＋上胸：三角肌｜胸｜三角肌（手臂與軀幹尚未分開）
      const t = bandT(y, m.neck, m.armpit);
      const dw = Math.min(DELT_W, Math.floor((hi - lo + 1) / 4)), cA = lo + dw, cB = hi - dw;
      const fc = taperF(f.chest, TAPER.chest(t)), fd = taperF(f.shoulders, TAPER.delt(t));
      const cseg = resample(row.slice(cA, cB + 1).split(''), Math.round((cB - cA + 1) * fc));
      const cL = Math.round((cA + cB) / 2 + OFF - (cseg.length - 1) / 2);
      put(y, cL, cseg, 'chest', 0);
      const dL = resample(row.slice(lo, cA).split(''), Math.max(2, Math.round(dw * fd)));
      const dR = resample(row.slice(cB + 1, hi + 1).split(''), Math.max(2, Math.round(dw * fd)));
      put(y, cL - dL.length, dL, 'shoulders', -1);
      put(y, cL + cseg.length, dR, 'shoulders', 1);
      return;
    }
    // 腋下以下：手臂／手的列範圍內，依分界欄切成「左臂｜身體｜右臂」，其餘＝軀幹或腿
    const pieces = [];
    if (y >= m.armpit && y <= m.handEnd && (bL[y] != null || bR[y] != null)) {
      const L = bL[y] != null ? bL[y] : -1, R = bR[y] != null ? bR[y] : row.length;
      if (L >= lo) pieces.push([[lo, L], 'armL']);
      if (R <= hi) pieces.push([[R, hi], 'armR']);
      const middle = '.'.repeat(L + 1) + row.slice(L + 1, R);   // 分界之間＝身體（可能已分成兩條腿）
      runs(middle).filter(r => r[1] - r[0] >= 2).forEach(r => pieces.push([r, 'body']));
    } else rs.forEach(r => pieces.push([r, 'body']));
    const armRole = y < m.hand ? 'arm' : 'hand';
    const armF = armRole === 'arm' ? taperF(f.arm, TAPER.arm(bandT(y, m.armpit, m.hand))) : 1;
    pieces.forEach(([r, kind]) => {
      if (kind === 'armL') place(y, row, r, armRole, -armShift, -1, armF);
      else if (kind === 'armR') place(y, row, r, armRole, armShift, 1, armF);
      else if (y < m.split) { const role = torsoRole(y); place(y, row, r, role, 0, 0, f[role]); }   // 軀幹／腰帶／短褲上段
      else { const side = (r[0] + r[1]) / 2 < cx ? -1 : 1, role = legRole(y);                       // 褲管／小腿／腳
        place(y, row, r, role, side * legShift, side, legF(role, y)); }
    });
  });

  const partPos = {};
  Object.keys(acc).forEach(p => { const [sx, sy, n] = acc[p]; partPos[p] = [+(sx / n / W * 100).toFixed(1), +(sy / n / H * 100).toFixed(1)]; });
  return { w: W, h: H, rows: out.map(r => r.join('')), partPos };
}

const GRAY = c => { const v = Math.round(parseInt(c.slice(1, 3), 16) * 0.3 + parseInt(c.slice(3, 5), 16) * 0.59 + parseInt(c.slice(5, 7), 16) * 0.11);
  const h = v.toString(16).padStart(2, '0'); return '#' + h + h + h; };

function toCanvas(b, palette, { resting = false } = {}) {
  const cv = document.createElement('canvas'); cv.width = b.w; cv.height = b.h;
  const ctx = cv.getContext('2d');
  b.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) {
    const c = row[x]; if (c === '.') continue;
    ctx.fillStyle = resting ? GRAY(palette[c]) : palette[c]; ctx.fillRect(x, y, 1, 1);
  } });
  return cv;
}

// App 用：選圖＋變形＋畫成 data URL；同一組輸入只算一次（首頁每次渲染都會呼叫）
const _cache = new Map();
function render(data, opts, scores, { resting = false } = {}) {
  const base = pick(data, opts);
  const sc = {}; ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'core', 'legs'].forEach(p => sc[p] = Math.round(scores && scores[p] != null ? scores[p] : 50));
  const key = base.key + '|' + Object.values(sc).join(',') + '|' + (resting ? 1 : 0);
  if (_cache.has(key)) return _cache.get(key);
  const b = build(base, sc);
  const out = { url: toCanvas(b, base.palette, { resting }).toDataURL('image/png'), w: b.w, h: b.h, partPos: b.partPos, key };
  if (_cache.size > 40) _cache.clear();
  _cache.set(key, out);
  return out;
}

const Sprite = { pick, bulkIndex, titleIndex, build, toCanvas, render, decodeRow };
if (typeof module !== 'undefined') module.exports = Sprite; else root.Sprite = Sprite;
})(typeof window !== 'undefined' ? window : globalThis);
