// ── 筋肉人角色生成器 ────────────────────────────────────────────────────────
//
// 程式生成 SVG，由部位分數驅動體型：
//   視覺量體 = BMI 基準 × (1 + 係數 × 部位分數/100)
// 失衡會被誠實畫出來（上壯下細 = 經典雞腿身材）。
// 風格：粗黑描邊、誇張肌肉塊、漫畫排線陰影、熱血比例（頭小身大）。
//
// buildKinniku(opts)：
//   gender 'm'|'f'、height cm、weight kg、
//   scores {chest,back,legs,shoulders,biceps,triceps,core}（0-100）、
//   endurance 0-100、stageIndex 0-5、resting bool、dimParts ['legs',...]
// 每個部位都包在 g#av-<part>，供 GSAP 做部位發光/膨脹動畫。

(function () {
'use strict';

// 六階段（稱號沿用，配件筋肉人化：腕帶→頭帶→冠軍腰帶→披風→皇冠+金氣場）
const STAGE_STYLE = [
  { title: '健身新手',   trunks: '#64748b', boots: '#475569' },
  { title: '運動愛好者', trunks: '#0284c7', boots: '#075985' },
  { title: '健身達人',   trunks: '#059669', boots: '#065f46' },
  { title: '肌肉戰士',   trunks: '#ea580c', boots: '#9a3412' },
  { title: '健身大師',   trunks: '#7c3aed', boots: '#5b21b6' },
  { title: '傳奇冠軍',   trunks: '#d97706', boots: '#92400e' },
];

const OUT = '#1d130c';       // 描邊
const SKIN = '#f2b380';      // 膚色
const SKIN_D = '#d68d55';    // 陰影膚色
const OW = 4;                // 描邊寬

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const R = n => Math.round(n * 10) / 10;

// 雙描邊四肢：同一路徑先粗描邊、再膚色，得到有輪廓的膠囊肢體
function limb(d, w, fill) {
  return `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${R(w + OW * 2)}" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${d}" fill="none" stroke="${fill || SKIN}" stroke-width="${R(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function ball(cx, cy, r, fill) {
  return `<circle cx="${R(cx)}" cy="${R(cy)}" r="${R(r)}" fill="${fill || SKIN}" stroke="${OUT}" stroke-width="${OW}"/>`;
}
// 漫畫排線：從 (x,y) 起畫 n 條平行短線
function hatch(x, y, n, len, dx, dy, gapx, gapy, w, op) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<line x1="${R(x + i * gapx)}" y1="${R(y + i * gapy)}" x2="${R(x + i * gapx + dx * len)}" y2="${R(y + i * gapy + dy * len)}"/>`;
  }
  return `<g stroke="${OUT}" stroke-width="${w || 1.8}" opacity="${op || 0.45}" stroke-linecap="round">${s}</g>`;
}

function buildKinniku(opts) {
  const g = opts.gender === 'f' ? 'f' : 'm';
  const h = clamp(parseFloat(opts.height) || 170, 100, 250);
  const wt = clamp(parseFloat(opts.weight) || 65, 25, 300);
  const sc = opts.scores || {};
  const t = p => clamp(sc[p] || 0, 0, 100) / 100;
  const endur = clamp(opts.endurance || 0, 0, 100) / 100;
  const si = clamp(opts.stageIndex || 0, 0, 5);
  const st = STAGE_STYLE[si];
  const dim = new Set(opts.dimParts || []);
  const resting = !!opts.resting;

  // ── 基準體型：BMI → 量體基準；身高 → 腿長 ──
  const bmi = wt / Math.pow(h / 100, 2);
  const bmiT = clamp((bmi - 17) / 13, 0, 1);          // 17(瘦)–30(壯)
  const base = lerp(0.9, 1.2, bmiT);                   // 全身量體基準
  const legLen = lerp(0.92, 1.1, clamp((h - 155) / 35, 0, 1));

  // ── 部位 → 幾何參數（視覺 = 基準 × (1 + 係數 × 分數)）──
  const SW  = 33 * base * (1 + 0.5 * t('shoulders') + 0.16 * t('back')); // 肩半寬
  const dR  = 10.5 * base * (1 + 0.8 * t('shoulders'));                  // 三角肌球
  const latW = SW * (0.8 + 0.28 * t('back'));                            // 背闊半寬
  const pecW = SW * 0.6, pecH = 22 * (1 + 0.55 * t('chest'));            // 胸肌板
  const coreT = t('core');
  const waist = 23 * lerp(0.95, 1.32, bmiT) * (1 - 0.16 * coreT - 0.06 * endur); // 腰半寬
  const belly = bmi >= 26 && coreT < 0.4;                                // 肚腩
  const armW = 9 * base * (1 + 1.15 * (0.6 * t('biceps') + 0.4 * t('triceps')));
  const foreW = 7 * base * (1 + 0.85 * (0.35 * t('biceps') + 0.65 * t('triceps')));
  const biR = armW * 0.62 + 6.5 * t('biceps');                           // 二頭球
  const thW = 10.5 * base * (1 + 1.15 * t('legs'));                      // 大腿
  const caW = 7.5 * base * (1 + 0.95 * t('legs'));                       // 小腿

  // ── 骨架座標 ──
  const cx = 130;
  const headR = 22, hy = 52;
  const neckY = hy + headR - 4, shY = 98;
  const waistY = 178, trunkY = waistY - 4, trunkH = 30;
  const hipY = trunkY + trunkH - 6;
  const kneeY = hipY + 46 * legLen, ankleY = kneeY + 42 * legLen, footY = ankleY + 12;
  const hipX = 15;

  const dimg = p => dim.has(p) ? ' opacity="0.5" filter="url(#av-dim)"' : '';

  // ── 手臂（微彎的秀肌肉垂放）──
  const shPx = SW - 4;
  const elbX = SW + 13, elbY = shY + 46;
  const fistX = SW + 9, fistY = shY + 88;
  const arm = s => { // s = 1 右 / -1 左
    const px = cx + s * shPx, ex = cx + s * elbX, fx = cx + s * fistX;
    const upper = `M ${R(px)} ${shY + 4} Q ${R(px + s * 12)} ${shY + 20} ${R(ex)} ${elbY}`;
    const fore  = `M ${R(ex)} ${elbY} Q ${R(ex + s * 3)} ${elbY + 22} ${R(fx)} ${fistY}`;
    return `<g id="av-arm-${s > 0 ? 'r' : 'l'}">
      <g id="av-triceps${s > 0 ? '' : '-l'}"${s > 0 ? dimg('triceps') : ''}>${limb(upper, armW * 2)}</g>
      <g${dimg('triceps')}>${limb(fore, foreW * 2)}</g>
      <g id="av-biceps${s > 0 ? '' : '-l'}"${s > 0 ? dimg('biceps') : ''}>
        ${ball(cx + s * (shPx + 7), shY + 24, biR)}
        ${t('biceps') >= 0.35 ? hatch(cx + s * (shPx + 4) - 3, shY + 27, 3, 6, s * 0.5, 0.87, s * 3.5, -1.5, 1.5, 0.35) : ''}
      </g>
      ${ball(cx + s * fistX, fistY + 4, foreW * 0.95)}
      ${si >= 1 ? `<rect x="${R(cx + s * (fistX + (s > 0 ? -foreW : foreW)) - (s > 0 ? 0 : foreW * 0.9))}" y="${fistY - 14}" width="${R(foreW * 1.9)}" height="9" rx="4" fill="#dc2626" stroke="${OUT}" stroke-width="2.5" transform="rotate(${s * 8} ${R(cx + s * fistX)} ${fistY - 10})"/>` : ''}
    </g>`;
  };

  // ── 腿 ──
  const leg = s => {
    const hx = cx + s * hipX, kx = cx + s * (hipX + 3), ax = cx + s * (hipX + 1);
    const thigh = `M ${R(hx)} ${R(hipY)} Q ${R(hx + s * 4)} ${R(hipY + 20)} ${R(kx)} ${R(kneeY)}`;
    const calf  = `M ${R(kx)} ${R(kneeY)} Q ${R(kx + s * 2)} ${R(kneeY + 16)} ${R(ax)} ${R(ankleY)}`;
    return `<g>
      ${limb(thigh, thW * 2)}
      ${limb(calf, caW * 2)}
      ${t('legs') >= 0.45 ? `<path d="M ${R(hx - s * thW * 0.35)} ${R(hipY + 12)} Q ${R(hx - s * thW * 0.15)} ${R(hipY + 30)} ${R(kx - s * 3)} ${R(kneeY - 6)}" fill="none" stroke="${OUT}" stroke-width="2" opacity="0.4" stroke-linecap="round"/>` : ''}
      ${t('legs') >= 0.55 ? `<path d="M ${R(kx + s * caW * 0.45)} ${R(kneeY + 8)} Q ${R(kx + s * caW * 0.7)} ${R(kneeY + 18)} ${R(kx + s * caW * 0.3)} ${R(kneeY + 26)}" fill="none" stroke="${OUT}" stroke-width="2" opacity="0.4" stroke-linecap="round"/>` : ''}
    </g>`;
  };
  // 靴子
  const boot = s => {
    const ax = cx + s * (hipX + 1);
    return `<g>
      <path d="M ${R(ax - 8)} ${R(ankleY - 6)} L ${R(ax - 8)} ${R(footY - 4)} Q ${R(ax + s * 2)} ${R(footY + 3)} ${R(ax + s * 14)} ${R(footY)} L ${R(ax + s * 14)} ${R(footY - 5)} Q ${R(ax + s * 8)} ${R(footY - 8)} ${R(ax + 8)} ${R(ankleY - 6)} Z"
        fill="${st.boots}" stroke="${OUT}" stroke-width="${OW}" stroke-linejoin="round"/>
      <line x1="${R(ax - 7)}" y1="${R(ankleY + 1)}" x2="${R(ax + 7)}" y2="${R(ankleY + 1)}" stroke="${OUT}" stroke-width="2" opacity="0.6"/>
    </g>`;
  };

  // ── 軀幹剪影（斜方肌→三角肌外緣→背闊→腰→髖）──
  const torso = `M ${R(cx - 12)} ${R(neckY)}
    Q ${R(cx - SW * 0.55)} ${R(shY - 16)} ${R(cx - shPx)} ${R(shY - 6)}
    Q ${R(cx - latW - 6)} ${R(shY + 14)} ${R(cx - latW)} ${R(shY + 26)}
    Q ${R(cx - waist - 4)} ${R(waistY - 18)} ${R(cx - waist)} ${R(waistY)}
    L ${R(cx - waist - 1)} ${R(trunkY + 10)}
    L ${R(cx + waist + 1)} ${R(trunkY + 10)}
    L ${R(cx + waist)} ${R(waistY)}
    Q ${R(cx + waist + 4)} ${R(waistY - 18)} ${R(cx + latW)} ${R(shY + 26)}
    Q ${R(cx + latW + 6)} ${R(shY + 14)} ${R(cx + shPx)} ${R(shY - 6)}
    Q ${R(cx + SW * 0.55)} ${R(shY - 16)} ${R(cx + 12)} ${R(neckY)} Z`;

  // ── 胸肌板 ──
  const pecTop = shY + 2, pecBot = pecTop + pecH;
  const pec = s => `<path d="M ${R(cx + s * 2)} ${pecTop}
      L ${R(cx + s * pecW)} ${pecTop + 3}
      Q ${R(cx + s * (pecW + 6))} ${R(lerp(pecTop, pecBot, 0.6))} ${R(cx + s * pecW * 0.72)} ${R(pecBot)}
      Q ${R(cx + s * pecW * 0.3)} ${R(pecBot + 5)} ${R(cx + s * 2)} ${R(pecBot - 2)} Z"
      fill="${SKIN}" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>`;
  const pecShade = s => t('chest') > 0.25
    ? hatch(cx + s * pecW * 0.45 - 6, pecBot - 7, 4, 8, s * 0.26, -0.97, s * 5, 1, 1.7, 0.42) : '';

  // ── 腹部：腹肌塊 / 平滑 / 肚腩 ──
  const absTop = pecBot + 6, absBot = trunkY - 2;
  const absW = waist * 0.62;
  let absSvg = '';
  if (belly) {
    absSvg = `<ellipse cx="${cx}" cy="${R((absTop + absBot) / 2 + 4)}" rx="${R(waist * 0.82)}" ry="${R((absBot - absTop) / 2 + 6)}"
      fill="${SKIN}" stroke="${OUT}" stroke-width="3.2"/>
      <path d="M ${R(cx - waist * 0.5)} ${R(absBot - 2)} Q ${cx} ${R(absBot + 6)} ${R(cx + waist * 0.5)} ${R(absBot - 2)}" fill="none" stroke="${OUT}" stroke-width="2" opacity="0.5"/>`;
  } else if (coreT > 0.2 || endur >= 0.5) {
    const rows = 3, rh = (absBot - absTop) / rows;
    let blocks = '';
    for (let r = 0; r < rows; r++) {
      for (const s of [-1, 1]) {
        blocks += `<rect x="${R(cx + (s > 0 ? 2 : -absW - 2))}" y="${R(absTop + r * rh + 1)}"
          width="${R(absW)}" height="${R(rh - 2.5)}" rx="${R(rh * 0.32)}"
          fill="${SKIN}" stroke="${OUT}" stroke-width="${lerp(1.6, 2.8, coreT)}" opacity="${lerp(0.5, 1, Math.max(coreT, endur * 0.8))}"/>`;
      }
    }
    absSvg = blocks;
  } else {
    absSvg = `<line x1="${cx}" y1="${absTop}" x2="${cx}" y2="${absBot}" stroke="${OUT}" stroke-width="2" opacity="0.35"/>`;
  }

  // ── 短褲 + 腰帶 ──
  const trunkW = waist + 5;
  const trunks = `<path d="M ${R(cx - trunkW)} ${trunkY}
      L ${R(cx + trunkW)} ${trunkY}
      L ${R(cx + trunkW + 2)} ${trunkY + trunkH - 8}
      L ${R(cx + hipX + thW * 0.7)} ${R(trunkY + trunkH)}
      L ${R(cx + 6)} ${R(trunkY + trunkH - 4)}
      Q ${cx} ${R(trunkY + trunkH + 4)} ${R(cx - 6)} ${R(trunkY + trunkH - 4)}
      L ${R(cx - hipX - thW * 0.7)} ${R(trunkY + trunkH)}
      L ${R(cx - trunkW - 2)} ${trunkY + trunkH - 8} Z"
      fill="${st.trunks}" stroke="${OUT}" stroke-width="${OW}" stroke-linejoin="round"/>`;
  const belt = si >= 3 ? `<g id="av-belt">
      <rect x="${R(cx - trunkW - 2)}" y="${trunkY - 2}" width="${R(trunkW * 2 + 4)}" height="10" rx="4" fill="#fbbf24" stroke="${OUT}" stroke-width="3"/>
      <circle cx="${cx}" cy="${trunkY + 3}" r="7.5" fill="#fde68a" stroke="${OUT}" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${trunkY + 3}" r="3" fill="#d97706" stroke="none"/>
    </g>` : '';

  // ── 頭 ──
  const jaw = `<path d="M ${R(cx - headR + 3)} ${R(hy + 6)}
      Q ${R(cx - headR)} ${R(hy + headR)} ${cx} ${R(hy + headR + 4)}
      Q ${R(cx + headR)} ${R(hy + headR)} ${R(cx + headR - 3)} ${R(hy + 6)}
      Q ${R(cx + headR + 1)} ${R(hy - headR * 0.7)} ${cx} ${R(hy - headR)}
      Q ${R(cx - headR - 1)} ${R(hy - headR * 0.7)} ${R(cx - headR + 3)} ${R(hy + 6)} Z"
      fill="${SKIN}" stroke="${OUT}" stroke-width="${OW}"/>`;

  const hairM = `<path d="M ${R(cx - headR + 1)} ${R(hy - 2)}
      L ${R(cx - headR - 3)} ${R(hy - headR * 0.9)}
      L ${R(cx - headR * 0.55)} ${R(hy - headR * 0.75)}
      L ${R(cx - headR * 0.3)} ${R(hy - headR - 6)}
      L ${R(cx + headR * 0.05)} ${R(hy - headR * 0.8)}
      L ${R(cx + headR * 0.4)} ${R(hy - headR - 4)}
      L ${R(cx + headR * 0.6)} ${R(hy - headR * 0.7)}
      L ${R(cx + headR + 3)} ${R(hy - headR * 0.85)}
      L ${R(cx + headR - 1)} ${R(hy - 2)}
      Q ${cx} ${R(hy - headR * 1.02)} ${R(cx - headR + 1)} ${R(hy - 2)} Z"
      fill="#2f2019" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`;
  const hairF = `
      <path d="M ${R(cx - headR - 2)} ${R(hy)} Q ${R(cx - headR - 9)} ${R(hy + 34)} ${R(cx - headR + 5)} ${R(hy + 44)} L ${R(cx - headR + 7)} ${R(hy + 4)} Z" fill="#4a2c17" stroke="${OUT}" stroke-width="3"/>
      <path d="M ${R(cx + headR + 2)} ${R(hy)} Q ${R(cx + headR + 9)} ${R(hy + 34)} ${R(cx + headR - 5)} ${R(hy + 44)} L ${R(cx + headR - 7)} ${R(hy + 4)} Z" fill="#4a2c17" stroke="${OUT}" stroke-width="3"/>
      <path d="M ${R(cx - headR + 1)} ${R(hy - 2)}
        Q ${R(cx - headR * 0.5)} ${R(hy - headR - 7)} ${R(cx + headR * 0.15)} ${R(hy - headR * 0.95)}
        Q ${R(cx + headR * 0.7)} ${R(hy - headR - 3)} ${R(cx + headR - 1)} ${R(hy - 2)}
        Q ${cx} ${R(hy - headR * 1.05)} ${R(cx - headR + 1)} ${R(hy - 2)} Z"
        fill="#4a2c17" stroke="${OUT}" stroke-width="3"/>
      <path d="M ${R(cx + headR * 0.55)} ${R(hy - headR)} Q ${R(cx + headR + 14)} ${R(hy + 6)} ${R(cx + headR + 6)} ${R(hy + 40)} Q ${R(cx + headR + 1)} ${R(hy + 20)} ${R(cx + headR * 0.8)} ${R(hy - headR * 0.4)} Z"
        fill="#4a2c17" stroke="${OUT}" stroke-width="3"/>`;

  // 臉：粗眉 + 小眼 + 表情（休養時閉眼）
  const brow = s => `<path d="M ${R(cx + s * 15)} ${R(hy - 3)} Q ${R(cx + s * 8)} ${R(hy - 7)} ${R(cx + s * 3.5)} ${R(hy - 4)}"
      fill="none" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/>`;
  const eyes = resting
    ? `<path d="M ${R(cx - 12)} ${R(hy + 4)} q 4 3 8 0 M ${R(cx + 4)} ${R(hy + 4)} q 4 3 8 0" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>`
    : `<circle cx="${R(cx - 8.5)}" cy="${R(hy + 3.5)}" r="3" fill="${OUT}"/>
       <circle cx="${R(cx + 8.5)}" cy="${R(hy + 3.5)}" r="3" fill="${OUT}"/>
       <circle cx="${R(cx - 7.6)}" cy="${R(hy + 2.6)}" r="1" fill="#fff"/>
       <circle cx="${R(cx + 9.4)}" cy="${R(hy + 2.6)}" r="1" fill="#fff"/>`;
  const lash = g === 'f' && !resting
    ? `<path d="M ${R(cx - 12.5)} ${R(hy + 1)} l -3 -2 M ${R(cx + 12.5)} ${R(hy + 1)} l 3 -2" stroke="${OUT}" stroke-width="1.8" stroke-linecap="round"/>` : '';
  const mouth = resting
    ? `<path d="M ${R(cx - 4)} ${R(hy + 13)} q 4 2 8 0" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`
    : `<path d="M ${R(cx - 6)} ${R(hy + 12)} q 6 5 12 0" fill="none" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
  const cheeks = `<circle cx="${R(cx - 15)}" cy="${R(hy + 9)}" r="3.5" fill="#ef8d66" opacity="0.4"/>
      <circle cx="${R(cx + 15)}" cy="${R(hy + 9)}" r="3.5" fill="#ef8d66" opacity="0.4"/>`;

  // 配件：頭帶(s2)、皇冠(s5)
  const headband = si >= 2 ? `<rect x="${R(cx - headR + 1)}" y="${R(hy - headR * 0.62)}" width="${R(headR * 2 - 2)}" height="7.5" rx="3.5" fill="#dc2626" stroke="${OUT}" stroke-width="2.5"/>` : '';
  const crown = si >= 5 ? `<path d="M ${R(cx - 15)} ${R(hy - headR - 3)} L ${R(cx - 11)} ${R(hy - headR - 16)} L ${R(cx - 5)} ${R(hy - headR - 5)} L ${cx} ${R(hy - headR - 19)} L ${R(cx + 5)} ${R(hy - headR - 5)} L ${R(cx + 11)} ${R(hy - headR - 16)} L ${R(cx + 15)} ${R(hy - headR - 3)} Z"
      fill="#fbbf24" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>` : '';

  // 披風(s4)、金氣場(s5)、耐力氣場(≥80)
  const cape = si >= 4 ? `<path d="M ${R(cx - shPx - 4)} ${R(shY - 4)}
      Q ${R(cx - SW - 26)} ${R(waistY + 30)} ${R(cx - SW - 10)} ${R(kneeY + 12)}
      L ${R(cx + SW + 10)} ${R(kneeY + 12)}
      Q ${R(cx + SW + 26)} ${R(waistY + 30)} ${R(cx + shPx + 4)} ${R(shY - 4)} Z"
      fill="#b91c1c" stroke="${OUT}" stroke-width="${OW}" stroke-linejoin="round"/>` : '';
  const aura = si >= 5 ? `<circle cx="${cx}" cy="${R((shY + kneeY) / 2)}" r="${R(SW + 62)}" fill="#fbbf24" opacity="0.14"/>` : '';
  const wind = endur >= 0.8 ? `<g stroke="#f59e0b" stroke-width="3" opacity="0.55" stroke-linecap="round">
      <path d="M ${R(cx - SW - 28)} ${R(footY - 6)} h 18 M ${R(cx - SW - 20)} ${R(footY + 2)} h 24 M ${R(cx + SW + 10)} ${R(footY - 6)} h 18 M ${R(cx + SW - 4)} ${R(footY + 2)} h 24" fill="none"/>
    </g>` : '';

  // 休養：頭上繃帶 + Zzz
  const restOverlay = resting ? `<g>
      <rect x="${R(cx + headR * 0.1)}" y="${R(hy - headR - 2)}" width="${R(headR * 1.1)}" height="9" rx="4" fill="#f8fafc" stroke="${OUT}" stroke-width="2" transform="rotate(-14 ${R(cx + headR * 0.6)} ${R(hy - headR + 2)})"/>
      <line x1="${R(cx + headR * 0.35)}" y1="${R(hy - headR + 1)}" x2="${R(cx + headR * 0.9)}" y2="${R(hy - headR - 3)}" stroke="#cbd5e1" stroke-width="1.6"/>
      <text x="${R(cx + headR + 14)}" y="${R(hy - headR - 6)}" font-size="15" font-weight="900" fill="${OUT}" transform="rotate(12 ${R(cx + headR + 14)} ${R(hy - headR - 6)})">Z</text>
      <text x="${R(cx + headR + 26)}" y="${R(hy - headR - 16)}" font-size="11" font-weight="900" fill="${OUT}" opacity="0.7" transform="rotate(12 ${R(cx + headR + 26)} ${R(hy - headR - 16)})">z</text>
    </g>` : '';

  // ── 組裝 ──
  return `<svg viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    <defs>
      <filter id="av-dim"><feColorMatrix type="saturate" values="0.45"/></filter>
    </defs>
    ${aura}
    ${cape}
    ${g === 'f' ? `<g>${hairF.split('</path>').slice(0, 2).join('</path>')}</path></g>` : ''}
    ${arm(-1)}${arm(1)}
    <g id="av-legs"${dimg('legs')}>${leg(-1)}${leg(1)}${boot(-1)}${boot(1)}</g>
    <g id="av-back"${dimg('back')}>
      <path d="${torso}" fill="${SKIN}" stroke="${OUT}" stroke-width="${OW}" stroke-linejoin="round"/>
      ${t('back') >= 0.35 ? hatch(cx - latW + 4, shY + 24, 3, 8, 0.42, 0.91, 3.5, 2.5, 1.6, 0.32) : ''}
      ${t('back') >= 0.35 ? hatch(cx + latW - 4 - 3.5, shY + 24, 3, 8, -0.42, 0.91, -3.5, 2.5, 1.6, 0.32) : ''}
    </g>
    <g id="av-shoulders"${dimg('shoulders')}>
      ${ball(cx - shPx, shY + 2, dR)}${ball(cx + shPx, shY + 2, dR)}
      ${t('shoulders') >= 0.35 ? hatch(cx - shPx - dR * 0.35, shY + dR * 0.25, 3, 5.5, 0.7, 0.7, 3.5, -1.8, 1.5, 0.35) : ''}
      ${t('shoulders') >= 0.35 ? hatch(cx + shPx + dR * 0.35 - 3.8, shY + dR * 0.25 - 3.5, 3, 5.5, -0.7, 0.7, -3.5, -1.8, 1.5, 0.35) : ''}
    </g>
    <g id="av-chest"${dimg('chest')}>${pec(-1)}${pec(1)}${pecShade(-1)}${pecShade(1)}</g>
    <g id="av-core"${dimg('core')}>${absSvg}</g>
    ${trunks}${belt}
    <g id="av-head">
      ${jaw}
      <path d="M ${R(cx - headR + 4)} ${R(hy + 10)} Q ${cx} ${R(hy + headR + 2)} ${R(cx + headR - 4)} ${R(hy + 10)} L ${R(cx + headR - 5)} ${R(hy + 7)} Q ${cx} ${R(hy + headR - 3)} ${R(cx - headR + 5)} ${R(hy + 7)} Z" fill="${SKIN_D}" opacity="0.35" stroke="none"/>
      ${g === 'f' ? hairF : hairM}
      ${headband}${crown}
      ${brow(-1)}${brow(1)}${eyes}${lash}${cheeks}${mouth}
    </g>
    ${wind}
    ${restOverlay}
  </svg>`;
}

const KinnikuAvatar = { buildKinniku, STAGE_STYLE };
if (typeof module !== 'undefined' && module.exports) module.exports = KinnikuAvatar;
if (typeof window !== 'undefined') Object.assign(window, KinnikuAvatar);
})();
