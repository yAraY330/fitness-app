// js/anim.js — Stage 5 動畫層 (GSAP + Lenis)
//
// 技能依據：
//   scroll-experience : Lenis lerp 0.08，vanilla JS RAF loop
//   gsap-timeline     : breathing 用 repeat:-1/yoyo；遇敵／結算／升級用 timeline + labels，tl.progress(1) 跳過
//   gsap-core         : steps() 逐格緩動（像素遊戲感）；autoAlpha；clearProps
//   gsap-utils        : grid stagger [rows, cols]（遇敵方塊）
//   impeccable        : animate.md——不用「每塊淡入上浮」（AI 招牌）、不用 bounce/elastic
//   ui-ux-pro-max     : duration 150-300ms、stagger 45ms、prefers-reduced-motion 支援
//
// 離線降級：CDN 載入失敗 → hasGsap()/Lenis 檢查直接 return，App 功能完整不受影響。

const ANIM = (() => {
  const hasGsap = () => typeof gsap !== 'undefined';
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Lenis 平滑滾動 ─────────────────────────────────────────────────────
  // scroll-experience: lerp 0.08 適合 PWA 快速頁面切換
  function initLenis() {
    if (typeof Lenis === 'undefined' || rm) return;
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  // ── 頁面切換：視窗從水平中線展開（JRPG 視窗語彙）─────────────────────
  // impeccable animate.md：「每個區塊淡入上浮」是 AI 動畫的招牌特徵 → 不再用
  // gsap-core：ease 'steps(3)' 逐格展開（像素介面的動態要像 8/16-bit 遊戲，不要平滑）
  // gsap-performance：只動 scaleY（transform），結束後 clearProps
  // 只展開最上面 3 個視窗、每個 120ms、間隔 60ms → 總長 ≤ 250ms（產品介面 150–250ms 規則）
  // back=true（返回上一頁）不播，返回要快
  function pageEnter(back) {
    if (!hasGsap() || rm || back) return;
    const wins = [...document.querySelectorAll('#content .win, #content .card')].slice(0, 3);
    wins.forEach((el, i) => openWindow(el, i * 0.06));
  }

  // 共用：視窗從中線展開
  function openWindow(el, delay = 0, duration = 0.12) {
    if (!hasGsap() || rm || !el) return null;
    return gsap.from(el, { scaleY: 0, transformOrigin: '50% 50%', duration, delay, ease: 'steps(3)', clearProps: 'transform' });
  }

  // 共用：全螢幕閃白（RPG 遇敵／升級的經典提示），回傳 timeline 片段
  function flash(times = 2) {
    const f = document.createElement('div');
    f.className = 'fx-flash';
    document.body.appendChild(f);
    const tl = gsap.timeline({ onComplete: () => f.remove() });
    for (let i = 0; i < times; i++) {
      tl.set(f, { autoAlpha: 1 }).set(f, { autoAlpha: 0 }, '+=0.05').set({}, {}, '+=0.04');
    }
    return tl;
  }

  // 共用：數字逐格累加（像 RPG 結算時經驗值跳動），steps 讓數字一格一格跳
  function countUp(el, from, to, duration, opts = {}) {
    const prefix = opts.prefix || '', suffix = opts.suffix || '';
    const o = { v: from };
    el.textContent = prefix + from + suffix;
    const n = Math.max(1, Math.min(12, Math.abs(to - from)));
    return gsap.to(o, { v: to, duration, ease: 'steps(' + n + ')',
      onUpdate: () => { el.textContent = prefix + Math.round(o.v) + suffix; } });
  }

  // 點一下就跳到動畫結尾（gsap-timeline：tl.progress(1)）
  function skippable(tl, layer) {
    layer.addEventListener('click', () => tl.progress(1), { once: true });
    return tl;
  }

  // ── 進入訓練：JRPG「遇敵」轉場 ─────────────────────────────────────────
  // 閃白 2 次 → 黑色方塊從中心往外鋪滿（gsap-utils grid stagger：grid:[rows, cols]、from:'center'）
  // → 蓋滿時呼叫 onCovered（底下換頁）→「修行開始！」視窗 → 方塊隨機溶解露出新頁
  // 總長約 1 秒，點擊任意處跳過。沒有 GSAP 或 reduced motion：直接換頁。
  function encounter(onCovered) {
    if (!hasGsap() || rm) { onCovered(); return; }
    const COLS = 8, ROWS = 14;
    const layer = document.createElement('div');
    layer.className = 'fx-layer';
    const grid = document.createElement('div');
    grid.className = 'fx-grid';
    grid.style.gridTemplateColumns = 'repeat(' + COLS + ',1fr)';
    grid.style.gridTemplateRows = 'repeat(' + ROWS + ',1fr)';
    grid.innerHTML = '<i></i>'.repeat(COLS * ROWS);
    const say = document.createElement('div');
    say.className = 'win fx-say';
    say.textContent = '修行開始！';
    layer.append(grid, say);
    document.body.appendChild(layer);
    const blocks = grid.querySelectorAll('i');
    gsap.set(blocks, { scale: 0 });
    gsap.set(say, { autoAlpha: 0, scaleY: 0 });
    let covered = false;
    const cover = () => { if (!covered) { covered = true; onCovered(); } };
    const tl = gsap.timeline({ onComplete: () => layer.remove() });
    tl.add(flash(2))
      .addLabel('cover')
      .to(blocks, { scale: 1, duration: 0.12, ease: 'steps(3)', stagger: { grid: [ROWS, COLS], from: 'center', amount: 0.28 } }, 'cover')
      .call(cover)
      .to(say, { autoAlpha: 1, scaleY: 1, duration: 0.12, ease: 'steps(3)' })
      .addLabel('reveal', '+=0.32')
      .to(say, { autoAlpha: 0, duration: 0.01 }, 'reveal')
      .to(blocks, { scale: 0, duration: 0.1, ease: 'steps(3)', stagger: { grid: [ROWS, COLS], from: 'random', amount: 0.24 } }, 'reveal');
    // 跳過時也要確保底下已換頁
    layer.addEventListener('click', () => { cover(); tl.progress(1); }, { once: true });
  }

  // ── 結束訓練：RPG「戰鬥結算」視窗 ──────────────────────────────────────
  // 視窗中線展開 → 逐行出現 → 經驗值數字逐格累加、EXP 條分段填滿 → 破紀錄行閃 3 下 → ▼ 閃爍等點擊
  // reduced motion / 無 GSAP：直接顯示最終狀態。點擊：動畫未完先跳到結尾，已完成則關閉。
  function battleResult(d, onClose) {
    const layer = document.createElement('div');
    layer.className = 'fx-layer fx-dim';
    const fromPct = Math.round(d.before.cur / d.before.need * 100);
    const toPct = d.levelUp ? 100 : Math.round(d.after.cur / d.after.need * 100);
    const prLine = d.prNames.length
      ? '<div class="fx-r-line fx-pr">突破紀錄！' + d.prNames.slice(0, 2).join('・') + (d.prNames.length > 2 ? '…' : '') + '</div>' : '';
    const lvLine = d.levelUp ? '<div class="fx-r-line fx-lvl">身體起了變化……！</div>' : '';
    layer.innerHTML =
      '<section class="win fx-result" role="dialog" aria-label="修行結算">' +
        '<div class="fx-r-title">修行完成！</div>' +
        '<div class="fx-r-line">鍛鍊部位：' + d.parts + '</div>' +
        '<div class="fx-r-line">獲得經驗值 <b class="fx-gain">+' + d.gain + '</b></div>' +
        '<div class="fx-r-bar"><span>EXP</span><div class="bar"><i style="width:' + toPct + '%"></i></div></div>' +
        prLine + lvLine +
        '<span class="more" aria-hidden="true">▼</span>' +
      '</section>';
    document.body.appendChild(layer);
    let done = false, tl = null;
    layer.addEventListener('click', () => {
      if (tl && tl.progress() < 1) { tl.progress(1); return; }
      if (done) return;
      done = true; layer.remove(); onClose();
    });
    if (!hasGsap() || rm) return;
    const win = layer.querySelector('.fx-result');
    const lines = win.querySelectorAll('.fx-r-title, .fx-r-line, .fx-r-bar');
    const gainEl = win.querySelector('.fx-gain');
    const fill = win.querySelector('.fx-r-bar .bar i');
    const blink = win.querySelectorAll('.fx-pr, .fx-lvl');
    gsap.set(lines, { autoAlpha: 0 });
    fill.style.width = fromPct + '%';
    tl = gsap.timeline();
    tl.from(win, { scaleY: 0, duration: 0.15, ease: 'steps(3)' })
      .to(lines, { autoAlpha: 1, duration: 0.01, stagger: 0.14 })
      .add(countUp(gainEl, 0, d.gain, 0.5, { prefix: '+' }), '-=0.25')
      .to(fill, { width: toPct + '%', duration: 0.5, ease: 'steps(8)' }, '<');
    if (blink.length) tl.to(blink, { autoAlpha: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.08 });
  }

  // ── 能力條：從左側逐格長出 ─────────────────────────────────────────────
  // gsap-performance：不動 width（會觸發重排），改動 scaleX（transform），寬度維持最終值
  // gsap-core：steps(6) 與整體像素動態一致
  function animScoreBars() {
    if (!hasGsap() || rm) return;
    document.querySelectorAll('[data-gsap="psr-bar"]').forEach(bar => {
      gsap.from(bar, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.36, ease: 'steps(6)', delay: 0.1, clearProps: 'transform' });
    });
  }

  // ── 首頁角色待機呼吸 + 耐力風動線條 ─────────────────────────────────────
  // 待機：像 RPG 精靈圖的兩格 idle（上下 3px、steps(1)），不用平滑的 sine 呼吸
  // gsap-core: wind paths stagger opacity — 只動 opacity，REDESIGN_PROMPT 1.5節 GSAP 動畫
  let _tl = null;
  function startBreathing() {
    if (!hasGsap() || rm) return;
    const el = document.getElementById('hero-avatar');
    if (!el) return;
    stopBreathing();
    _tl = gsap.timeline({ repeat: -1, yoyo: true })
      .to(el, { y: -3, duration: 0.6, ease: 'steps(1)' });
    const windPaths = el.querySelectorAll('#av-wind path');
    if (windPaths.length) {
      gsap.to(windPaths, {
        opacity: 0.1, duration: 0.55, repeat: -1, yoyo: true,
        stagger: 0.14, ease: 'sine.inOut'
      });
    }
  }
  function stopBreathing() {
    if (_tl) { _tl.kill(); _tl = null; }
    const windPaths = document.querySelectorAll('#av-wind path');
    if (windPaths.length) gsap.killTweensOf(windPaths);
  }

  // ── 部位發光（訓練儲存後延遲到返回首頁時觸發）────────────────────────────
  // avatar.js 已為每個部位預置 <g id="glow-<part>"> 白色覆蓋形（mix-blend-mode:overlay）
  // gsap-core: 只動 opacity（SVG 屬性），0 → 0.9 → 0
  let _glowPart = null;
  function queuePartGlow(partId) { _glowPart = partId; }
  function flushPartGlow() {
    const p = _glowPart; _glowPart = null;
    if (!p || !hasGsap() || rm) return;
    // 給 DOM 一個 tick 讓首頁 SVG 完成渲染
    requestAnimationFrame(() => {
      const el = document.getElementById(`glow-${p}`);
      if (!el) return;
      gsap.timeline()
        .to(el, { opacity: 1, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.12 })
        .set(el, { opacity: 0 });
    });
  }

  // ── 升級：RPG 升級畫面 ─────────────────────────────────────────────────
  // impeccable animate.md：不用 bounce/elastic（原本的 back.out(1.7) 已移除）
  // gsap-timeline：labels 串接；gsap-core：steps() 逐格、autoAlpha 控制顯示
  // 閃白 → 視窗中線展開 → LEVEL UP 逐格閃 3 下 → 立繪小跳兩格 → Lv 數字逐格翻到新等級 → 其餘逐行出現
  function levelUpEnter(card, fromLevel, toLevel) {
    if (!hasGsap() || rm) return;
    const burst = card.querySelector('.levelup-burst');
    const hero  = card.querySelector('.levelup-hero');
    const lv    = card.querySelector('.levelup-lv');
    const rest  = card.querySelectorAll('.levelup-title, .levelup-stage, .btn');
    gsap.set([burst, hero, lv, ...rest], { autoAlpha: 0 });
    const tl = gsap.timeline();
    tl.add(flash(2))
      .from(card, { scaleY: 0, duration: 0.2, ease: 'steps(4)' })
      .addLabel('burst')
      .to(burst, { autoAlpha: 1, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.09 }, 'burst')
      .set(burst, { autoAlpha: 1 })
      .to(hero, { autoAlpha: 1, duration: 0.01 }, 'burst')
      .to(hero, { y: -10, duration: 0.08, ease: 'steps(2)', repeat: 3, yoyo: true }, 'burst+=0.1')
      .to(lv, { autoAlpha: 1, duration: 0.01 }, 'burst+=0.2');
    if (fromLevel && toLevel > fromLevel) {
      tl.add(countUp(lv, fromLevel, toLevel, Math.min(0.6, 0.15 * (toLevel - fromLevel)), { prefix: 'Lv.' }), 'burst+=0.2');
    }
    tl.to(rest, { autoAlpha: 1, duration: 0.01, stagger: 0.12 });
    skippable(tl, card);
  }

  return {
    initLenis, pageEnter, animScoreBars,
    startBreathing, stopBreathing,
    queuePartGlow, flushPartGlow,
    levelUpEnter, encounter, battleResult, openWindow
  };
})();

ANIM.initLenis();
