// js/anim.js — Stage 5 動畫層 (GSAP + Lenis)
//
// 技能依據：
//   scroll-experience : Lenis lerp 0.08，vanilla JS RAF loop
//   gsap-timeline     : breathing 用 repeat:-1/yoyo；levelUp 用 timeline + defaults + labels
//   gsap-core         : stagger from below y:18 autoAlpha power3.out；autoAlpha for fades；clearProps
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

  // ── 頁面卡片 stagger 進入 ───────────────────────────────────────────────
  // gsap-core: gsap.from y:18 autoAlpha:0 stagger:0.045 ease:power3.out clearProps
  // ui-ux-pro-max animation: duration 260ms stagger 45ms (30-50ms 範圍內)
  function pageEnter() {
    if (!hasGsap() || rm) return;
    const els = document.querySelectorAll('#content > *');
    if (!els.length) return;
    gsap.from(els, {
      y: 18, autoAlpha: 0, duration: 0.26, stagger: 0.045,
      ease: 'power3.out', clearProps: 'transform,opacity,visibility'
    });
  }

  // ── 部位分數 bar 從 0 動到目標寬度 ────────────────────────────────────────
  // gsap-core: gsap.to width power2.out；僅動 width（CSS 自定義屬性），非 layout 觸發屬性
  function animScoreBars() {
    if (!hasGsap() || rm) return;
    document.querySelectorAll('[data-gsap="psr-bar"]').forEach(bar => {
      const w = parseFloat(bar.style.width) || 0;
      bar.style.width = '0%';
      gsap.to(bar, { width: `${w}%`, duration: 0.55, ease: 'power2.out', delay: 0.1 });
    });
  }

  // ── 首頁角色待機呼吸 + 耐力風動線條 ─────────────────────────────────────
  // gsap-timeline: repeat:-1 yoyo:true sine.inOut
  // gsap-core: wind paths stagger opacity — 只動 opacity，REDESIGN_PROMPT 1.5節 GSAP 動畫
  let _tl = null;
  function startBreathing() {
    if (!hasGsap() || rm) return;
    const el = document.getElementById('hero-avatar');
    if (!el) return;
    stopBreathing();
    _tl = gsap.timeline({ repeat: -1, yoyo: true })
      .to(el, { y: -5, duration: 2.2, ease: 'sine.inOut' });
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
        .to(el, { opacity: 0.9, duration: 0.22, ease: 'power2.out' })
        .to(el, { opacity: 0, duration: 0.85, ease: 'power1.in' });
    });
  }

  // ── 升級爆發動畫 ────────────────────────────────────────────────────────
  // gsap-timeline: defaults ease:power3.out；back.out(1.7) 彈跳進場；子項 stagger
  // gsap-core: autoAlpha 確保初始隱藏且不佔 pointer events
  function levelUpEnter(card) {
    if (!hasGsap()) return;
    const burst  = card.querySelector('.levelup-burst');
    const title  = card.querySelector('.levelup-title');
    const lv     = card.querySelector('.levelup-lv');
    const stage  = card.querySelector('.levelup-stage');
    const items  = [burst, title, lv].filter(Boolean);

    gsap.set(card,  { scale: 0.55, autoAlpha: 0, y: 40 });
    gsap.set(items, { autoAlpha: 0, y: 10 });
    if (stage) gsap.set(stage, { autoAlpha: 0, y: 8 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(card,  { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' })
      .to(burst, { autoAlpha: 1, y: 0, scale: 1.35, duration: 0.25 }, '-=0.05')
      .to(burst, { scale: 1, duration: 0.18, ease: 'back.out(2)' })
      .to([title, lv].filter(Boolean), { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.07 }, '<0.05');
    if (stage) tl.to(stage, { autoAlpha: 1, y: 0, duration: 0.2 }, '<0.08');
  }

  return {
    initLenis, pageEnter, animScoreBars,
    startBreathing, stopBreathing,
    queuePartGlow, flushPartGlow,
    levelUpEnter
  };
})();

ANIM.initLenis();
