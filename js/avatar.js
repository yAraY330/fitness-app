// ── 筋肉人角色生成器（連續輪廓參數化版）───────────────────────────────────
//
// 畫風基準：dev-style.html 使用者選定的 B 版（肩寬≈頭寬3倍、屈臂握拳姿）。
// 參數化原理：所有輪廓錨點在「纖細剪影(t=0)」與「極端筋肉人(t=1)」兩套
// 校準座標間插值，插值比例由該錨點所屬部位的分數決定——
// 因此低分依然是同一條連續有機輪廓，只是變窄變平；不做零件替換。
// 全部位 80 分 ≈ 選定的 B 版。內部肌肉分隔線與排線按分數門檻顯示。
//
// buildKinniku(opts)：
//   gender 'm'|'f'、height、weight、scores{7部位0-100}、endurance 0-100、
//   stageIndex 0-5、resting、dimParts[]
// 每部位有 g#av-<part> 群組與 #glow-<part> 覆蓋形，供 GSAP 部位發光/膨脹。

(function () {
'use strict';

const STAGE_STYLE = [
  { title: '健身新手',   trunks: '#64748b', boots: '#475569' },
  { title: '運動愛好者', trunks: '#0284c7', boots: '#075985' },
  { title: '健身達人',   trunks: '#059669', boots: '#065f46' },
  { title: '肌肉戰士',   trunks: '#ea580c', boots: '#9a3412' },
  { title: '健身大師',   trunks: '#7c3aed', boots: '#5b21b6' },
  { title: '傳奇冠軍',   trunks: '#d97706', boots: '#92400e' },
];

const OUT = '#16100a', SKIN = '#f0b078';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const LP = (lo, hi, t) => lo + (hi - lo) * t;

function buildKinniku(opts) {
  const g = opts.gender === 'f' ? 'f' : 'm';
  const hgt = clamp(parseFloat(opts.height) || 170, 100, 250);
  const wt = clamp(parseFloat(opts.weight) || 65, 25, 300);
  const sc = opts.scores || {};
  const t = p => clamp(sc[p] || 0, 0, 100) / 100;
  const endur = clamp(opts.endurance || 0, 0, 100) / 100;
  const si = clamp(opts.stageIndex || 0, 0, 5);
  const st = STAGE_STYLE[si];
  const dim = new Set(opts.dimParts || []);
  const resting = !!opts.resting;

  // ── 基準體型：BMI → 全身量體乘數；身高 → 腿長 ──
  const bmi = wt / Math.pow(hgt / 100, 2);
  const bmiT = clamp((bmi - 17) / 13, 0, 1);
  const b = LP(0.92, 1.12, bmiT);              // 寬度乘數（基準之上疊加分數）
  const legLen = LP(0.94, 1.06, clamp((hgt - 155) / 35, 0, 1));

  const tSh = t('shoulders'), tBk = t('back'), tCh = t('chest'), tCo = t('core');
  const tLg = t('legs'), tArm = 0.55 * t('biceps') + 0.45 * t('triceps');

  // ── 輪廓關鍵尺寸：低分(lo) ↔ 高分(hi) 依部位分數插值，再乘 BMI 基準 ──
  const DT  = LP(46, 76, tSh) * b;              // 三角肌最外
  const BI  = DT + LP(3, 14, tArm);             // 二頭肌最外
  const AW  = LP(11, 24, tArm);                 // 手臂厚度（內緣用）
  const AP  = LP(36, 47, tBk * 0.7 + tCh * 0.3) * b;  // 腋下
  const LAT = LP(37, 53, tBk) * b;              // 背闊最寬
  const WA  = (26 * LP(0.95, 1.3, bmiT) - 5 * tCo - 2 * endur);  // 腰半寬
  const TH  = LP(22, 42, tLg) * b;              // 大腿外緣
  const KO  = LP(15, 26, tLg) * b;              // 膝外緣
  const CO  = KO + LP(2, 8, tLg);               // 小腿肚外緣
  const AN  = LP(13, 18, tLg);                  // 踝
  const HD  = 18.4;                             // 頭半寬（固定，肩越寬頭顯得越小）
  const belly = bmi >= 26 && tCo < 0.4;

  const cx = 150, W = 300, H = 410;
  const hy = 54;

  // ── 上身連續輪廓（左半錨點 → 底邊 → 右半反走鏡射；1px 手繪抖動）──
  const trapX = LP(30, 36, tSh), trapY = LP(78, 70, tSh);
  const segs = [
    ['Q', -trapX - 4, trapY,  -trapX - 10, 86],                    // 斜方肌稜線
    ['C', -DT * 0.8, 76, -DT - 2, 84,  -DT - 3, 106],              // 三角肌球
    ['Q', -DT - 2, 118,      -DT + 1, 124],                        // 三角下懸
    ['C', -BI - 4, 128, -BI - 2, 138,  -BI - 3, 148],              // 二頭肌球
    ['Q', -BI - 2, 158,      -BI + 2, 164],                        // 肘
    ['Q', -BI + 4, 176,      -BI + AW * 0.55, 186],                // 前臂（短、內收）
    ['Q', -BI + AW * 0.75, 192,  -BI + AW, 194],                   // 腕外
    ['Q', -BI + AW + 6, 192,     -BI + AW + 4, 184],               // 腕內
    ['Q', -BI + AW + 1, 168,     -BI + AW - 2, 156],               // 內前臂→內肘
    ['Q', -BI + AW - 6, 140,     -AP - 2, 128],                    // 內二頭
    ['Q', -AP - 3, 126,      -AP, 124],                            // 腋下
    ['Q', -LAT - 3, 138,     -LAT, 152],                           // 背闊外擴
    ['C', -LAT + 8, 176, -WA - 8, 190,  -WA, 206],                 // V 收腰
    ['Q', -WA - 1, 216,      -WA - 4, 226],                        // 髖
  ];
  const j = i => ((i * 7) % 3 - 1) * 0.8;
  const RD = n => Math.round(n * 10) / 10;
  let d = `M ${cx - 16} 70 `;
  segs.forEach(([k, ...a], i) => {
    if (k === 'Q') d += `Q ${RD(cx + a[0] + j(i))} ${RD(a[1])} ${RD(cx + a[2])} ${RD(a[3] + j(i))} `;
    else d += `C ${RD(cx + a[0])} ${RD(a[1])} ${RD(cx + a[2] + j(i))} ${RD(a[3])} ${RD(cx + a[4])} ${RD(a[5] + j(i))} `;
  });
  d += `L ${RD(cx + WA + 4)} 226 `;
  for (let i = segs.length - 1; i >= 0; i--) {
    const [k, ...a] = segs[i];
    const prev = i > 0 ? segs[i - 1] : null;
    const [pex, pey] = prev ? [prev[prev.length - 2], prev[prev.length - 1]] : [-16, 70];
    if (k === 'Q') d += `Q ${RD(cx - a[0] - j(i))} ${RD(a[1])} ${RD(cx - pex)} ${RD(pey - j(i))} `;
    else d += `C ${RD(cx - a[2])} ${RD(a[3])} ${RD(cx - a[0] - j(i))} ${RD(a[1])} ${RD(cx - pex)} ${RD(pey - j(i))} `;
  }
  const torsoArms = d + `Q ${cx} 64 ${cx - 16} 70 Z`;

  // ── 腿（連續閉合；長度依身高縮放，以 legT 為原點對 y 縮放）──
  const legT = 224;
  const LY = y => RD(legT + (y - legT) * legLen);
  const KN = 292, ANK = 336, FT = 350;
  const leg = s => { const o = x => RD(cx + s * x);
    return `M ${o(WA + 4)} ${legT}
      C ${o(TH + 2)} ${LY(234)} ${o(TH + 4)} ${LY(246)} ${o(TH)} ${LY(260)}
      Q ${o(TH - 4)} ${LY(KN - 20)} ${o(KO)} ${LY(KN - 6)}
      C ${o(CO + 3)} ${LY(KN + 2)} ${o(CO + 4)} ${LY(KN + 12)} ${o(CO)} ${LY(KN + 22)}
      Q ${o(KO - 3)} ${LY(ANK - 8)} ${o(AN)} ${LY(ANK)}
      L ${o(AN + 1)} ${LY(FT - 6)} Q ${o(12)} ${LY(FT)} ${o(5)} ${LY(FT - 2)}
      L ${o(4)} ${LY(ANK)}
      Q ${o(2)} ${LY(KN + 26)} ${o(5)} ${LY(KN + 2)}
      Q ${o(7)} ${LY(KN - 16)} ${o(5)} ${LY(258)}
      Q ${o(4)} ${LY(236)} ${o(1)} ${LY(226)} Z`; };

  // ── 頭/頸 ──
  const headP = `M ${cx - HD} ${hy - 4}
    Q ${cx - HD - 2} ${hy + 13} ${cx - HD * 0.55} ${hy + 21}
    Q ${cx} ${hy + 27} ${cx + HD * 0.55} ${hy + 21}
    Q ${cx + HD + 2} ${hy + 13} ${cx + HD} ${hy - 4}
    Q ${cx + HD * 0.8} ${hy - 19} ${cx} ${hy - 20}
    Q ${cx - HD * 0.8} ${hy - 19} ${cx - HD} ${hy - 4} Z`;
  const neckW = LP(13, 19, tSh * 0.6 + tBk * 0.4);
  const neck = `M ${cx - neckW + 3} ${hy + 12} L ${RD(cx - neckW)} 82 L ${RD(cx + neckW)} 82 L ${cx + neckW - 3} ${hy + 12} Z`;

  // ── 內部肌肉分隔線（依部位分數門檻顯示）──
  const tick = (x, y, dx, dy) => `M ${RD(x)} ${RD(y)} l ${dx} ${dy} `;
  const pecBot = LP(132, 146, tCh);
  let innerChest = '', hatchChest = '';
  if (tCh >= 0.12 || bmiT > 0.6) {
    innerChest += `<path d="M ${cx} 98 L ${cx} ${RD(pecBot - 2)}"/>
      <path d="M ${cx - 2} ${RD(pecBot - 2)} Q ${cx - 32} ${RD(pecBot + 6)} ${RD(cx - AP - 2)} 124 M ${cx + 2} ${RD(pecBot - 2)} Q ${cx + 32} ${RD(pecBot + 7)} ${RD(cx + AP + 2)} 123"/>`;
  }
  if (tCh >= 0.3) {
    innerChest += `<path d="M ${cx - 34} 84 Q ${cx - 12} 94 ${cx - 3} 93 M ${cx + 34} 83 Q ${cx + 12} 93 ${cx + 3} 93"/>
      <path d="M ${cx - 38} 92 Q ${RD(cx - AP - 5)} 108 ${RD(cx - AP - 1)} 124 M ${cx + 38} 91 Q ${RD(cx + AP + 5)} 107 ${RD(cx + AP + 1)} 123"/>`;
    for (let i = 0; i < 5; i++) {
      hatchChest += tick(cx - 10 - i * 7, pecBot + 1 - i * 3.2, -4, -6) + tick(cx + 10 + i * 7, pecBot - i * 3.2, 4, -6);
    }
  }
  let innerSh = '', hatchSh = '';
  if (tSh >= 0.3) {
    innerSh = `<path d="M ${RD(cx - DT + 3)} 120 Q ${RD(cx - BI + 4)} 130 ${RD(cx - BI + 8)} 148 M ${RD(cx + DT - 3)} 119 Q ${RD(cx + BI - 4)} 129 ${RD(cx + BI - 8)} 147"/>`;
    for (let i = 0; i < 4; i++) {
      hatchSh += tick(cx - DT + 2 + i * 4, 114 + i * 4, 6, -4) + tick(cx + DT - 2 - i * 4, 113 + i * 4, -6, -4);
    }
  }
  let innerArm = '', hatchArm = '';
  if (tArm >= 0.35) {
    innerArm = `<path d="M ${RD(cx - BI + 6)} 164 Q ${RD(cx - BI + 12)} 172 ${RD(cx - BI + 18)} 178 M ${RD(cx + BI - 6)} 163 Q ${RD(cx + BI - 12)} 171 ${RD(cx + BI - 18)} 177"/>`;
    for (let i = 0; i < 3; i++) {
      hatchArm += tick(cx - BI + 4 + i * 3, 152 + i * 4, 5, -3) + tick(cx + BI - 4 - i * 3, 151 + i * 4, -5, -3);
    }
  }
  let innerBack = '', hatchBack = '';
  if (tBk >= 0.4) {
    for (let i = 0; i < 3; i++) {
      hatchBack += tick(cx - LAT + 3 + i * 4, 150 + i * 7, 6, -3) + tick(cx + LAT - 3 - i * 4, 149 + i * 7, -6, -3);
    }
  }
  // 頸側排線（肩背夠壯才有）
  if (tSh + tBk >= 0.8) {
    hatchBack += tick(cx - 13, 70, 3, 6) + tick(cx - 8, 68, 2, 7) + tick(cx + 13, 70, -3, 6) + tick(cx + 8, 68, -2, 7);
  }
  // 腹部
  let innerCore = '', hatchCore = '';
  if (belly) {
    innerCore = `<path d="M ${RD(cx - WA * 0.75)} 208 Q ${cx} 216 ${RD(cx + WA * 0.75)} 208" fill="none"/>
      <ellipse cx="${cx}" cy="182" rx="${RD(WA * 0.85)}" ry="26" fill="none" opacity="0.35"/>`;
  } else if (tCo >= 0.25 || endur >= 0.5) {
    const aw = clamp(WA * 0.72, 13, 19);
    innerCore = `<path d="M ${cx} 148 L ${cx} 212"/>
      <path d="M ${RD(cx - aw)} 158 Q ${cx} 163 ${RD(cx + aw)} 158 M ${RD(cx - aw - 1)} 175 Q ${cx} 180 ${RD(cx + aw + 1)} 175 M ${RD(cx - aw + 1)} 192 Q ${cx} 197 ${RD(cx + aw - 1)} 192"/>`;
    if (tCo >= 0.3) innerCore += `<path d="M ${RD(cx - aw - 3)} 152 Q ${RD(cx - aw - 7)} 180 ${RD(cx - aw - 1)} 208 M ${RD(cx + aw + 3)} 151 Q ${RD(cx + aw + 7)} 179 ${RD(cx + aw + 1)} 207"/>`;
    if (tCo >= 0.45) {
      innerCore += `<path d="M ${RD(cx - LAT + 2)} 160 Q ${cx - 32} 182 ${RD(cx - WA - 3)} 204 M ${RD(cx + LAT - 2)} 159 Q ${cx + 32} 181 ${RD(cx + WA + 3)} 203"/>`;
      for (let i = 0; i < 3; i++) {
        hatchCore += tick(cx - WA - 2 - i * 2, 200 - i * 13, 5, -4) + tick(cx + WA + 2 + i * 2, 199 - i * 13, -5, -4);
      }
    }
  } else {
    innerCore = `<path d="M ${cx} 150 L ${cx} 210" opacity="0.4"/>`;
  }
  // 腿
  let innerLeg = '', hatchLeg = '';
  if (tLg >= 0.4) {
    innerLeg = `<path d="M ${RD(cx - TH + 4)} ${LY(250)} Q ${cx - 20} ${LY(272)} ${cx - 19} ${LY(KN - 14)} M ${RD(cx + TH - 4)} ${LY(249)} Q ${cx + 20} ${LY(271)} ${cx + 19} ${LY(KN - 15)}"/>`;
    for (let i = 0; i < 3; i++) {
      hatchLeg += tick(cx - TH + 8 + i * 4, LY(KN - 20 + i * 4), 5, -4) + tick(cx + TH - 8 - i * 4, LY(KN - 21 + i * 4), -5, -4);
    }
  }
  if (tLg >= 0.5) {
    innerLeg += `<path d="M ${RD(cx - CO - 1)} ${LY(KN + 6)} Q ${cx - 17} ${LY(KN + 18)} ${cx - 14} ${LY(KN + 28)} M ${RD(cx + CO + 1)} ${LY(KN + 5)} Q ${cx + 17} ${LY(KN + 17)} ${cx + 14} ${LY(KN + 27)}"/>`;
    for (let i = 0; i < 3; i++) {
      hatchLeg += tick(cx - CO + 4 + i * 3, LY(KN + 24 + i * 3), 4, -5) + tick(cx + CO - 4 - i * 3, LY(KN + 23 + i * 3), -4, -5);
    }
  }

  // ── 拳頭 + 腕帶(s1) ──
  const fistX = Math.max(BI - 13, WA + 16), fistY = 189;
  const fistR = LP(10, 13.5, tArm);
  const fists = [-1, 1].map(s2 => { const fx = RD(cx + s2 * fistX);
    return `<circle cx="${fx}" cy="${fistY}" r="${RD(fistR)}" fill="${SKIN}" stroke="${OUT}" stroke-width="4.4"/>
      <path d="M ${RD(fx - s2 * fistR * 0.45)} ${fistY - 7} Q ${RD(fx - s2 * fistR * 0.8)} ${fistY} ${RD(fx - s2 * fistR * 0.45)} ${fistY + 7}"
        fill="none" stroke="${OUT}" stroke-width="1.6" opacity="0.7"/>
      ${si >= 1 ? `<rect x="${RD(fx - fistR + 1)}" y="${fistY - fistR - 9}" width="${RD(fistR * 2 - 2)}" height="8" rx="3.5" fill="#dc2626" stroke="${OUT}" stroke-width="2.4"/>` : ''}`;
  }).join('');

  // ── 短褲 + 腰帶(s3) ──
  const trunks = `<path d="M ${RD(cx - WA - 6)} 216 L ${RD(cx + WA + 6)} 215
      Q ${RD(cx + WA + 12)} 232 ${RD(cx + TH - 2)} ${LY(250)}
      L ${cx + 9} ${LY(248)} Q ${cx} ${LY(260)} ${cx - 9} ${LY(248)}
      L ${RD(cx - TH + 2)} ${LY(250)} Q ${RD(cx - WA - 12)} 232 ${RD(cx - WA - 6)} 216 Z"
      fill="${st.trunks}" stroke="${OUT}" stroke-width="4.4" stroke-linejoin="round"/>`;
  const belt = si >= 3 ? `<g>
      <rect x="${RD(cx - WA - 8)}" y="212" width="${RD(WA * 2 + 16)}" height="10" rx="4" fill="#fbbf24" stroke="${OUT}" stroke-width="2.8"/>
      <circle cx="${cx}" cy="217" r="7" fill="#fde68a" stroke="${OUT}" stroke-width="2.4"/>
      <circle cx="${cx}" cy="217" r="2.8" fill="#d97706"/>
    </g>` : '';

  // ── 靴子 ──
  const boots = [-1, 1].map(s => { const o = x => RD(cx + s * x);
    return `<path d="M ${o(4)} ${LY(ANK - 5)} L ${o(3)} ${LY(FT - 4)} Q ${o(13)} ${LY(FT + 4)} ${o(29)} ${LY(FT - 1)} L ${o(21)} ${LY(ANK - 5)} Q ${o(12)} ${LY(ANK - 9)} ${o(4)} ${LY(ANK - 5)} Z"
      fill="${st.boots}" stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"/>`; }).join('');

  // ── 臉 + 髮 ──
  const brows = resting
    ? `<path d="M ${cx - 13} ${hy - 1} L ${cx - 4} ${hy} M ${cx + 13} ${hy - 2} L ${cx + 4} ${hy}" stroke="${OUT}" stroke-width="3" stroke-linecap="round" fill="none"/>`
    : `<path d="M ${cx - 14} ${hy - 3} L ${cx - 4} ${hy + 1} M ${cx + 14} ${hy - 4} L ${cx + 4} ${hy + 1}" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;
  const eyes = resting
    ? `<path d="M ${cx - 11} ${hy + 6} q 3.5 3 7 0 M ${cx + 4} ${hy + 6} q 3.5 3 7 0" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`
    : `<circle cx="${cx - 8}" cy="${hy + 6}" r="2.5" fill="${OUT}"/><circle cx="${cx + 8}" cy="${hy + 6}" r="2.5" fill="${OUT}"/>`;
  const lash = g === 'f' && !resting
    ? `<path d="M ${cx - 11.5} ${hy + 3.5} l -3 -2 M ${cx + 11.5} ${hy + 3.5} l 3 -2" stroke="${OUT}" stroke-width="1.7" stroke-linecap="round"/>` : '';
  const mouth = resting
    ? `<path d="M ${cx - 4} ${hy + 15} q 4 2.5 8 0" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`
    : `<path d="M ${cx - 7} ${hy + 14} Q ${cx} ${hy + 19} ${cx + 8} ${hy + 13} L ${cx + 5} ${hy + 16.5} Q ${cx} ${hy + 19.5} ${cx - 4} ${hy + 16.5} Z" fill="#fff" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>`;

  const hairM = `<path d="M ${RD(cx - HD * 0.95)} ${hy - 5}
      L ${RD(cx - HD * 0.9)} ${hy - 23} L ${RD(cx - HD * 0.5)} ${hy - 15}
      L ${RD(cx - HD * 0.32)} ${hy - 29} L ${RD(cx - HD * 0.05)} ${hy - 17}
      L ${RD(cx + HD * 0.22)} ${hy - 28} L ${RD(cx + HD * 0.45)} ${hy - 16}
      L ${RD(cx + HD * 0.85)} ${hy - 24} L ${RD(cx + HD * 0.95)} ${hy - 5}
      Q ${cx} ${hy - 13} ${RD(cx - HD * 0.95)} ${hy - 5} Z"
      fill="#241812" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`;
  const hairFBack = `<path d="M ${RD(cx - HD - 3)} ${hy - 2} Q ${RD(cx - HD - 10)} ${hy + 36} ${RD(cx - HD + 3)} ${hy + 50} L ${RD(cx - HD + 6)} ${hy + 4} Z" fill="#3d2413" stroke="${OUT}" stroke-width="3"/>
      <path d="M ${RD(cx + HD + 3)} ${hy - 2} Q ${RD(cx + HD + 10)} ${hy + 36} ${RD(cx + HD - 3)} ${hy + 50} L ${RD(cx + HD - 6)} ${hy + 4} Z" fill="#3d2413" stroke="${OUT}" stroke-width="3"/>`;
  const hairF = `<path d="M ${RD(cx - HD * 0.95)} ${hy - 4}
      Q ${RD(cx - HD * 0.5)} ${hy - 28} ${RD(cx + HD * 0.15)} ${hy - 25}
      Q ${RD(cx + HD * 0.75)} ${hy - 27} ${RD(cx + HD * 0.95)} ${hy - 4}
      Q ${cx} ${hy - 14} ${RD(cx - HD * 0.95)} ${hy - 4} Z"
      fill="#3d2413" stroke="${OUT}" stroke-width="3"/>
      <path d="M ${RD(cx + HD * 0.5)} ${hy - 24} Q ${RD(cx + HD + 15)} ${hy + 2} ${RD(cx + HD + 7)} ${hy + 42} Q ${RD(cx + HD + 2)} ${hy + 20} ${RD(cx + HD * 0.75)} ${hy - 10} Z"
      fill="#3d2413" stroke="${OUT}" stroke-width="3"/>`;

  const headband = si >= 2 ? `<rect x="${RD(cx - HD + 1)}" y="${hy - 13}" width="${RD(HD * 2 - 2)}" height="7" rx="3.5" fill="#dc2626" stroke="${OUT}" stroke-width="2.2"/>` : '';
  const crown = si >= 5 ? `<path d="M ${cx - 13} ${hy - 22} L ${cx - 10} ${hy - 34} L ${cx - 4} ${hy - 24} L ${cx} ${hy - 37} L ${cx + 4} ${hy - 24} L ${cx + 10} ${hy - 34} L ${cx + 13} ${hy - 22} Z"
      fill="#fbbf24" stroke="${OUT}" stroke-width="2.8" stroke-linejoin="round"/>` : '';

  const cape = si >= 4 ? `<path d="M ${RD(cx - DT + 6)} 92
      Q ${RD(cx - DT - 22)} 200 ${RD(cx - DT - 6)} ${LY(300)}
      L ${RD(cx + DT + 6)} ${LY(300)}
      Q ${RD(cx + DT + 22)} 200 ${RD(cx + DT - 6)} 92 Z"
      fill="#b91c1c" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>` : '';
  const aura = si >= 5 ? `<circle cx="${cx}" cy="190" r="${RD(DT + 78)}" fill="#fbbf24" opacity="0.13"/>` : '';
  const wind = endur >= 0.8 ? `<g id="av-wind" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M ${RD(cx - DT - 34)} ${LY(FT - 8)} h 18" opacity="0.55"/>
      <path d="M ${RD(cx - DT - 24)} ${LY(FT + 2)} h 24" opacity="0.35"/>
      <path d="M ${RD(cx + DT + 16)} ${LY(FT - 8)} h 18" opacity="0.55"/>
      <path d="M ${RD(cx + DT)} ${LY(FT + 2)} h 24" opacity="0.35"/>
    </g>` : '';

  const restOverlay = resting ? `<g>
      <rect x="${RD(cx + 2)}" y="${hy - 26}" width="${RD(HD * 1.1)}" height="8" rx="4" fill="#f8fafc" stroke="${OUT}" stroke-width="2" transform="rotate(-14 ${RD(cx + 10)} ${hy - 22})"/>
      <text x="${RD(cx + HD + 12)}" y="${hy - 26}" font-size="15" font-weight="900" fill="${OUT}" transform="rotate(12 ${RD(cx + HD + 12)} ${hy - 26})">Z</text>
      <text x="${RD(cx + HD + 25)}" y="${hy - 36}" font-size="11" font-weight="900" fill="${OUT}" opacity="0.7" transform="rotate(12 ${RD(cx + HD + 25)} ${hy - 36})">z</text>
    </g>` : '';

  // ── 部位覆蓋形：GSAP 發光用（glow-*）；衰退變暗共用同形 ──
  const region = {
    chest:     `<rect x="${RD(cx - AP)}" y="96" width="${RD(AP * 2)}" height="${RD(pecBot - 94)}" rx="14"/>`,
    shoulders: `<circle cx="${RD(cx - DT + 8)}" cy="104" r="17"/><circle cx="${RD(cx + DT - 8)}" cy="103" r="17"/>`,
    back:      `<path d="M ${RD(cx - LAT)} 130 L ${RD(cx - WA - 2)} 200 L ${RD(cx - WA + 10)} 200 L ${RD(cx - LAT + 16)} 130 Z"/><path d="M ${RD(cx + LAT)} 129 L ${RD(cx + WA + 2)} 199 L ${RD(cx + WA - 10)} 199 L ${RD(cx + LAT - 16)} 129 Z"/>`,
    biceps:    `<circle cx="${RD(cx - BI + 9)}" cy="142" r="14"/><circle cx="${RD(cx + BI - 9)}" cy="141" r="14"/>`,
    triceps:   `<circle cx="${RD(cx - BI + 11)}" cy="172" r="12"/><circle cx="${RD(cx + BI - 11)}" cy="171" r="12"/>`,
    core:      `<rect x="${RD(cx - WA * 0.8)}" y="150" width="${RD(WA * 1.6)}" height="60" rx="10"/>`,
    legs:      `<rect x="${RD(cx - TH - 2)}" y="${LY(238)}" width="${RD(TH + 4)}" height="${RD(80 * legLen)}" rx="14"/><rect x="${RD(cx - 2)}" y="${LY(237)}" width="${RD(TH + 4)}" height="${RD(80 * legLen)}" rx="14"/>`,
  };
  let overlays = '';
  Object.keys(region).forEach(p => {
    overlays += `<g id="glow-${p}" fill="#fff" opacity="0" style="mix-blend-mode:overlay">${region[p]}</g>`;
    if (dim.has(p)) overlays += `<g fill="#1b2430" opacity="0.35">${region[p]}</g>`;
  });

  const iw = `fill="none" stroke="${OUT}" stroke-width="1.8" opacity="0.8" stroke-linecap="round"`;
  const hw = `stroke="${OUT}" stroke-width="1.4" opacity="0.5" fill="none" stroke-linecap="round"`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    ${aura}
    ${cape}
    ${g === 'f' ? hairFBack : ''}
    <path d="${leg(-1)}" fill="${SKIN}" stroke="${OUT}" stroke-width="4.6" stroke-linejoin="round"/>
    <path d="${leg(1)}" fill="${SKIN}" stroke="${OUT}" stroke-width="4.6" stroke-linejoin="round"/>
    <g id="av-legs"><g ${iw}>${innerLeg}</g><path d="${hatchLeg}" ${hw}/></g>
    <path d="${neck}" fill="${SKIN}" stroke="${OUT}" stroke-width="4"/>
    <path d="${torsoArms}" fill="${SKIN}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <g id="av-back"><path d="${hatchBack}" ${hw}/></g>
    <g id="av-shoulders"><g ${iw}>${innerSh}</g><path d="${hatchSh}" ${hw}/></g>
    <g id="av-chest"><g ${iw}>${innerChest}</g><path d="${hatchChest}" ${hw}/></g>
    <g id="av-core"><g ${iw}>${innerCore}</g><path d="${hatchCore}" ${hw}/></g>
    <g id="av-arms"><g ${iw}>${innerArm}</g><path d="${hatchArm}" ${hw}/></g>
    ${trunks}${belt}
    ${boots}
    ${fists}
    <path d="${headP}" fill="${SKIN}" stroke="${OUT}" stroke-width="4.2"/>
    ${g === 'f' ? hairF : hairM}
    ${headband}${crown}
    ${brows}${eyes}${lash}
    <circle cx="${cx - 14}" cy="${hy + 10}" r="3" fill="#ef8d66" opacity="0.4"/>
    <circle cx="${cx + 14}" cy="${hy + 10}" r="3" fill="#ef8d66" opacity="0.4"/>
    ${mouth}
    ${overlays}
    ${wind}
    ${restOverlay}
  </svg>`;
}

const KinnikuAvatar = { buildKinniku, STAGE_STYLE };
if (typeof module !== 'undefined' && module.exports) module.exports = KinnikuAvatar;
if (typeof window !== 'undefined') Object.assign(window, KinnikuAvatar);
})();
