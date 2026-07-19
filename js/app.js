// ── Constants ──────────────────────────────────────────────────────────────

const WORKOUT_TYPES = [
  { id: 'weight',      label: '重量訓練', icon: '🏋️' },
  { id: 'indoor_run',  label: '室內跑步', icon: '🏃' },
  { id: 'outdoor_run', label: '室外跑步', icon: '🌳' },
  { id: 'swim',        label: '游泳',     icon: '🏊' },
  { id: 'bike',        label: '單車',     icon: '🚴' },
];

const BODY_PARTS = [
  { id: 'chest',     label: '胸部' },
  { id: 'back',      label: '背部' },
  { id: 'legs',      label: '腿部・臀部' },
  { id: 'shoulders', label: '肩部' },
  { id: 'biceps',    label: '二頭肌' },
  { id: 'triceps',   label: '三頭肌' },
  { id: 'core',      label: '核心' },
];

const PRESET_EXERCISES = {
  chest: ['啞鈴臥推','槓鈴臥推','上斜啞鈴臥推','上斜槓鈴臥推','下斜啞鈴臥推','下斜槓鈴臥推','啞鈴飛鳥','上斜啞鈴飛鳥','下斜啞鈴飛鳥','蝴蝶機夾胸','繩索夾胸','上斜繩索飛鳥','下斜繩索飛鳥','伏地挺身','寬距伏地挺身','鑽石伏地挺身','雙槓撐體（胸）','史密斯機臥推','胸推機'],
  back:  ['引體向上','反握引體向上','寬握引體向上','中立握引體向上','槓鈴划船','啞鈴划船','T槓划船','俯身划船','坐姿繩索划船','繩索直臂下拉','啞鈴直臂划船','滑輪下拉','反握滑輪下拉','中立握下拉','硬舉','臉拉','背伸展','史密斯機划船','彈力帶划船'],
  legs:  ['深蹲','前蹲','相撲深蹲','哈克深蹲','箱上深蹲','史密斯機深蹲','保加利亞分腿蹲','弓箭步','行走弓箭步','側弓箭步','腿推機','腿彎舉（臥式）','腿彎舉（坐式）','腿伸展','臀推','臀腿機','繩索臀踢','蚌式開合','羅馬尼亞硬舉','直腿硬舉','小腿提踵（站姿）','小腿提踵（坐姿）'],
  shoulders: ['啞鈴肩推','槓鈴肩推','Arnold推舉','史密斯機肩推','坐姿肩推機','側平舉','繩索側平舉','機械側平舉','前平舉','繩索前平舉','後三角啞鈴飛鳥','繩索後三角飛鳥','反向蝴蝶機','直立划船','臉拉','啞鈴聳肩','槓鈴聳肩'],
  biceps:  ['啞鈴彎舉','槓鈴彎舉','EZ槓彎舉','錘式彎舉','斜板錘式彎舉','集中彎舉','斜板彎舉（牧師凳）','托臂彎舉','繩索彎舉','繩索錘式彎舉','反握彎舉','對握引體向上','機械彎舉'],
  triceps: ['繩索三頭下壓','直桿三頭下壓','反握三頭下壓','法式彎舉（EZ槓）','法式彎舉（啞鈴）','窄握臥推','史密斯機窄握臥推','雙槓撐體（三頭）','板凳撐體','啞鈴三頭伸展（單手）','啞鈴三頭伸展（雙手）','過頭繩索伸展','三頭踢回（Kickback）','機械三頭下壓'],
  core:    ['仰臥起坐','捲腹','反向捲腹','自行車捲腹','平板支撐','側平板','動態平板','俄羅斯轉體','懸吊舉腿','懸吊屈膝舉腿','仰臥舉腿','剪刀腳','死蟲','健腹輪','山式爬行','V字起身','超人式','臀橋'],
};

const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const IMG_EXT  = '/0.jpg';

// ── Helpers ────────────────────────────────────────────────────────────────

function toLocalStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getTodayStr() { return toLocalStr(new Date()); }
function currentTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  const days = ['日','一','二','三','四','五','六'];
  return `${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日（週${days[dt.getDay()]}）`;
}
function formatDateShort(d) {
  const dt = new Date(d + 'T00:00:00');
  const days = ['日','一','二','三','四','五','六'];
  return `${dt.getMonth()+1}/${dt.getDate()} 週${days[dt.getDay()]}`;
}
function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr+'T00:00:00').getTime()) / 86400000);
  return diff === 0 ? '今天' : diff === 1 ? '昨天' : `${diff} 天前`;
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

let _savedScrollY = 0;
function lockScroll() {
  _savedScrollY = window.scrollY;
  document.body.style.top = `-${_savedScrollY}px`;
  document.body.classList.add('scroll-locked');
}
function unlockScroll() {
  document.body.classList.remove('scroll-locked');
  document.body.style.top = '';
  window.scrollTo(0, _savedScrollY);
}

function getTypeInfo(id) { return WORKOUT_TYPES.find(t => t.id === id) || { label: id, icon: '' }; }
function getPartLabel(id) { return (BODY_PARTS.find(p => p.id === id) || { label: id }).label; }

// Unit helpers — stores always in kg, displays in user preference
function getUnit() { return localStorage.getItem('weightUnit') || 'kg'; }
function setUnit(u) { localStorage.setItem('weightUnit', u); }
function kgToDisplay(kg) {
  if (kg === '' || kg === null || kg === undefined) return '';
  const n = parseFloat(kg);
  if (isNaN(n)) return '';
  return getUnit() === 'lbs' ? Math.round(n * 2.20462 * 10) / 10 : n;
}
function displayToKg(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return 0;
  return getUnit() === 'lbs' ? Math.round(n / 2.20462 * 100) / 100 : n;
}
function unitLabel() { return getUnit() === 'lbs' ? '磅' : 'kg'; }

function kgToDisplayUnit(kg, unit) {
  if (kg === '' || kg === null || kg === undefined) return '';
  const n = parseFloat(kg); if (isNaN(n) || !isFinite(n)) return '';
  return unit === 'lbs' ? Math.round(n * 2.20462 * 10) / 10 : n;
}
function displayToKgUnit(val, unit) {
  const n = parseFloat(val); if (isNaN(n)) return 0;
  return unit === 'lbs' ? Math.round(n / 2.20462 * 100) / 100 : n;
}
function unitLabelFor(unit) { return unit === 'lbs' ? '磅' : 'kg'; }
function timeToMins(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function calcDuration(s, e) {
  if (!s || !e) return null;
  let d = timeToMins(e) - timeToMins(s);
  if (d < 0) d += 1440;
  return d > 0 && d <= 600 ? d : null;
}

// ── 示範媒體 ────────────────────────────────────────────────────────────────
// 優先序：本地 exercises-dataset GIF → free-exercise-db 遠端靜態圖 → YouTube 按鈕。
// 本地資料集不隨 repo 散布（媒體 © Gym visual），線上版會自動 fallback 到遠端圖。
const EX_INDEX_BY_ID = {};
(window.EXERCISE_INDEX || []).forEach(e => { EX_INDEX_BY_ID[e.id] = e; });

function _mapEntry(name) { return (window.EXERCISE_MAP || {})[name] || null; }

function getDemoSources(name) {
  const m = _mapEntry(name), srcs = [];
  const ex = m && m.l ? EX_INDEX_BY_ID[m.l] : null;
  if (ex && ex.gif_url) srcs.push('exercises-dataset/' + ex.gif_url);
  if (m && m.f) srcs.push(IMG_BASE + m.f + IMG_EXT);
  return srcs;
}
function getThumbSources(name) {
  const m = _mapEntry(name), srcs = [];
  const ex = m && m.l ? EX_INDEX_BY_ID[m.l] : null;
  if (ex && ex.image) srcs.push('exercises-dataset/' + ex.image);
  if (m && m.f) srcs.push(IMG_BASE + m.f + IMG_EXT);
  return srcs;
}
// 載入失敗時輪替下一個來源（data-next 以 | 分隔）
function _demoNext(img) {
  const rest = (img.dataset.next || '').split('|').filter(Boolean);
  if (rest.length) { img.dataset.next = rest.slice(1).join('|'); img.src = rest[0]; }
  else img.parentNode.innerHTML = '<div class="gif-fail">示意圖載入失敗</div>';
}
function _thumbNext(img) {
  const rest = (img.dataset.next || '').split('|').filter(Boolean);
  if (rest.length) { img.dataset.next = rest.slice(1).join('|'); img.src = rest[0]; }
  else img.outerHTML = '<span class="ex-thumb-icon">💪</span>';
}
function _demoLoaded(img) {
  const prev = img.previousElementSibling;
  if (prev && prev.classList.contains('gif-loading')) prev.remove();
  const attr = document.getElementById('demo-attr');
  if (attr) attr.textContent = img.src.includes('exercises-dataset')
    ? '示範動畫 © Gym visual — gymvisual.com'
    : '示範圖：free-exercise-db（Public Domain）';
}

function showDemo(name) {
  if (document.getElementById('demo-modal')) return;
  lockScroll();
  const srcs = getDemoSources(name);
  const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' 健身 教學 示範');
  const esc = name.replace(/&/g,'&amp;').replace(/"/g,'&quot;');

  const el = document.createElement('div');
  el.id = 'demo-modal';
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">${esc}</span>
        <button class="modal-close" onclick="closeDemo()">✕</button>
      </div>
      <div class="modal-gif-wrap" id="gif-wrap">
        ${srcs.length
          ? `<div class="gif-loading">載入中…</div>
             <img src="${srcs[0]}" data-next="${srcs.slice(1).join('|')}" alt="${esc}" class="ex-gif"
               onload="_demoLoaded(this)"
               onerror="_demoNext(this)">`
          : '<div class="gif-fail">此動作暫無示意圖</div>'}
      </div>
      <div id="demo-attr" class="demo-attr"></div>
      <a href="${ytUrl}" target="_blank" class="btn btn-outline" style="margin:12px 0 0">▶ YouTube 教學影片</a>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
}

function closeDemo() {
  const el = document.getElementById('demo-modal');
  if (!el) return;
  unlockScroll();
  el.classList.remove('open');
  setTimeout(() => el.remove(), 250);
}

// Stats
function getStreak() {
  const days = new Set(DB.all().map(w => w.date));
  const d = new Date();
  if (!days.has(toLocalStr(d))) d.setDate(d.getDate() - 1);
  let s = 0;
  while (days.has(toLocalStr(d))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
function getWeekStats() {
  const today = new Date(), dow = today.getDay();
  const mon = new Date(today);
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  mon.setHours(0,0,0,0);
  const weekDates = Array.from({length:7}, (_,i) => {
    const d = new Date(mon); d.setDate(mon.getDate()+i); return toLocalStr(d);
  });
  const workoutDays = new Set(DB.all().map(w => w.date));
  return { weekDates, workoutDays, weekCount: weekDates.filter(d => workoutDays.has(d)).length };
}

// ── Database ───────────────────────────────────────────────────────────────

const DB = {
  KEY: 'fitnessApp_v1',
  _load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY)) || {};
      if (!Array.isArray(d.workouts)) d.workouts = [];
      if (!d.custom || typeof d.custom !== 'object') d.custom = {};
      return d;
    } catch { return {workouts:[],custom:{}}; }
  },
  _save(d) {
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); }
    catch(e) { showToast('儲存失敗：裝置空間不足，請清理瀏覽器資料'); }
  },
  addWorkout(w)   { const d=this._load(); d.workouts.push(w); this._save(d); },
  updateWorkout(id, patch) {
    const d = this._load();
    const i = d.workouts.findIndex(w => w.id === id);
    if (i >= 0) { d.workouts[i] = {...d.workouts[i], ...patch}; this._save(d); }
  },
  deleteWorkout(id) { const d=this._load(); d.workouts=d.workouts.filter(w=>w.id!==id); this._save(d); },
  forDate(date) { return this._load().workouts.filter(w => w.date === date); },
  all()         { return this._load().workouts.sort((a,b) => b.date.localeCompare(a.date)); },
  lastForPart(part) {
    return this._load().workouts
      .filter(w => w.type==='weight' && w.bodyPart===part)
      .sort((a,b) => b.date.localeCompare(a.date))[0] || null;
  },
  customEx(part) { return this._load().custom[part] || []; },
  addCustomEx(part, name) {
    const d=this._load();
    if (!d.custom[part]) d.custom[part]=[];
    if (!d.custom[part].includes(name)) { d.custom[part].push(name); this._save(d); }
  },
  getPR(name) { return (this._load().prs || {})[name] || null; },
  checkAndUpdatePRs(exercises, date) {
    const d = this._load();
    if (!d.prs) d.prs = {};
    const hit = [];
    exercises.forEach(ex => {
      const cur = d.prs[ex.name] || {};
      ex.sets.forEach(set => {
        let changed = false;
        if (set.weight > 0 && (cur.maxWeight == null || set.weight > cur.maxWeight)) {
          cur.maxWeight = set.weight; cur.maxWeightDate = date; changed = true;
        }
        if (set.reps > 0 && (cur.maxReps == null || set.reps > cur.maxReps)) {
          cur.maxReps = set.reps; cur.maxRepsDate = date; changed = true;
        }
        const vol = (set.weight || 0) * (set.reps || 0);
        if (vol > 0 && (cur.maxVolume == null || vol > cur.maxVolume)) {
          cur.maxVolume = vol; cur.maxVolumeDate = date; changed = true;
        }
        if (changed) { d.prs[ex.name] = cur; if (!hit.includes(ex.name)) hit.push(ex.name); }
      });
    });
    if (hit.length) this._save(d);
    return hit;
  },
  getAvatar() { return this._load().avatar || null; },
  // 體重時間序列；無紀錄時以 avatar 建檔體重補一筆（建檔日），維持純函數推導
  getBodyWeights() {
    const d = this._load();
    if (Array.isArray(d.bodyWeights) && d.bodyWeights.length) return d.bodyWeights;
    if (d.avatar) return [{ date: toLocalStr(new Date(d.avatar.createdAt || Date.now())), weight: d.avatar.weight }];
    return [];
  },
  addBodyWeight(date, weight) {
    const d = this._load();
    if (!Array.isArray(d.bodyWeights)) d.bodyWeights = this.getBodyWeights();
    d.bodyWeights = d.bodyWeights.filter(e => e.date !== date);
    d.bodyWeights.push({ date, weight });
    d.bodyWeights.sort((a, b) => a.date.localeCompare(b.date));
    if (d.avatar) d.avatar.weight = weight;
    this._save(d);
  },
  getRestPeriods() { const d = this._load(); return Array.isArray(d.restPeriods) ? d.restPeriods : []; },
  setRestPeriods(ps) { const d = this._load(); d.restPeriods = ps; this._save(d); },
  saveAvatar(a) {
    const d = this._load();
    d.avatar = { ...(d.avatar || {}), ...a };
    this._save(d);
  },
  getExerciseHistory(name) {
    return this._load().workouts
      .filter(w => w.type === 'weight' && (w.exercises || []).some(e => e.name === name))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(w => {
        const ex = (w.exercises||[]).find(e => e.name === name);
        if (!ex) return null;
        const sets = ex.sets || [];
        const maxW = Math.max(0, ...sets.map(s => parseFloat(s.weight) || 0));
        const vol  = sets.reduce((t, s) => t + (parseFloat(s.weight)||0) * (parseInt(s.reps)||0), 0);
        const maxR = Math.max(0, ...sets.map(s => parseInt(s.reps) || 0));
        return { date: w.date, maxWeight: maxW, totalVol: vol, maxReps: maxR };
      }).filter(Boolean);
  },
};

// ── Rest Timer (nav-based) ─────────────────────────────────────────────────

const RestTimer = {
  _interval: null, _remaining: 0,
  getDefault() { return parseInt(localStorage.getItem('restSecs') || '90'); },
  setDefault(s) { localStorage.setItem('restSecs', String(s)); },
  isRunning() { return !!this._interval; },
  start(secs) {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    this._remaining = secs ?? this.getDefault();
    this._updateNav();
    this._interval = setInterval(() => {
      this._remaining--;
      if (this._remaining <= 0) {
        this._remaining = 0; this._beep(); this._vibrate();
        this._updateNav(); _updateTimerSheet();
        setTimeout(() => { clearInterval(this._interval); this._interval = null; this._updateNav(); _updateTimerSheet(); }, 2500);
      } else { this._updateNav(); _updateTimerSheet(); }
    }, 1000);
  },
  stop() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    this._remaining = 0;
    this._updateNav(); _updateTimerSheet();
  },
  add(s) { this._remaining = Math.max(5, this._remaining + s); this._updateNav(); _updateTimerSheet(); },
  _updateNav() {
    const btn  = document.getElementById('timer-nav-btn');
    const icon = document.getElementById('timer-nav-icon');
    const lbl  = document.getElementById('timer-nav-label');
    if (!btn) return;
    const s = this._remaining, m = Math.floor(s/60), sec = s%60;
    btn.classList.toggle('timer-nav-active', s > 0 || this.isRunning());
    if (s > 0) {
      icon.textContent = `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
      lbl.textContent = '休息中';
    } else if (this.isRunning()) {
      icon.textContent = '✅'; lbl.textContent = '完成！';
    } else {
      icon.textContent = '⏱'; lbl.textContent = '計時';
    }
  },
  _beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0,0.25,0.5].forEach(t => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; o.type = 'sine';
        g.gain.setValueAtTime(0.45, ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+t+0.18);
        o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.2);
      });
    } catch {}
  },
  _vibrate() { try { navigator.vibrate?.([200,100,200]); } catch {} },
};

// ── Timer Bottom Sheet ─────────────────────────────────────────────────────

function timerNavTap() {
  if (document.getElementById('timer-sheet')) { closeTimerSheet(); return; }
  lockScroll();
  const overlay = Object.assign(document.createElement('div'), {id:'t-overlay', className:'overlay'});
  overlay.onclick = closeTimerSheet;
  const sheet = Object.assign(document.createElement('div'), {id:'timer-sheet', className:'bottom-sheet'});
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-top">
      <span class="sheet-title">⏱ 組間計時</span>
      <button class="sheet-close" onclick="closeTimerSheet()">✕</button>
    </div>
    <div id="timer-body" style="padding:0 20px 28px"></div>`;
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  _updateTimerSheet();
  requestAnimationFrame(() => { overlay.classList.add('open'); sheet.classList.add('open'); });
}

function closeTimerSheet() {
  unlockScroll();
  ['timer-sheet','t-overlay'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('open'); setTimeout(() => el.remove(), 300);
  });
}

function _updateTimerSheet() {
  const el = document.getElementById('timer-body'); if (!el) return;
  const s = RestTimer._remaining, m = Math.floor(s/60), sec = s%60;
  const def = RestTimer.getDefault(), running = RestTimer.isRunning();
  const pct = running && def > 0 ? Math.min(100,(s/def)*100) : (s===0?0:100);
  el.innerHTML = `
    <div class="ts-display${s===0&&!running?' ts-done':''}">
      <div class="ts-time">${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}</div>
      <div class="ts-bar-bg"><div class="ts-bar-fg" style="width:${pct}%"></div></div>
    </div>
    <div class="ts-presets">
      ${[60,90,120,180].map(t=>`<button class="ts-preset${def===t?' active':''}" onclick="RestTimer.setDefault(${t});RestTimer.start(${t})">${t===60?'1分':t===90?'1分30':t===120?'2分':'3分'}</button>`).join('')}
    </div>
    <div class="ts-controls">
      <button class="ts-adj" onclick="RestTimer.add(-15)">-15s</button>
      <button class="ts-main" onclick="${running?'RestTimer.stop()':'RestTimer.start()'}">${running?'⏹ 停止':'▶ 開始'}</button>
      <button class="ts-adj" onclick="RestTimer.add(30)">+30s</button>
    </div>`;
}

// ── SVG Line Chart ──────────────────────────────────────────────────────────

function buildSvgLineChart(series, { color = '#ff4d24' } = {}) {
  const clean = series.filter(s => isFinite(s.value));
  if (clean.length < 2) return '<div style="text-align:center;color:var(--text-secondary);font-size:13px;padding:12px 0">資料不足，至少需要 2 筆記錄</div>';
  series = clean;
  const W = 320, H = 160, pad = { t: 16, r: 16, b: 32, l: 44 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const vals = series.map(s => s.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals), rng = maxV - minV || 1;
  const pts = series.map((s, i) => ({
    x: pad.l + (i / (series.length - 1)) * iW,
    y: pad.t + iH - ((s.value - minV) / rng) * iH,
    label: s.label, value: s.value,
  }));
  const pathD = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPts = [...pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${pts[pts.length-1].x.toFixed(1)},${(pad.t+iH).toFixed(1)}`,
    `${pts[0].x.toFixed(1)},${(pad.t+iH).toFixed(1)}`].join(' ');
  const gid = 'cg' + color.replace('#','');
  const yLabels = [0,1,2].map(i => {
    const v = minV + (i/2)*rng, yy = pad.t + iH - (i/2)*iH;
    return `<text x="${pad.l-6}" y="${yy+4}" class="ct-lbl" text-anchor="end">${Math.round(v)}</text>`;
  }).join('');
  const step = Math.ceil(series.length / 5);
  const xLabels = pts.filter((_,i) => i % step === 0 || i === pts.length-1).map(p =>
    `<text x="${p.x.toFixed(1)}" y="${pad.t+iH+18}" class="ct-lbl" text-anchor="middle">${p.label}</text>`
  ).join('');
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
    </linearGradient></defs>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t+iH}" stroke="var(--border)" stroke-width="1"/>
    <line x1="${pad.l}" y1="${pad.t+iH}" x2="${pad.l+iW}" y2="${pad.t+iH}" stroke="var(--border)" stroke-width="1"/>
    ${yLabels}${xLabels}
    <polygon points="${fillPts}" fill="url(#${gid})"/>
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${color}" stroke="white" stroke-width="2"/>`).join('')}
  </svg>`;
}

// ── Navigation ─────────────────────────────────────────────────────────────

const stack = [];
let currentScreen = 'home', currentParams = {};

const App = {
  goTo(screen, params) {
    if (currentScreen === 'addExercises' && (window.currentExercises||[]).length > 0) {
      if (!confirm('離開後目前紀錄將消失，確定離開？')) return;
      window.currentExercises = []; window._editId = null;
    }
    stack.push({screen: currentScreen, params: currentParams});
    _render(screen, params || {});
  },
  back() {
    if (currentScreen === 'addExercises' && (window.currentExercises||[]).length > 0) {
      if (!confirm('離開後目前紀錄將消失，確定離開？')) return;
      window.currentExercises = []; window._editId = null;
    }
    if (!stack.length) return;
    const prev = stack.pop();
    _render(prev.screen, prev.params);
  },
  goHome() {
    if (currentScreen === 'addExercises' && (window.currentExercises||[]).length > 0) {
      if (!confirm('離開後目前紀錄將消失，確定離開？')) return;
    }
    stack.length = 0; window.currentExercises = []; window._editId = null;
    _render('home', {});
  },
};

function _render(screen, params) {
  if (!DB.getAvatar() && screen !== 'onboarding') { screen = 'onboarding'; params = {}; stack.length = 0; }
  currentScreen = screen; currentParams = params;
  document.getElementById('content').scrollTop = 0;
  window.scrollTo(0, 0);
  document.getElementById('back-btn').className = stack.length ? '' : 'hidden';
  document.getElementById('header-right').innerHTML = '';
  document.querySelectorAll('#bottom-nav .nav-item[data-tab]').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === screen));
  ({home, history, progress, selectType, selectBodyPart, addExercises, addCardio, dayDetail, exerciseStats, avatar: avatarScreen, onboarding})[screen]
    ?.(params, {title: document.getElementById('header-title'), right: document.getElementById('header-right')});
  if (typeof ANIM !== 'undefined') {
    ANIM.pageEnter();
    if (screen === 'home') { ANIM.startBreathing(); ANIM.flushPartGlow(); }
    else ANIM.stopBreathing();
  }
}

// ── Engine 狀態（部位分數/耐力/休養，全部由紀錄純函數推導）──────────────────

function engineState() {
  const a = DB.getAvatar();
  const today = getTodayStr();
  const workouts = DB._load().workouts;
  const restPeriods = DB.getRestPeriods();
  const bodyWeightKg = Engine.weightOn(DB.getBodyWeights(), today, a ? a.weight : 65);
  const scores = Engine.computePartScores({ workouts, bodyWeightKg, today, restPeriods, exMap: window.EXERCISE_MAP, exIndex: EX_INDEX_BY_ID });
  const endurance = Engine.computeEndurance({ workouts, bodyWeightKg, today, restPeriods });
  return {
    scores, endurance, bodyWeightKg,
    resting: Engine.isInRest(today, restPeriods),
    weightStaleDays: Engine.daysSinceWeightUpdate(DB.getBodyWeights(), today),
  };
}

// 角色 SVG（新版生成器；畫風層可整組替換）
function heroAvatarSvg(a, level, es) {
  const scoreMap = {};
  Object.keys(es.scores).forEach(p => { scoreMap[p] = es.scores[p].score; });
  const dimParts = Object.keys(es.scores).filter(p => es.scores[p].decayDays > 0);
  return buildKinniku({
    gender: a.gender, height: a.height, weight: es.bodyWeightKg,
    scores: scoreMap, endurance: es.endurance.score,
    stageIndex: stageIndex(level), resting: es.resting, dimParts,
  });
}

// ── Home ───────────────────────────────────────────────────────────────────

// 衰退提示氣泡在舞台上的定位（近似對應角色部位）
const PART_WARN_POS = {
  shoulders: 'top:21%;right:5%',
  chest:     'top:30%;left:6%',
  back:      'top:40%;right:3%',
  biceps:    'top:48%;left:3%',
  triceps:   'top:56%;right:5%',
  core:      'top:52%;left:7%',
  legs:      'top:72%;left:50%;transform:translateX(-50%)',
};

function home(_, {title}) {
  title.textContent = '健身紀錄';
  const today = getTodayStr(), todayWs = DB.forDate(today);
  const lastExport = localStorage.getItem('lastExportDate');
  const backupDays = lastExport
    ? Math.floor((Date.now() - new Date(lastExport+'T00:00:00').getTime()) / 86400000)
    : null;
  const showBackupWarn = backupDays === null || backupDays >= 7;
  const backupMsg = backupDays === null ? '尚未備份' : `${backupDays} 天未備份`;
  const d = new Date(), dayNames=['日','一','二','三','四','五','六'];
  const {weekDates, workoutDays, weekCount} = getWeekStats();
  const streak = getStreak();
  const wkLabels = ['一','二','三','四','五','六','日'];

  const byDate = {};
  DB.all().filter(w => w.date !== today).forEach(w => { (byDate[w.date]=byDate[w.date]||[]).push(w); });
  const recentDates = Object.keys(byDate).sort((a,b)=>b.localeCompare(a)).slice(0,7);

  // ── 角色舞台 ──
  const _av = DB.getAvatar();
  let heroStage = '';
  if (_av) {
    const li = levelInfo(totalXp());
    const st = stageFor(li.level);
    const es = engineState();
    // 衰退提示：warning = 快衰退（該練了）；decayDays>0 = 衰退中（流失提示）
    const bubbles = [];
    Object.keys(es.scores).forEach(p => {
      const s = es.scores[p];
      if (es.resting) return;
      if (s.warning) bubbles.push({ p, cls: '', txt: `該練${PART_LABEL_MAP[p] || p}了！` });
      else if (s.decayDays > 0 && s.raw > 0) bubbles.push({ p, cls: ' warn-decay', txt: `${PART_LABEL_MAP[p] || p} -${s.decayDays}` });
    });
    const bubbleHtml = bubbles.slice(0, 3)
      .map(b => `<div class="part-warn${b.cls}" style="${PART_WARN_POS[b.p] || ''}" onclick="App.goTo('selectType',{date:'${today}'})">${b.txt}</div>`)
      .join('');
    heroStage = `
    <div class="hero-stage" role="button" tabindex="0" aria-label="查看角色詳情" onclick="App.goTo('avatar',{})" onkeydown="if(event.key==='Enter')App.goTo('avatar',{})">
      <div class="hud">
        <div>
          <div class="hud-name-row">
            <span class="hud-name">${escHtml(_av.name)}</span>
            <span class="avatar-lv-chip">Lv.${li.level}</span>
          </div>
          <div class="hud-stage-title">${st.title}${es.resting ? '　<span class="rest-mode-chip">🛌 休養中</span>' : ''}</div>
        </div>
        <div class="hud-streak">
          <div class="hud-streak-num">${streak || 0}</div>
          <div class="hud-streak-label">🔥 連續天數</div>
        </div>
      </div>
      <div class="hero-avatar" id="hero-avatar" aria-hidden="true">${heroAvatarSvg(_av, li.level, es)}</div>
      ${bubbleHtml}
      <div class="hero-xp">
        <div class="hero-xp-row">
          <span class="hero-xp-label">XP</span>
          <span class="hero-xp-val">${li.cur} / ${li.need}</span>
        </div>
        <div class="xp-bar-bg"><div class="xp-bar-fg" style="width:${Math.round(li.cur / li.need * 100)}%"></div></div>
      </div>
    </div>
    <button class="start-btn" onclick="event.stopPropagation();App.goTo('selectType',{date:'${today}'})">開始訓練</button>`;
  }

  document.getElementById('content').innerHTML = `
    ${heroStage}
    <div class="card" style="padding:14px">
      <div class="stats-bar" style="margin-top:2px">
        <div class="stat-item"><div class="stat-num">${d.getDate()}</div><div class="stat-label">${d.getMonth()+1}月　週${dayNames[d.getDay()]}</div></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><div class="stat-num">${weekCount||'—'}</div><div class="stat-label">⚡ 本週天數</div></div>
      </div>
      <div class="week-cal">
        ${weekDates.map((date,i) => {
          const dt = new Date(date+'T00:00:00'), isToday = date===today, has = workoutDays.has(date);
          return `<div class="cal-day${isToday?' cal-today':''}${has?' cal-has':''}" onclick="App.goTo('dayDetail',{date:'${date}'})">
            <div class="cal-label">${wkLabels[i]}</div>
            <div class="cal-num">${dt.getDate()}</div>
            <div class="cal-dot">${has?'●':'·'}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:12px">
        ${todayWs.length===0
          ? `<div class="empty-state" style="padding:12px 0 4px"><div class="empty-icon">🏃</div><p>今天還沒有訓練紀錄</p></div>`
          : todayWs.map(workoutRow).join('')}
      </div>
    </div>
    ${recentDates.length ? `
      <div class="section-title" style="margin-top:4px">最近紀錄</div>
      ${recentDates.map(date => `
        <div class="card" style="padding:12px 16px;cursor:pointer" onclick="App.goTo('dayDetail',{date:'${date}'})">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600;font-size:13px;margin-bottom:3px">${formatDateShort(date)}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${byDate[date].map(w=>getTypeInfo(w.type).icon+' '+getTypeInfo(w.type).label).join('　')}</div>
            </div>
            <span class="row-arrow">›</span>
          </div>
        </div>`).join('')}` : ''}
    ${showBackupWarn ? `<div class="backup-warn" onclick="exportData()">⚠️ ${backupMsg}，點此立即匯出</div>` : ''}
    <div class="data-mgmt">
      <button class="data-btn" onclick="exportData()">📤 匯出備份</button>
      <button class="data-btn" onclick="importData()">📥 匯入資料</button>
    </div>
    <p class="gym-credit">示範動作 © <a href="https://gymvisual.com/" target="_blank" rel="noopener noreferrer">Gym Visual</a></p>`;
}

function workoutRow(w) {
  const t = getTypeInfo(w.type);
  let info = '';
  if (w.type==='weight') {
    const exs = w.exercises || [];
    const vol = exs.reduce((s,ex)=>s+(ex.sets||[]).reduce((s2,set)=>s2+(parseFloat(set.weight)||0)*(parseInt(set.reps)||0),0),0);
    info = `${getPartLabel(w.bodyPart)}・${exs.length} 動作${vol>0?`・${Math.round(vol).toLocaleString()} kg`:''}`;
  } else if (w.type==='swim') {
    info = [w.distance&&`${w.distance} ${w.distanceUnit}`,w.laps&&`${w.laps} 趟`,w.duration&&`${w.duration} 分`].filter(Boolean).join('・');
  } else {
    info = [w.distance&&`${w.distance} km`,w.duration&&`${w.duration} 分`].filter(Boolean).join('・');
  }
  return `<div class="workout-row" onclick="App.goTo('dayDetail',{date:'${w.date}'})">
    <div class="workout-badge">${t.icon} ${t.label}</div>
    <div class="workout-info">${info}</div>
    <span class="row-arrow">›</span>
  </div>`;
}

// ── Calendar History ────────────────────────────────────────────────────────

let _calYear = null, _calMonth = null;

const PART_COLORS = {chest:'#ef4444',back:'#3b82f6',legs:'#22c55e',shoulders:'#a855f7',biceps:'#f97316',triceps:'#ec4899',core:'#14b8a6'};
const TYPE_COLORS = {indoor_run:'#f59e0b',outdoor_run:'#84cc16',swim:'#06b6d4',bike:'#8b5cf6'};
const PART_LABEL_MAP = {chest:'胸部',back:'背部',legs:'腿部',shoulders:'肩部',biceps:'二頭',triceps:'三頭',core:'核心'};
const TYPE_LABEL_MAP = {indoor_run:'室內跑步',outdoor_run:'室外跑步',swim:'游泳',bike:'單車'};

function _wColor(w) { return w.type==='weight'?(PART_COLORS[w.bodyPart]||'#6366f1'):(TYPE_COLORS[w.type]||'#6366f1'); }

function history(_, {title}) {
  title.textContent = '訓練日曆';
  if (_calYear===null) { const d=new Date(); _calYear=d.getFullYear(); _calMonth=d.getMonth(); }
  _renderCalendar();
}

function _calPrev() { if(--_calMonth<0){_calMonth=11;_calYear--;} _renderCalendar(); }
function _calNext() { if(++_calMonth>11){_calMonth=0;_calYear++;} _renderCalendar(); }

function _renderCalendar() {
  const y=_calYear, m=_calMonth, all=DB.all(), byDate={};
  all.forEach(w=>{(byDate[w.date]=byDate[w.date]||[]).push(w);});
  const today=getTodayStr(), firstDow=new Date(y,m,1).getDay(), lastDate=new Date(y,m+1,0).getDate();
  const pad = firstDow===0?6:firstDow-1;
  const monthStr=`${y}-${String(m+1).padStart(2,'0')}`;
  const cells=[...Array(pad).fill(null),
    ...Array.from({length:lastDate},(_,i)=>{const ds=`${monthStr}-${String(i+1).padStart(2,'0')}`;return{d:i+1,ds,ws:byDate[ds]||[]};})];
  while(cells.length%7) cells.push(null);
  const weeks=[]; for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
  const cellHtml=c=>{
    if(!c) return '<div class="hcal-cell hcal-empty"></div>';
    const dots=c.ws.slice(0,4).map(w=>`<span class="hcal-dot" style="background:${_wColor(w)}"></span>`).join('');
    return `<div class="hcal-cell${c.ds===today?' hcal-today':''}${c.ws.length?' hcal-has':''}" onclick="App.goTo('dayDetail',{date:'${c.ds}'})"><div class="hcal-num">${c.d}</div><div class="hcal-dots">${dots}</div></div>`;
  };
  const monthWs=Object.entries(byDate).filter(([d])=>d.startsWith(monthStr)).flatMap(([,ws])=>ws);
  const monthDayCount = Object.keys(byDate).filter(d=>d.startsWith(monthStr)).length;
  const monthWeightCount = monthWs.filter(w=>w.type==='weight').length;
  const monthCardioCount = monthWs.filter(w=>w.type!=='weight').length;
  const counts={}; monthWs.forEach(w=>{const k=w.type==='weight'?w.bodyPart:w.type;counts[k]=(counts[k]||0)+1;});
  const legend=Object.keys(counts).length
    ?`<div class="hcal-legend">${Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<div class="hcal-legend-item"><span class="hcal-legend-dot" style="background:${PART_COLORS[k]||TYPE_COLORS[k]||'#6366f1'}"></span><span>${PART_LABEL_MAP[k]||TYPE_LABEL_MAP[k]||k}</span><span class="hcal-legend-count">${n}</span></div>`).join('')}</div>`
    :'<p class="hcal-empty-msg">本月尚無訓練紀錄</p>';
  document.getElementById('content').innerHTML=`
    <div class="hcal-nav">
      <button class="hcal-nav-btn" onclick="_calPrev()">‹</button>
      <span class="hcal-nav-title">${y} 年 ${m+1} 月</span>
      <button class="hcal-nav-btn" onclick="_calNext()">›</button>
    </div>
    <div class="hcal-month-stats">
      <div class="hcal-ms-item"><span class="hcal-ms-num">${monthDayCount}</span><span class="hcal-ms-label">訓練天</span></div>
      <div class="hcal-ms-divider"></div>
      <div class="hcal-ms-item"><span class="hcal-ms-num">${monthWeightCount}</span><span class="hcal-ms-label">重量</span></div>
      <div class="hcal-ms-divider"></div>
      <div class="hcal-ms-item"><span class="hcal-ms-num">${monthCardioCount}</span><span class="hcal-ms-label">有氧</span></div>
    </div>
    <div class="hcal-wrap">
      <div class="hcal-head">${['一','二','三','四','五','六','日'].map(l=>`<div class="hcal-head-cell">${l}</div>`).join('')}</div>
      ${weeks.map(w=>`<div class="hcal-row">${w.map(cellHtml).join('')}</div>`).join('')}
    </div>
    ${legend}`;
}

// ── Progress ───────────────────────────────────────────────────────────────

function progress(_, {title}) {
  title.textContent = '戰績';
  const es = engineState();
  const allWorkouts = DB.all();
  const today = getTodayStr();

  // ── 摘要統計 ──
  const totalSessions = allWorkouts.length;
  const { weekDates, weekCount } = getWeekStats();
  const streak = getStreak();

  // ── 各部位上次訓練 ──
  const partStatus = BODY_PARTS.map(p => {
    const last = DB.lastForPart(p.id);
    const d = last ? Math.floor((Date.now() - new Date(last.date+'T00:00:00').getTime()) / 86400000) : null;
    return { ...p, lastDate: last?.date || null, daysAgo: d };
  });

  // ── 本週訓練量（各部位）──
  const [wkStart, wkEnd] = [weekDates[0], weekDates[6]];
  const weekVol = {};
  allWorkouts.filter(w => w.type==='weight' && w.date>=wkStart && w.date<=wkEnd).forEach(w => {
    const vol = (w.exercises||[]).reduce((s,ex)=>(ex.sets||[]).reduce((s2,set)=>s2+(parseFloat(set.weight)||0)*(parseInt(set.reps)||0),s),0);
    weekVol[w.bodyPart] = (weekVol[w.bodyPart]||0) + vol;
  });

  // ── 最近 PR（grid，最多 6 筆）──
  const prs = DB._load().prs || {};
  const recentPRs = Object.entries(prs)
    .filter(([, pr]) => pr.maxWeight > 0 && pr.maxWeightDate)
    .map(([name, pr]) => ({ name, weight: pr.maxWeight, reps: pr.maxReps, date: pr.maxWeightDate }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  // ── 有氧趨勢 ──
  const runs = allWorkouts
    .filter(w => (w.type==='outdoor_run'||w.type==='indoor_run') && w.distance > 0)
    .slice(-10);
  const bikeRides = allWorkouts
    .filter(w => w.type==='bike' && w.distance > 0)
    .slice(-10);

  // ── 各部位 rows（含 mini bar + GSAP）──
  // ui-ux-pro-max color-semantic: PART_COLORS per body part；dotColor = 訓練新鮮度語義色
  const partHtml = partStatus.map(p => {
    const d = p.daysAgo;
    const s = es.scores[p.id] || {};
    const score = Math.round(s.score || 0);
    const sc = _scoreColor(score);
    const partColor = PART_COLORS[p.id] || 'var(--primary)';
    const dotColor = d===null ? 'var(--border)' : d===0 ? 'var(--success)' : d<=3 ? 'var(--primary)' : d<=7 ? 'var(--gold)' : 'var(--danger)';
    const ago = d===null ? '尚未訓練' : d===0 ? '今天' : d===1 ? '昨天' : `${d} 天前`;
    const dest = p.lastDate
      ? `App.goTo('dayDetail',{date:'${p.lastDate}'})`
      : `App.goTo('selectType',{date:'${today}'})`;
    return `<div class="prog-part-row" onclick="${dest}">
      <span class="prog-part-dot" style="background:${dotColor}"></span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="prog-part-name">${p.label}</span>
          <span class="prog-part-score-inline" style="color:${sc}">${score || '—'}</span>
          <span class="prog-part-ago">${ago}</span>
        </div>
        ${score ? `<div class="prog-mini-bar-bg"><div class="prog-mini-bar-fg" data-gsap="psr-bar" style="width:${score}%;background:${partColor}"></div></div>` : ''}
      </div>
      <span class="row-arrow">›</span>
    </div>`;
  }).join('');

  // ── 本週訓練量 bars（加 data-gsap="psr-bar" 觸發 GSAP）──
  const maxVol = Math.max(1, ...Object.values(weekVol).length ? Object.values(weekVol) : [1]);
  const volRows = BODY_PARTS.filter(p => weekVol[p.id]).map(p => {
    const pct = Math.round((weekVol[p.id] / maxVol) * 100);
    const display = weekVol[p.id] >= 1000
      ? `${(Math.round(weekVol[p.id]/100)/10).toFixed(1)}k`
      : Math.round(weekVol[p.id]);
    return `<div class="prog-vol-row">
      <div class="prog-vol-label">${p.label}</div>
      <div class="prog-vol-bar-bg"><div class="prog-vol-bar-fg" data-gsap="psr-bar" style="width:${pct}%;background:${PART_COLORS[p.id]||'var(--primary)'}"></div></div>
      <div class="prog-vol-num">${display}</div>
    </div>`;
  }).join('');

  // ── PR grid（重用 stats-pr-grid / stats-pr-card CSS）──
  // ui-ux-pro-max weight-hierarchy: val 用 font-display 900；label 全大寫 letter-spacing
  const prHtml = recentPRs.length
    ? `<div class="stats-pr-grid">${recentPRs.map(pr => `
        <div class="stats-pr-card" data-name="${escHtml(pr.name)}" onclick="showExerciseStats(this.dataset.name)" style="cursor:pointer">
          <div class="stats-pr-val">${kgToDisplay(pr.weight)}</div>
          <div class="stats-pr-unit">${unitLabel()} × ${pr.reps}</div>
          <div class="stats-pr-label">${escHtml(pr.name)}</div>
          <div class="stats-pr-date">${formatDateShort(pr.date)}</div>
        </div>`).join('')}</div>`
    : '<p class="prog-empty">尚無個人紀錄，完成訓練後自動追蹤</p>';

  // ── 耐力分數 ──
  const endurScore = es.endurance.score;
  const endurColor = endurScore >= 70 ? 'var(--success)' : endurScore >= 40 ? 'var(--gold)' : 'var(--primary)';

  document.getElementById('content').innerHTML = `
    <div class="card prog-stat-strip">
      <div class="prog-stat-block">
        <div class="prog-stat-num">${streak}</div>
        <div class="prog-stat-label">🔥 連續天</div>
      </div>
      <div class="prog-stat-divider"></div>
      <div class="prog-stat-block">
        <div class="prog-stat-num">${weekCount}</div>
        <div class="prog-stat-label">📅 本週訓練</div>
      </div>
      <div class="prog-stat-divider"></div>
      <div class="prog-stat-block">
        <div class="prog-stat-num">${totalSessions}</div>
        <div class="prog-stat-label">🏋️ 累計次數</div>
      </div>
    </div>
    <div class="card">
      <div class="prog-sec-title">各部位狀態</div>
      ${partHtml}
    </div>
    ${endurScore > 0 ? `<div class="card">
      <div class="prog-sec-title">體能耐力</div>
      <div class="prog-endurance-row">
        <span class="prog-endur-score" style="color:${endurColor}">${endurScore}</span>
        <div style="flex:1">
          <div class="prog-mini-bar-bg" style="height:6px"><div class="prog-mini-bar-fg" data-gsap="psr-bar" style="width:${endurScore}%;background:${endurColor}"></div></div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:5px">近 30 天等效跑量 ${es.endurance.eqKm} km</div>
        </div>
      </div>
    </div>` : ''}
    ${volRows ? `<div class="card">
      <div class="prog-sec-title">本週訓練量 (kg)</div>
      ${volRows}
    </div>` : ''}
    <div class="card">
      <div class="prog-sec-title">個人最佳</div>
      ${prHtml}
    </div>
    ${runs.length >= 2 ? `<div class="card">
      <div class="prog-sec-title">🏃 跑步趨勢 (km)</div>
      ${buildSvgLineChart(runs.map(w=>({value:w.distance,label:w.date.slice(5)})),{color:'#f59e0b'})}
    </div>` : ''}
    ${bikeRides.length >= 2 ? `<div class="card">
      <div class="prog-sec-title">🚴 單車趨勢 (km)</div>
      ${buildSvgLineChart(bikeRides.map(w=>({value:w.distance,label:w.date.slice(5)})),{color:'#8b5cf6'})}
    </div>` : ''}`;
  if (typeof ANIM !== 'undefined') ANIM.animScoreBars();
}

// ── Day Detail ─────────────────────────────────────────────────────────────

function dayDetail({date}, {title, right}) {
  title.textContent = formatDateShort(date);
  right.innerHTML = `<button class="header-add-btn" onclick="App.goTo('selectType',{date:'${date}'})">＋</button>`;
  const ws = DB.forDate(date);

  const detailHtml = ws.map(w => {
    const t = getTypeInfo(w.type);
    let body = '';
    if (w.type==='weight') {
      const exs = w.exercises || [];
      const vol = exs.reduce((s,ex)=>s+(ex.sets||[]).reduce((s2,set)=>s2+(parseFloat(set.weight)||0)*(parseInt(set.reps)||0),0),0);
      const timeChip = w.startTime && w.endTime ? `⏱ ${w.startTime} ～ ${w.endTime}` : (w.startTime ? `⏱ ${w.startTime} 開始` : null);
      const chips = [
        timeChip,
        w.duration != null && `${w.duration} 分鐘`,
        vol > 0 && `訓練量 ${Math.round(vol).toLocaleString()} kg`,
      ].filter(Boolean).map(c => `<span class="detail-chip">${c}</span>`).join('');
      body = `
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px">
          <span class="detail-chip detail-chip-part">${getPartLabel(w.bodyPart)}</span>
          ${chips}
        </div>
        ${exs.map(ex=>`
          <div class="exercise-block">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
              <div class="exercise-block-name">${escHtml(ex.name)}</div>
              <button class="demo-tiny-btn" data-name="${escHtml(ex.name)}" onclick="showDemo(this.dataset.name)">示範</button>
              <button class="demo-tiny-btn" data-name="${escHtml(ex.name)}" onclick="showExerciseStats(this.dataset.name)">📈 進度</button>
            </div>
            <div class="sets-text">${(ex.sets||[]).map((s,i)=>`第 ${i+1} 組：${kgToDisplayUnit(s.weight,ex.unit||'kg')} ${unitLabelFor(ex.unit||'kg')} × ${s.reps||0} 下`).join('<br>')}</div>
          </div>`).join('')}`;
    } else if (w.type==='swim') {
      const tChip = w.startTime && w.endTime ? `${w.startTime} ～ ${w.endTime}` : w.startTime || null;
      body = [tChip&&`時段：<span>⏱ ${tChip}</span>`,w.distance&&`距離：<span>${w.distance} ${w.distanceUnit}</span>`,w.laps&&`趟數：<span>${w.laps} 趟</span>`,w.duration&&`時間：<span>${w.duration} 分鐘</span>`]
        .filter(Boolean).map(r=>`<div class="cardio-stat">${r}</div>`).join('');
    } else {
      const tChip = w.startTime && w.endTime ? `${w.startTime} ～ ${w.endTime}` : w.startTime || null;
      body = [tChip&&`時段：<span>⏱ ${tChip}</span>`,w.distance&&`距離：<span>${w.distance} km</span>`,w.duration&&`時間：<span>${w.duration} 分鐘</span>`,w.notes&&`備註：<span>${w.notes}</span>`]
        .filter(Boolean).map(r=>`<div class="cardio-stat">${r}</div>`).join('');
    }
    return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:16px;font-weight:700">${t.icon} ${t.label}</div>
        <div style="display:flex;gap:10px">
          <button class="edit-btn" onclick="editWorkout('${w.id}','${date}')">編輯</button>
          <button class="delete-btn" onclick="deleteW('${w.id}','${date}')">刪除</button>
        </div>
      </div>${body}</div>`;
  }).join('');

  document.getElementById('content').innerHTML =
    (ws.length ? detailHtml : `<div class="empty-state"><div class="empty-icon">📝</div><p>這天還沒有訓練紀錄</p></div>`) +
    `<button class="btn btn-outline" onclick="App.goTo('selectType',{date:'${date}'})">＋ 新增訓練</button>`;
}

function deleteW(id, date) {
  if (!confirm('確定刪除這筆紀錄？')) return;
  DB.deleteWorkout(id); showToast('已刪除');
  dayDetail({date}, {title:document.getElementById('header-title'), right:document.getElementById('header-right')});
}

function editWorkout(id, date) {
  const w = DB.forDate(date).find(ww => ww.id === id);
  if (!w) return;
  window._editId = id;
  if (w.type === 'weight') {
    window.currentExercises = w.exercises.map(ex => ({
      name: ex.name, unit: ex.unit || 'kg',
      sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps }))
    }));
    window._prefilled = false;
    window._workoutStartTime = null;
    window._workoutStartStr  = w.startTime || currentTimeStr();
    window._workoutEndStr    = w.endTime   || '';
    window._workoutDuration  = w.duration  || null;
    App.goTo('addExercises', {date, part: w.bodyPart});
  } else {
    App.goTo('addCardio', {date, typeId: w.type, existing: w});
  }
}

// ── Select Type ────────────────────────────────────────────────────────────

function selectType({date}, {title}) {
  title.textContent = '選擇訓練類型';
  window.currentExercises = []; window._editId = null;
  document.getElementById('content').innerHTML = `
    <div class="type-date-label">${formatDate(date)}</div>
    <div class="type-all-list">
      ${WORKOUT_TYPES.map(t => `
        <button class="type-all-card" data-gsap="type-card" onclick="pickType('${t.id}','${date}')">
          <span class="t-all-icon" aria-hidden="true">${t.icon}</span>
          <div class="t-all-text">
            <div class="t-all-label">${t.label}</div>
          </div>
          <span class="t-all-arrow" aria-hidden="true">›</span>
        </button>`).join('')}
    </div>`;
}
function pickType(typeId, date) {
  if (typeId==='weight') App.goTo('selectBodyPart',{date});
  else App.goTo('addCardio',{date,typeId});
}

// ── Score color helper ─────────────────────────────────────────────────────

function _scoreColor(score) {
  if (score >= 70) return 'var(--success)';
  if (score >= 40) return 'var(--primary)';
  if (score > 0)   return 'var(--gold)';
  return 'var(--text-secondary)';
}

// ── Select Body Part ───────────────────────────────────────────────────────

function selectBodyPart({date}, {title}) {
  title.textContent = '選擇訓練部位';
  const es = engineState();
  document.getElementById('content').innerHTML = `
    <div class="part-grid">
      ${BODY_PARTS.map(p => {
        const s = es.scores[p.id] || {};
        const score = Math.round(s.score || 0);
        const last = DB.lastForPart(p.id);
        const sc = _scoreColor(score);
        const decay = s.decayDays > 0 && s.raw > 0
          ? `<span class="psel-badge psel-decay">-${s.decayDays}</span>` : '';
        const warn = s.warning
          ? `<span class="psel-badge psel-warn">該練了</span>` : '';
        return `<button class="part-btn" data-gsap="part-btn" onclick="pickPart('${p.id}','${date}')">
          <div class="part-btn-top">
            <div class="part-label">${p.label}</div>
            <div class="part-score-num" style="color:${sc}">${score || '—'}</div>
          </div>
          <div class="part-score-bar-bg">
            <div class="part-score-bar-fg" data-gsap="psr-bar" style="width:${score}%;background:${sc}"></div>
          </div>
          <div class="part-btn-bottom">
            <div class="part-last">${last ? `上次 ${daysAgo(last.date)}` : '尚無紀錄'}</div>
            ${decay}${warn}
          </div>
        </button>`;
      }).join('')}
    </div>`;
  if (typeof ANIM !== 'undefined') ANIM.animScoreBars();
}
function pickPart(part, date) {
  const last = DB.lastForPart(part);
  window.currentExercises = last
    ? last.exercises.map(ex => ({name:ex.name, unit:ex.unit||'kg', sets:ex.sets.map(s=>({weight:s.weight,reps:s.reps}))}))
    : [];
  window._prefilled = !!last;
  window._editId = null;
  window._workoutStartTime = Date.now();
  window._workoutStartStr  = currentTimeStr();
  window._workoutEndStr    = '';
  window._workoutDuration  = null;
  App.goTo('addExercises',{date,part});
}

// ── Add Exercises ──────────────────────────────────────────────────────────

function addExercises({date, part}, {title}) {
  title.textContent = (window._editId ? '編輯' : '') + getPartLabel(part) + ' 訓練';
  _renderExerciseScreen(date, part);
}

function _setExUnit(ei, unit, date, part) {
  _syncInputs();
  if (window.currentExercises[ei]) window.currentExercises[ei].unit = unit;
  _renderExerciseScreen(date, part);
}

function _renderExerciseScreen(date, part) {
  const exList = window.currentExercises || [];
  const prefilled = window._prefilled && exList.length > 0;
  const editMode = !!window._editId;

  const banner = prefilled
    ? `<div class="prefill-banner">📋 已帶入上次紀錄
         <button onclick="window.currentExercises=[];window._prefilled=false;_renderExerciseScreen('${date}','${part}')">清空</button>
       </div>` : '';

  const forms = exList.length === 0
    ? `<div class="empty-state" style="padding:20px 0"><div class="empty-icon">💪</div><p>點擊「選擇動作」開始記錄</p></div>`
    : exList.map((ex, ei) => {
        const exUnit = ex.unit || 'kg';
        const esc = ex.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        const pr = DB.getPR(ex.name);
        return `<div class="exercise-item">
          <div class="exercise-header" data-name="${esc}">
            <div class="ex-hd-left">
              <div class="exercise-name">${escHtml(ex.name)}</div>
              ${pr?.maxWeight > 0 ? `<div class="ex-pr-tag">🏆 PR ${kgToDisplayUnit(pr.maxWeight,exUnit)} ${unitLabelFor(exUnit)} × ${pr.maxReps} 下</div>` : ''}
              <div class="ex-unit-pills">
                <button class="ex-unit-pill${exUnit==='kg'?' active':''}" onclick="_setExUnit(${ei},'kg','${date}','${part}')">kg</button>
                <button class="ex-unit-pill${exUnit==='lbs'?' active':''}" onclick="_setExUnit(${ei},'lbs','${date}','${part}')">lbs</button>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:flex-start;padding-top:2px">
              <button class="demo-inline-btn" onclick="showDemo(this.closest('.exercise-header').dataset.name)">示範</button>
              <button class="demo-inline-btn" onclick="showExerciseStats(this.closest('.exercise-header').dataset.name)">📈</button>
              <button class="btn-icon" style="color:var(--danger)" onclick="removeEx(${ei},'${date}','${part}')">🗑️</button>
            </div>
          </div>
          <div class="set-col-headers">
            <div class="set-col-label">組</div>
            <div class="set-col-label">重量(${unitLabelFor(exUnit)})</div>
            <div class="set-col-label">次數(下)</div>
            <div></div>
          </div>
          ${ex.sets.map((s,si)=>`
            <div class="set-row">
              <div class="set-num">${si+1}</div>
              <input class="set-input" type="number" inputmode="decimal" placeholder="0" step="0.5" min="0"
                value="${kgToDisplayUnit(s.weight,exUnit)}" id="w-${ei}-${si}">
              <input class="set-input" type="number" inputmode="numeric" placeholder="0" min="0"
                value="${s.reps}" id="r-${ei}-${si}">
              <button class="btn-icon" style="color:var(--text-secondary)" onclick="removeSet(${ei},${si},'${date}','${part}')">✕</button>
            </div>`).join('')}
          <button class="add-set-btn" onclick="addSet(${ei},'${date}','${part}')">＋ 新增一組</button>
        </div>`;
      }).join('');

  const timeBar = `
    <div class="time-bar">
      <span class="time-bar-label">訓練時間</span>
      <div class="time-range">
        <input type="time" id="workout-start-time" class="time-input" value="${window._workoutStartStr || currentTimeStr()}">
        <span class="time-sep">～</span>
        <input type="time" id="workout-end-time" class="time-input" value="${window._workoutEndStr || ''}">
      </div>
    </div>`;

  document.getElementById('content').innerHTML = `
    ${timeBar}
    ${banner}
    <div id="ex-forms">${forms}</div>
    <button class="btn btn-outline" style="margin-bottom:12px" onclick="openPicker('${date}','${part}')">選擇動作</button>
    ${exList.length>0 ? `<button class="btn btn-primary" onclick="saveWeightWorkout('${date}','${part}')">${editMode?'更新紀錄':'完成紀錄'}</button>` : ''}`;
}

function _syncInputs() {
  const st = document.getElementById('workout-start-time');
  if (st && st.value) window._workoutStartStr = st.value;
  const et = document.getElementById('workout-end-time');
  if (et && et.value) window._workoutEndStr = et.value;
  (window.currentExercises||[]).forEach((ex,ei) => {
    const exUnit = ex.unit || 'kg';
    ex.sets.forEach((s,si) => {
      const w = document.getElementById(`w-${ei}-${si}`);
      const r = document.getElementById(`r-${ei}-${si}`);
      if (w) s.weight = w.value !== '' ? displayToKgUnit(w.value, exUnit) : '';
      if (r) s.reps = r.value;
    });
  });
}

function addExToList(name, date, part) {
  if ((window.currentExercises||[]).find(e=>e.name===name)) { showToast('此動作已加入'); closePicker(); return; }
  _syncInputs();
  window.currentExercises = window.currentExercises || [];
  window.currentExercises.push({name, unit: getUnit(), sets:[{weight:'',reps:''}]});
  closePicker();
  _renderExerciseScreen(date, part);
}

function removeEx(ei, date, part) { _syncInputs(); window.currentExercises.splice(ei,1); _renderExerciseScreen(date,part); }
function addSet(ei, date, part) {
  _syncInputs();
  const sets = window.currentExercises[ei].sets;
  const last = sets[sets.length - 1];
  const hasFill = last && (last.weight !== '' || last.reps !== '');
  sets.push(hasFill ? { weight: last.weight, reps: last.reps } : { weight: '', reps: '' });
  if (!window._editId) RestTimer.start();
  _renderExerciseScreen(date, part);
}
function removeSet(ei, si, date, part) {
  if (window.currentExercises[ei].sets.length===1) { showToast('至少需要一組'); return; }
  _syncInputs(); window.currentExercises[ei].sets.splice(si,1); _renderExerciseScreen(date,part);
}

function saveWeightWorkout(date, part) {
  _syncInputs();
  const exercises = (window.currentExercises||[])
    .map(ex=>({name:ex.name, unit:ex.unit||'kg', sets:ex.sets.filter(s=>s.weight!==''||s.reps!=='').map(s=>({weight:parseFloat(s.weight)||0,reps:parseInt(s.reps)||0}))}))
    .filter(ex=>ex.sets.length>0);
  if (!exercises.length) { showToast('請填寫至少一組資料'); return; }

  const startTimeEl = document.getElementById('workout-start-time');
  const endTimeEl   = document.getElementById('workout-end-time');
  const startTime = startTimeEl?.value || window._workoutStartStr || '';
  const endTime   = endTimeEl?.value   || window._workoutEndStr   || '';
  let duration = calcDuration(startTime, endTime) || window._workoutDuration || null;
  if (!duration && window._workoutStartTime) {
    const mins = Math.round((Date.now() - window._workoutStartTime) / 60000);
    if (mins > 0 && mins <= 600) duration = mins;
  }

  const payload = {date, timestamp:Date.now(), type:'weight', bodyPart:part, exercises, startTime, ...(endTime?{endTime}:{}), duration};
  const wasEdit = !!window._editId;
  const _xpBefore = levelInfo(totalXp());
  if (wasEdit) {
    DB.updateWorkout(window._editId, payload);
  } else {
    const existing = DB.forDate(date).find(w => w.type==='weight' && w.bodyPart===part);
    if (existing) {
      DB.updateWorkout(existing.id, {...payload, startTime: existing.startTime || payload.startTime});
    } else {
      DB.addWorkout({id:genId(), ...payload});
    }
  }
  const prNames = DB.checkAndUpdatePRs(exercises, date);
  const _xpAfter = levelInfo(totalXp());
  const _gain = _xpAfter.total - _xpBefore.total;
  const xpTag = _gain > 0 ? `　+${_gain} XP` : '';
  showToast((prNames.length
    ? `🏆 新紀錄！${prNames.slice(0,2).join('・')}${prNames.length > 2 ? '…' : ''}`
    : (wasEdit ? '已更新 ✓' : '訓練已儲存 ✓')) + xpTag);
  if (typeof ANIM !== 'undefined') ANIM.queuePartGlow(part);
  if (_xpAfter.level > _xpBefore.level) setTimeout(() => showLevelUp(_xpAfter.level), 700);
  window.currentExercises = []; window._editId = null;
  setTimeout(()=>{ stack.length=0; App.goTo('dayDetail',{date}); }, 500);
}

// ── Exercise Picker (Bottom Sheet) ─────────────────────────────────────────

let _pd='', _pp='';

function openPicker(date, part) {
  if (document.getElementById('p-sheet')) return;
  lockScroll();
  _pd=date; _pp=part; _syncInputs();

  const overlay = Object.assign(document.createElement('div'),{id:'p-overlay',className:'overlay'});
  overlay.onclick = closePicker;
  document.body.appendChild(overlay);

  const sheet = Object.assign(document.createElement('div'),{id:'p-sheet',className:'bottom-sheet'});
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-top">
      <span class="sheet-title">選擇動作</span>
      <button class="sheet-close" onclick="closePicker()">✕</button>
    </div>
    <div class="sheet-search-wrap">
      <input id="picker-search" class="sheet-search-input" type="text" placeholder="🔍 搜尋動作…" autocomplete="off" oninput="_filterPicker(this.value)">
    </div>
    <div id="picker-list" class="sheet-list">${_buildPickerList('')}</div>
    <div class="sheet-custom">
      <input id="custom-ex-input" class="form-input" type="text" placeholder="自訂動作名稱…">
      <button class="btn btn-primary btn-sm" onclick="_addCustomEx()">新增</button>
    </div>`;
  document.body.appendChild(sheet);
  requestAnimationFrame(()=>{ overlay.classList.add('open'); sheet.classList.add('open'); });
}

function closePicker() {
  unlockScroll();
  ['p-sheet','p-overlay'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.classList.remove('open'); setTimeout(()=>el.remove(),300);
  });
}

// 取得動作對應的英文名（來自 exercises-dataset）
function _exEngName(zhName) {
  const m = _mapEntry(zhName);
  if (!m || !m.l) return '';
  const ex = EX_INDEX_BY_ID[m.l];
  return ex ? ex.name : '';
}

function _buildPickerList(q) {
  const added = new Set((window.currentExercises||[]).map(e=>e.name));
  const last = DB.lastForPart(_pp);
  const recentNames = last ? last.exercises.map(e=>e.name) : [];
  const all = [...new Set([...recentNames,...(PRESET_EXERCISES[_pp]||[]),...DB.customEx(_pp)])];
  const qLow = q.trim().toLowerCase();
  // 同時搜尋中文名與英文原名（REDESIGN_PROMPT：附英文原名搜尋）
  const filtered = qLow
    ? all.filter(n => n.toLowerCase().includes(qLow) || _exEngName(n).toLowerCase().includes(qLow))
    : all;
  if (!filtered.length) return `<div style="padding:24px;text-align:center;color:var(--text-secondary);font-size:14px">找不到「${q}」</div>`;

  const recentFiltered = !qLow ? recentNames.filter(n=>filtered.includes(n)) : [];
  const rest = filtered.filter(n=>!recentNames.includes(n)||qLow);

  const item = name => {
    const isAdded = added.has(name), isRecent = !qLow && recentNames.includes(name);
    const esc = name.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    const thumbs = getThumbSources(name);
    const engName = _exEngName(name);

    const thumbHtml = thumbs.length
      ? `<img class="ex-thumb" src="${thumbs[0]}" data-next="${thumbs.slice(1).join('|')}" loading="lazy" alt=""
           onerror="_thumbNext(this)">`
      : `<span class="ex-thumb-icon">💪</span>`;

    return `<div class="picker-ex-row${isAdded?' picker-ex-added':''}" data-name="${esc}">
      <div class="ex-thumb-wrap" onclick="showDemo(this.closest('.picker-ex-row').dataset.name)">
        ${thumbHtml}
      </div>
      <div class="picker-ex-info" onclick="_pickerTap(this)">
        <div class="picker-ex-name">${escHtml(name)}</div>
        <div class="picker-ex-meta">
          ${isRecent?'<span class="recent-tag">上次使用</span>':''}
          ${isAdded?'<span class="added-tag">✓ 已加入</span>':''}
          ${engName && !isAdded && !isRecent ? `<span class="picker-ex-eng">${escHtml(engName)}</span>` : ''}
        </div>
      </div>
    </div>`;
  };

  let html='';
  if (recentFiltered.length) html+=`<div class="picker-sec-label">上次使用</div>${recentFiltered.map(item).join('')}`;
  if (rest.length) html+=`<div class="picker-sec-label">${qLow?'搜尋結果':'所有動作'}</div>${rest.map(item).join('')}`;
  return html;
}

function _pickerTap(el) {
  const row = el.closest('.picker-ex-row');
  if (!row||row.classList.contains('picker-ex-added')) return;
  addExToList(row.dataset.name, _pd, _pp);
}
function _pickerDemo(el) {
  const row = el.closest('.picker-ex-row');
  if (row) showDemo(row.dataset.name);
}
function _filterPicker(q) { const el=document.getElementById('picker-list'); if(el) el.innerHTML=_buildPickerList(q); }
function _addCustomEx() {
  const input=document.getElementById('custom-ex-input');
  const name=input?.value.trim();
  if (!name) { showToast('請輸入動作名稱'); return; }
  if (name.length > 20) { showToast('動作名稱最多 20 字'); return; }
  DB.addCustomEx(_pp,name); addExToList(name,_pd,_pp);
}

// ── Add Cardio ─────────────────────────────────────────────────────────────

function addCardio({date, typeId, existing}, {title}) {
  title.textContent = (window._editId?'編輯：':'')+getTypeInfo(typeId).label;
  const isSwim = typeId==='swim';
  const initStart = existing?.startTime || currentTimeStr();
  const initEnd   = existing?.endTime   || '';

  document.getElementById('content').innerHTML = `
    <div class="time-bar">
      <span class="time-bar-label">訓練時間</span>
      <div class="time-range">
        <input type="time" id="cardio-start" class="time-input" value="${initStart}">
        <span class="time-sep">～</span>
        <input type="time" id="cardio-end" class="time-input" value="${initEnd}">
      </div>
    </div>
    <div class="card">
      ${isSwim ? `
        <div class="form-group">
          <div class="form-label">記錄距離？</div>
          <div class="option-row" style="margin-bottom:8px">
            <button class="option-btn selected" id="tog-dist" onclick="togSwim('dist')">是</button>
            <button class="option-btn" id="tog-nodist" onclick="togSwim('nodist')">否</button>
          </div>
          <div id="swim-dist-row" style="display:flex;gap:8px">
            <input type="number" class="form-input" id="swim-dist" placeholder="距離" inputmode="decimal" step="0.1" style="flex:2">
            <select class="form-input" id="swim-unit" style="flex:1"><option value="m">公尺</option><option value="km">公里</option></select>
          </div>
        </div>
        <div class="form-group">
          <div class="form-label">記錄趟數？</div>
          <div class="option-row" style="margin-bottom:8px">
            <button class="option-btn selected" id="tog-laps" onclick="togSwim('laps')">是</button>
            <button class="option-btn" id="tog-nolaps" onclick="togSwim('nolaps')">否</button>
          </div>
          <div id="swim-laps-row"><input type="number" class="form-input" id="swim-laps" placeholder="趟數" inputmode="numeric"></div>
        </div>
        <div class="form-group">
          <div class="form-label">時間（分鐘，可不填，自動從起訖計算）</div>
          <input type="number" class="form-input" id="duration" placeholder="例：45" inputmode="numeric">
        </div>
      ` : `
        <div class="form-group">
          <div class="form-label">距離（公里）</div>
          <input type="number" class="form-input" id="distance" placeholder="例：5.0" inputmode="decimal" step="0.1">
        </div>
        <div class="form-group">
          <div class="form-label">時間（分鐘，可不填，自動從起訖計算）</div>
          <input type="number" class="form-input" id="duration" placeholder="例：30" inputmode="numeric">
        </div>
        ${typeId==='bike'||typeId==='outdoor_run'?`
        <div class="form-group">
          <div class="form-label">備註（選填）</div>
          <input type="text" class="form-input" id="notes" placeholder="例：山路、天氣晴">
        </div>`:''}
      `}
    </div>
    <button class="btn btn-primary" onclick="saveCardio('${date}','${typeId}')">${window._editId?'更新紀錄':'完成紀錄'}</button>`;

  window._swimShow = {dist:true, laps:true};

  if (existing) {
    setTimeout(()=>{
      if (isSwim) {
        if (existing.distance != null) { const el=document.getElementById('swim-dist'); if(el) el.value=existing.distance; const su=document.getElementById('swim-unit'); if(su) su.value=existing.distanceUnit||'m'; }
        if (existing.laps) { const el=document.getElementById('swim-laps'); if(el) el.value=existing.laps; }
      } else {
        if (existing.distance) { const el=document.getElementById('distance'); if(el) el.value=existing.distance; }
        if (existing.notes) { const el=document.getElementById('notes'); if(el) el.value=existing.notes; }
      }
      if (existing.duration) { const el=document.getElementById('duration'); if(el) el.value=existing.duration; }
    }, 0);
  }
}

function togSwim(opt) {
  const s=window._swimShow=window._swimShow||{dist:true,laps:true};
  const isDist=opt==='dist'||opt==='nodist';
  if (isDist) {
    s.dist=opt==='dist';
    document.getElementById('tog-dist').classList.toggle('selected',s.dist);
    document.getElementById('tog-nodist').classList.toggle('selected',!s.dist);
    document.getElementById('swim-dist-row').style.display=s.dist?'flex':'none';
  } else {
    s.laps=opt==='laps';
    document.getElementById('tog-laps').classList.toggle('selected',s.laps);
    document.getElementById('tog-nolaps').classList.toggle('selected',!s.laps);
    document.getElementById('swim-laps-row').style.display=s.laps?'block':'none';
  }
}

function saveCardio(date, typeId) {
  const isSwim=typeId==='swim';
  const startTime = document.getElementById('cardio-start')?.value || '';
  const endTime   = document.getElementById('cardio-end')?.value   || '';
  const w={id:window._editId||genId(), date, timestamp:Date.now(), type:typeId};
  if (startTime) w.startTime = startTime;
  if (endTime)   w.endTime   = endTime;

  if (isSwim) {
    const s=window._swimShow||{dist:true,laps:true};
    const dv=document.getElementById('swim-dist')?.value;
    const lv=document.getElementById('swim-laps')?.value;
    const dur=document.getElementById('duration')?.value;
    if (!dv&&!lv&&!dur&&!startTime) { showToast('請至少填寫一項資料'); return; }
    if (s.dist&&dv) { w.distance=parseFloat(dv); w.distanceUnit=document.getElementById('swim-unit').value; }
    if (s.laps&&lv) w.laps=parseInt(lv);
    if (dur) w.duration=parseInt(dur);
    else { const calc=calcDuration(startTime,endTime); if(calc) w.duration=calc; }
  } else {
    const dv=document.getElementById('distance')?.value;
    const dur=document.getElementById('duration')?.value;
    const notes=document.getElementById('notes')?.value;
    if (!dv&&!dur&&!startTime) { showToast('請至少填寫距離或時間'); return; }
    if (dv) w.distance=parseFloat(dv);
    if (dur) w.duration=parseInt(dur);
    else { const calc=calcDuration(startTime,endTime); if(calc) w.duration=calc; }
    if (notes) w.notes=notes.trim();
  }

  const _xpBefore = levelInfo(totalXp());
  if (window._editId) { DB.updateWorkout(window._editId, w); }
  else { DB.addWorkout(w); }
  const _xpAfter = levelInfo(totalXp());
  const _gain = _xpAfter.total - _xpBefore.total;
  const xpTag = _gain > 0 ? `　+${_gain} XP` : '';
  showToast((window._editId ? '已更新 ✓' : '訓練已儲存 ✓') + xpTag);
  if (_xpAfter.level > _xpBefore.level) setTimeout(() => showLevelUp(_xpAfter.level), 700);
  window._editId = null;
  setTimeout(()=>{ stack.length=0; App.goTo('dayDetail',{date}); },500);
}

// ── Exercise Stats Modal ────────────────────────────────────────────────────

function showExerciseStats(name) {
  if (document.getElementById('stats-modal')) return;
  lockScroll();
  const pr   = DB.getPR(name);
  const hist = DB.getExerciseHistory(name);
  const u    = unitLabel();

  const prSection = pr?.maxWeight > 0 ? `
    <div class="stats-pr-grid">
      <div class="stats-pr-card">
        <div class="stats-pr-val">${kgToDisplay(pr.maxWeight)}<span class="stats-pr-unit"> ${u}</span></div>
        <div class="stats-pr-label">🏆 最大重量</div>
        ${pr.maxWeightDate ? `<div class="stats-pr-date">${formatDateShort(pr.maxWeightDate)}</div>` : ''}
      </div>
      <div class="stats-pr-card">
        <div class="stats-pr-val">${pr.maxReps}<span class="stats-pr-unit"> 下</span></div>
        <div class="stats-pr-label">最多次數</div>
        ${pr.maxRepsDate ? `<div class="stats-pr-date">${formatDateShort(pr.maxRepsDate)}</div>` : ''}
      </div>
    </div>` : '<p style="color:var(--text-secondary);font-size:14px;text-align:center;padding:12px 0">尚無個人紀錄</p>';

  const weightSeries = hist.map(h => ({ value: kgToDisplay(h.maxWeight), label: h.date.slice(5) }));
  const volSeries    = hist.map(h => ({ value: Math.round(kgToDisplay(h.totalVol)), label: h.date.slice(5) }));

  const chartSection = hist.length >= 2 ? `
    <div style="margin-bottom:16px">
      <div class="stats-chart-title">📈 最大重量 (${u})</div>
      ${buildSvgLineChart(weightSeries)}
    </div>
    <div style="margin-bottom:16px">
      <div class="stats-chart-title">📊 單次訓練量 (${u})</div>
      ${buildSvgLineChart(volSeries, { color: '#2fd06f' })}
    </div>` : '';

  const histSection = hist.length ? `
    <div class="stats-chart-title" style="margin-bottom:6px">歷史紀錄</div>
    ${[...hist].reverse().slice(0, 10).map(h => `
      <div class="stats-hist-row">
        <span class="stats-hist-date">${formatDateShort(h.date)}</span>
        <span class="stats-hist-val">${kgToDisplay(h.maxWeight)} ${u} × ${h.maxReps} 下</span>
      </div>`).join('')}` : '';

  const overlay = document.createElement('div');
  overlay.id = 'stats-modal'; overlay.className = 'modal-overlay';
  overlay.onclick = e => { if (e.target === overlay) closeStats(); };
  overlay.innerHTML = `
    <div class="stats-card">
      <div class="modal-header" style="padding:16px 16px 12px;flex-shrink:0">
        <span class="modal-title">${escHtml(name)}</span>
        <button class="modal-close" onclick="closeStats()">✕</button>
      </div>
      <div class="stats-body">
        ${prSection}
        ${chartSection}
        ${histSection}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeStats() {
  const el = document.getElementById('stats-modal');
  if (!el) return;
  unlockScroll();
  el.classList.remove('open');
  setTimeout(() => el.remove(), 250);
}

// ── Exercise Stats Screen ────────────────────────────────────────────────────

function exerciseStats({name}, {title}) {
  title.textContent = name;
  showExerciseStats(name);
  App.back();
}

// ── Data Export / Import ────────────────────────────────────────────────

function exportData() {
  const raw = localStorage.getItem(DB.KEY);
  if (!raw) { showToast('沒有資料可匯出'); return; }
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url, download: `健身紀錄_${getTodayStr()}.json`
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  localStorage.setItem('lastExportDate', getTodayStr());
  showToast('已匯出 ✓');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json'; input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = e => {
    const file = e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed.workouts)) { showToast('檔案格式不正確'); return; }
        const cur = DB._load();
        const existingIds = new Set(cur.workouts.map(w => w.id));
        const incoming = parsed.workouts.filter(w => w && w.id && !existingIds.has(w.id));
        const dupCount = parsed.workouts.length - incoming.length;
        if (!incoming.length) { showToast('沒有新資料（全部重複）'); return; }
        if (!confirm(`合併 ${incoming.length} 筆新紀錄${dupCount ? `，略過 ${dupCount} 筆重複` : ''}？`)) return;

        const merged = { ...cur, workouts: [...cur.workouts, ...incoming] };

        if (parsed.custom) {
          Object.keys(parsed.custom).forEach(part => {
            merged.custom[part] = [...new Set([...(merged.custom[part]||[]), ...(parsed.custom[part]||[])])];
          });
        }
        if (parsed.prs) {
          merged.prs = merged.prs || {};
          Object.keys(parsed.prs).forEach(name => {
            const c = merged.prs[name] || {}, imp = parsed.prs[name] || {};
            merged.prs[name] = {
              maxWeight:     (c.maxWeight||0) >= (imp.maxWeight||0) ? c.maxWeight : imp.maxWeight,
              maxWeightDate: (c.maxWeight||0) >= (imp.maxWeight||0) ? c.maxWeightDate : imp.maxWeightDate,
              maxReps:       (c.maxReps||0) >= (imp.maxReps||0) ? c.maxReps : imp.maxReps,
              maxRepsDate:   (c.maxReps||0) >= (imp.maxReps||0) ? c.maxRepsDate : imp.maxRepsDate,
              maxVolume:     (c.maxVolume||0) >= (imp.maxVolume||0) ? c.maxVolume : imp.maxVolume,
              maxVolumeDate: (c.maxVolume||0) >= (imp.maxVolume||0) ? c.maxVolumeDate : imp.maxVolumeDate,
            };
          });
        }

        localStorage.setItem(DB.KEY, JSON.stringify(merged));
        showToast(`已合併 ${incoming.length} 筆 ✓`);
        setTimeout(() => App.goHome(), 300);
      } catch { showToast('檔案讀取失敗，請確認格式正確'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── Avatar / XP System ─────────────────────────────────────────────────────
//
// 設計原則：經驗值永遠由「全部訓練紀錄」重新計算（純函數），
// 因此編輯或刪除紀錄時等級會自動修正，不會有殘留誤差。

const STAGES = [
  { min: 1,  title: '健身新手',   outfit: '#94a3b8', pants: '#64748b' },
  { min: 5,  title: '運動愛好者', outfit: '#38bdf8', pants: '#0284c7' },
  { min: 10, title: '健身達人',   outfit: '#34d399', pants: '#059669' },
  { min: 15, title: '肌肉戰士',   outfit: '#fb923c', pants: '#ea580c' },
  { min: 20, title: '健身大師',   outfit: '#a78bfa', pants: '#7c3aed' },
  { min: 30, title: '傳奇冠軍',   outfit: '#fbbf24', pants: '#d97706' },
];

function stageFor(level) {
  let s = STAGES[0];
  STAGES.forEach(st => { if (level >= st.min) s = st; });
  return s;
}
function stageIndex(level) {
  let i = 0;
  STAGES.forEach((st, idx) => { if (level >= st.min) i = idx; });
  return i;
}
function nextStage(level) { return STAGES.find(st => st.min > level) || null; }

// 單筆訓練 → XP（上限 300，避免單筆灌爆）
function calcWorkoutXp(w) {
  let xp = 20; // 基礎：有動就有分
  if (w.type === 'weight') {
    const exs = w.exercises || [];
    const vol  = exs.reduce((s,ex)=>s+(ex.sets||[]).reduce((s2,set)=>s2+(parseFloat(set.weight)||0)*(parseInt(set.reps)||0),0),0);
    const sets = exs.reduce((s,ex)=>s+(ex.sets||[]).length,0);
    xp += Math.round(vol / 100) + sets * 2;
  } else if (w.type === 'swim') {
    let m = parseFloat(w.distance) || 0;
    if (w.distanceUnit === 'km') m *= 1000;
    xp += Math.round(m / 50) + Math.round((w.duration || 0) / 2);
  } else if (w.type === 'bike') {
    xp += Math.round((parseFloat(w.distance) || 0) * 5) + Math.round((w.duration || 0) / 2);
  } else { // indoor_run / outdoor_run
    xp += Math.round((parseFloat(w.distance) || 0) * 10) + Math.round((w.duration || 0) / 2);
  }
  return Math.min(300, xp);
}

function totalXp() { return DB.all().reduce((s, w) => s + calcWorkoutXp(w), 0); }

// 升到下一級所需 XP：Lv1→2 = 100，之後每級 +50
function xpToNext(level) { return 100 + (level - 1) * 50; }

function levelInfo(xp) {
  let level = 1, rem = xp;
  while (level < 99 && rem >= xpToNext(level)) { rem -= xpToNext(level); level++; }
  return { level, cur: rem, need: xpToNext(level), total: xp };
}

// ── Avatar SVG ─────────────────────────────────────────────────────────────

function buildAvatarSvg(a, level) {
  const h = parseFloat(a.height) || 170, wt = parseFloat(a.weight) || 65;
  const bmi = wt / Math.pow(h / 100, 2);
  const si = stageIndex(level), st = stageFor(level);
  const skin = '#fcd7b8', skinDark = '#f0b98e';
  const hair = a.gender === 'f' ? '#6b4226' : '#3d2f23';

  // 體型：BMI → 身寬；身高 → 腿長
  const bodyW = 56 * Math.min(1.4, Math.max(0.75, 0.78 + (bmi - 18) * 0.035));
  const legH  = 40 * Math.min(1.15, Math.max(0.8, 0.85 + (h - 165) * 0.004));
  const armW  = 11 + si * 2;                 // 等級越高手臂越壯
  const flex  = si >= 3;                     // 高階：舉手秀肌肉
  const cx = 100, headY = 58, headR = 33;
  const torsoY = headY + headR + 2, torsoH = 62, legY = torsoY + torsoH - 6;
  const shY = torsoY + 10, shL = cx - bodyW / 2 + 3, shR = cx + bodyW / 2 - 3;

  // 髮型
  const hairSvg = a.gender === 'f'
    ? `<path d="M ${cx-headR} ${headY} a ${headR} ${headR} 0 0 1 ${headR*2} 0 l 0 -6 a ${headR} ${headR} 0 0 0 -${headR*2} 0 z" fill="${hair}"/>
       <path d="M ${cx-headR} ${headY-2} q -6 26 4 40 q 4 -18 2 -32 z" fill="${hair}"/>
       <path d="M ${cx+headR} ${headY-2} q 6 26 -4 40 q -4 -18 -2 -32 z" fill="${hair}"/>
       <circle cx="${cx}" cy="${headY-headR+4}" r="14" fill="${hair}"/>
       <path d="M ${cx+headR-8} ${headY-headR+10} q 16 4 12 34 q -8 4 -12 0 q 6 -18 0 -34" fill="${hair}"/>`
    : `<path d="M ${cx-headR} ${headY} a ${headR} ${headR} 0 0 1 ${headR*2} 0 l 0 -8 q -10 -16 -33 -14 q -23 -2 -33 14 z" fill="${hair}"/>`;

  // 配件（依階段解鎖）
  const wristband = si >= 1;
  const headband  = si >= 2;
  const dumbbell  = si >= 3;
  const cape      = si >= 4;
  const crown     = si >= 5;

  // 手臂（垂下或舉起）
  let armsSvg;
  if (flex) {
    armsSvg = `
      <path d="M ${shL} ${shY+4} L ${shL-16} ${shY-2} L ${shL-18} ${shY-26}" fill="none" stroke="${skin}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M ${shR} ${shY+4} L ${shR+16} ${shY-2} L ${shR+18} ${shY-26}" fill="none" stroke="${skin}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/>
      ${dumbbell ? `
        <g transform="translate(${shR+18},${shY-30})">
          <rect x="-16" y="-3" width="32" height="6" rx="3" fill="#475569"/>
          <rect x="-22" y="-9" width="8" height="18" rx="3" fill="#334155"/>
          <rect x="14" y="-9" width="8" height="18" rx="3" fill="#334155"/>
        </g>` : ''}
      ${wristband ? `
        <rect x="${shL-24}" y="${shY-22}" width="12" height="7" rx="3.5" fill="#ef4444" transform="rotate(8 ${shL-18} ${shY-18})"/>
        <rect x="${shR+12}" y="${shY-22}" width="12" height="7" rx="3.5" fill="#ef4444" transform="rotate(-8 ${shR+18} ${shY-18})"/>` : ''}`;
  } else {
    armsSvg = `
      <path d="M ${shL} ${shY+2} L ${shL-10} ${shY+40}" fill="none" stroke="${skin}" stroke-width="${armW}" stroke-linecap="round"/>
      <path d="M ${shR} ${shY+2} L ${shR+10} ${shY+40}" fill="none" stroke="${skin}" stroke-width="${armW}" stroke-linecap="round"/>
      ${wristband ? `
        <rect x="${shL-17}" y="${shY+28}" width="13" height="7" rx="3.5" fill="#ef4444"/>
        <rect x="${shR+4}" y="${shY+28}" width="13" height="7" rx="3.5" fill="#ef4444"/>` : ''}`;
  }

  return `<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    ${crown ? `<circle cx="${cx}" cy="118" r="86" fill="#fbbf24" opacity="0.12"/>` : ''}
    ${cape ? `<path d="M ${cx-bodyW/2-2} ${shY} Q ${cx-bodyW} ${legY+18} ${cx-bodyW/2-8} ${legY+26} L ${cx+bodyW/2+8} ${legY+26} Q ${cx+bodyW} ${legY+18} ${cx+bodyW/2+2} ${shY} Z" fill="#dc2626" opacity="0.9"/>` : ''}
    ${armsSvg}
    <rect x="${cx-9-13}" y="${legY}" width="15" height="${legH}" rx="7" fill="${st.pants}"/>
    <rect x="${cx+9-2}"  y="${legY}" width="15" height="${legH}" rx="7" fill="${st.pants}"/>
    <ellipse cx="${cx-14}" cy="${legY+legH+3}" rx="11" ry="6" fill="#374151"/>
    <ellipse cx="${cx+15}" cy="${legY+legH+3}" rx="11" ry="6" fill="#374151"/>
    <rect x="${cx-bodyW/2}" y="${torsoY}" width="${bodyW}" height="${torsoH}" rx="17" fill="${st.outfit}"/>
    ${si >= 2 ? `<path d="M ${cx-10} ${torsoY+16} q 10 8 20 0 M ${cx-10} ${torsoY+30} q 10 8 20 0" stroke="rgba(0,0,0,0.14)" stroke-width="3" fill="none" stroke-linecap="round"/>` : ''}
    <circle cx="${cx}" cy="${headY}" r="${headR}" fill="${skin}"/>
    <path d="M ${cx-headR} ${headY} a ${headR} ${headR} 0 0 0 ${headR*2} 0" fill="${skinDark}" opacity="0.25"/>
    ${hairSvg}
    ${headband ? `<rect x="${cx-headR+2}" y="${headY-14}" width="${headR*2-4}" height="8" rx="4" fill="#ef4444"/>` : ''}
    ${crown ? `<path d="M ${cx-20} ${headY-headR-4} L ${cx-14} ${headY-headR-20} L ${cx-6} ${headY-headR-6} L ${cx} ${headY-headR-24} L ${cx+6} ${headY-headR-6} L ${cx+14} ${headY-headR-20} L ${cx+20} ${headY-headR-4} Z" fill="#fbbf24" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>` : ''}
    <circle cx="${cx-12}" cy="${headY+2}" r="3.6" fill="#1f2937"/>
    <circle cx="${cx+12}" cy="${headY+2}" r="3.6" fill="#1f2937"/>
    <circle cx="${cx-11}" cy="${headY+1}" r="1.2" fill="#fff"/>
    <circle cx="${cx+13}" cy="${headY+1}" r="1.2" fill="#fff"/>
    <circle cx="${cx-20}" cy="${headY+11}" r="5" fill="#f87171" opacity="0.35"/>
    <circle cx="${cx+20}" cy="${headY+11}" r="5" fill="#f87171" opacity="0.35"/>
    <path d="M ${cx-8} ${headY+13} q 8 7 16 0" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ── Onboarding（建立 / 編輯角色）───────────────────────────────────────────

window._obG = 'm';

function onboarding(params, {title}) {
  const a = DB.getAvatar();
  const isEdit = !!a;
  title.textContent = isEdit ? '編輯角色資料' : '建立你的角色';
  window._obG = a?.gender || 'm';
  document.getElementById('content').innerHTML = `
    <div class="card" style="text-align:center">
      <div id="ob-preview" style="margin:4px auto 8px;width:150px">
        ${buildAvatarSvg({gender:window._obG, height:a?.height||170, weight:a?.weight||65}, levelInfo(totalXp()).level)}
      </div>
      ${isEdit ? '' : `<p style="font-size:13px;color:var(--text-secondary);line-height:1.7">輸入你的資料，生成專屬虛擬人物。<br>之後每次運動都會化成經驗值，<br>角色會跟著你一起變強！💪</p>`}
    </div>
    <div class="card">
      <div class="form-group">
        <div class="form-label">暱稱</div>
        <input class="form-input" id="ob-name" maxlength="12" placeholder="例：小勇者" value="${a ? escHtml(a.name) : ''}">
      </div>
      <div class="form-group">
        <div class="form-label">性別</div>
        <div class="option-row">
          <button class="option-btn${window._obG==='m'?' selected':''}" id="ob-g-m" onclick="_obGender('m')">男生</button>
          <button class="option-btn${window._obG==='f'?' selected':''}" id="ob-g-f" onclick="_obGender('f')">女生</button>
        </div>
      </div>
      <div class="form-group">
        <div class="form-label">身高（cm）</div>
        <input class="form-input" id="ob-height" type="number" inputmode="decimal" placeholder="例：170" value="${a?.height||''}" oninput="_obPreview()">
      </div>
      <div class="form-group">
        <div class="form-label">體重（kg）</div>
        <input class="form-input" id="ob-weight" type="number" inputmode="decimal" placeholder="例：65" value="${a?.weight||''}" oninput="_obPreview()">
      </div>
    </div>
    <button class="btn btn-primary" onclick="_obSave()">${isEdit ? '儲存變更' : '🎮 開始養成之旅'}</button>`;
}

function _obGender(g) {
  window._obG = g;
  document.getElementById('ob-g-m').classList.toggle('selected', g==='m');
  document.getElementById('ob-g-f').classList.toggle('selected', g==='f');
  _obPreview();
}

function _obPreview() {
  const h = parseFloat(document.getElementById('ob-height')?.value) || 170;
  const w = parseFloat(document.getElementById('ob-weight')?.value) || 65;
  const el = document.getElementById('ob-preview');
  if (el) el.innerHTML = buildAvatarSvg({gender:window._obG, height:h, weight:w}, levelInfo(totalXp()).level);
}

function _obSave() {
  const name = document.getElementById('ob-name').value.trim();
  const h = parseFloat(document.getElementById('ob-height').value);
  const w = parseFloat(document.getElementById('ob-weight').value);
  if (!name) { showToast('請輸入暱稱'); return; }
  if (!(h >= 100 && h <= 250)) { showToast('請輸入正確身高（100–250 cm）'); return; }
  if (!(w >= 25 && w <= 300)) { showToast('請輸入正確體重（25–300 kg）'); return; }
  const isNew = !DB.getAvatar();
  DB.saveAvatar({ name, gender: window._obG, height: h, weight: w, createdAt: DB.getAvatar()?.createdAt || Date.now() });
  showToast(isNew ? `歡迎，${name}！開始你的旅程 🎉` : '已更新 ✓');
  stack.length = 0;
  _render('avatar', {});
}

// ── Avatar screen helpers ──────────────────────────────────────────────────

function _fmtVol(all) {
  const v = (all || []).filter(w => w.type === 'weight')
    .reduce((s, w) => s + (w.exercises || []).reduce((s2, ex) =>
      (ex.sets || []).reduce((s3, set) => s3 + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), s2), 0), 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + 't' : Math.round(v);
}

function _showWeightUpdate() {
  const p = document.getElementById('weight-input-panel');
  if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function _saveWeightUpdate() {
  const val = parseFloat(document.getElementById('new-weight-val')?.value);
  if (!(val >= 25 && val <= 300)) { showToast('請輸入正確體重（25–300 kg）'); return; }
  DB.addBodyWeight(getTodayStr(), val);
  showToast(`體重已更新：${val} kg ✓`);
  avatarScreen({}, { title: document.getElementById('header-title'), right: document.getElementById('header-right') });
}

function _startRest() {
  const ps = DB.getRestPeriods();
  ps.push({ start: getTodayStr() });
  DB.setRestPeriods(ps);
  showToast('休養模式已開始 🛌');
  avatarScreen({}, { title: document.getElementById('header-title'), right: document.getElementById('header-right') });
}

function _endRest() {
  const today = getTodayStr();
  const ps = DB.getRestPeriods().map(r =>
    Engine.isInRest(today, [r]) ? { ...r, end: today } : r);
  DB.setRestPeriods(ps);
  showToast('休養模式已結束 💪');
  avatarScreen({}, { title: document.getElementById('header-title'), right: document.getElementById('header-right') });
}

// ── Avatar Screen（角色頁）─────────────────────────────────────────────────

function avatarScreen(_, {title, right}) {
  title.textContent = '我的角色';
  right.innerHTML = `<button class="edit-btn" onclick="App.goTo('onboarding',{})">編輯</button>`;
  const a = DB.getAvatar();
  const xp = totalXp(), li = levelInfo(xp), st = stageFor(li.level), nx = nextStage(li.level);
  const es = engineState();
  const pct = Math.round(li.cur / li.need * 100);
  const all = DB.all();

  // 部位分數列
  const partScoreHtml = BODY_PARTS.map(p => {
    const s = es.scores[p.id] || {};
    const score = Math.round(s.score || 0);
    const sc = _scoreColor(score);
    const decay = s.decayDays > 0 && s.raw > 0
      ? `<span class="psr-badge psr-decay">-${s.decayDays}</span>` : '';
    const warn = s.warning
      ? `<span class="psr-badge psr-warn">!</span>` : '';
    return `<div class="psr-row">
      <div class="psr-name">${p.label}</div>
      <div class="psr-bar-bg"><div class="psr-bar-fg" data-gsap="psr-bar" style="width:${score}%;background:${sc}"></div></div>
      <div class="psr-right">
        <span class="psr-score" style="color:${sc}">${score}</span>
        ${decay}${warn}
      </div>
    </div>`;
  }).join('');

  // 耐力
  const endScore = es.endurance.score;
  const endKm = es.endurance.eqKm;
  const endSc = _scoreColor(endScore);

  // 體重
  const staleDays = es.weightStaleDays;
  const weightWarn = staleDays !== null && staleDays > 21;
  const staleLabel = staleDays === null ? '尚未記錄'
    : staleDays === 0 ? '今天' : `${staleDays} 天前`;
  const bmi = (es.bodyWeightKg / Math.pow(a.height / 100, 2)).toFixed(1);

  // 休養
  const resting = es.resting;
  const curRest = DB.getRestPeriods().find(r => Engine.isInRest(getTodayStr(), [r]));

  const roadmap = STAGES.map(s => {
    const unlocked = li.level >= s.min, current = s === st;
    return `<div class="stage-row${current ? ' stage-current' : ''}${unlocked ? '' : ' stage-locked'}">
      <span class="stage-dot" style="background:${unlocked ? s.outfit : 'var(--border)'}"></span>
      <span class="stage-name">${s.title}</span>
      <span class="stage-lv">${unlocked ? (current ? '目前階段' : '已達成 ✓') : `Lv.${s.min} 解鎖`}</span>
    </div>`;
  }).join('');

  document.getElementById('content').innerHTML = `
    <div class="card" style="text-align:center;padding:20px 16px 14px">
      <div class="av-svg-wrap" id="av-screen-svg" aria-hidden="true">${heroAvatarSvg(a, li.level, es)}</div>
      <div class="avatar-name-row">
        <span class="avatar-name">${escHtml(a.name)}</span>
        <span class="avatar-lv-chip">Lv.${li.level}</span>
      </div>
      <div class="avatar-stage-title" style="color:${st.outfit}">${st.title}${resting ? '　<span class="rest-mode-chip">🛌 休養中</span>' : ''}</div>
      <div class="xp-bar-bg" style="margin:14px 12px 6px"><div class="xp-bar-fg" style="width:${pct}%"></div></div>
      <div class="avatar-xp-text">${li.cur} / ${li.need} XP　<span style="color:var(--text-secondary)">距 Lv.${li.level + 1} 還差 ${li.need - li.cur}</span></div>
      ${nx ? `<div class="avatar-next-hint">下一階段：<b>${nx.title}</b>（Lv.${nx.min}）</div>` : `<div class="avatar-next-hint">已達最高階段 👑</div>`}
    </div>

    <div class="card">
      <div class="prog-sec-title">部位力量</div>
      ${partScoreHtml}
      <div class="psr-hint">分數由訓練紀錄純函數推導，7 天未練起衰退</div>
    </div>

    <div class="card">
      <div class="prog-sec-title">耐力</div>
      <div class="endurance-row">
        <div class="endurance-stat">
          <div class="body-stat-num" style="color:${endSc}">${endScore}</div>
          <div class="body-stat-label">耐力分數</div>
        </div>
        <div class="endurance-stat">
          <div class="body-stat-num">${endKm}</div>
          <div class="body-stat-label">30日等效 km</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="prog-sec-title">身體資料</div>
      <div class="body-stats" style="margin-bottom:14px">
        <div class="body-stat"><div class="body-stat-num">${a.height}</div><div class="body-stat-label">身高 cm</div></div>
        <div class="body-stat"><div class="body-stat-num">${es.bodyWeightKg}</div><div class="body-stat-label">體重 kg</div></div>
        <div class="body-stat"><div class="body-stat-num">${bmi}</div><div class="body-stat-label">BMI</div></div>
      </div>
      <div class="weight-update-row${weightWarn ? ' weight-update-warn' : ''}">
        <span class="wur-label">體重更新：${staleLabel}${weightWarn ? '　⚠' : ''}</span>
        <button class="wur-btn" onclick="_showWeightUpdate()">更新體重</button>
      </div>
      <div id="weight-input-panel" style="display:none;margin-top:10px">
        <div style="display:flex;gap:8px;align-items:center">
          <input type="number" id="new-weight-val" class="form-input" style="flex:1;margin:0" inputmode="decimal" step="0.1" placeholder="${es.bodyWeightKg}" aria-label="新體重（kg）">
          <button class="btn btn-primary btn-sm" onclick="_saveWeightUpdate()">儲存</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="prog-sec-title">休養模式</div>
      <div class="rest-toggle-row">
        <div class="rest-toggle-info">
          ${resting
            ? `<div class="rest-active-label">🛌 休養中${curRest ? `（${curRest.start} 起）` : ''}</div>`
            : `<div class="rest-inactive-label">正常訓練中</div>`}
        </div>
        ${resting
          ? `<button class="rest-toggle-btn rest-end-btn" onclick="_endRest()">結束休養</button>`
          : `<button class="rest-toggle-btn rest-start-btn" onclick="_startRest()">開始休養</button>`}
      </div>
      <div class="rest-mode-desc">休養期間的衰退計算與 XP 暫停，適合受傷或長假期間。</div>
    </div>

    <div class="card">
      <div class="prog-sec-title">累計成就</div>
      <div class="body-stats">
        <div class="body-stat"><div class="body-stat-num">${all.length}</div><div class="body-stat-label">訓練次數</div></div>
        <div class="body-stat"><div class="body-stat-num">${xp.toLocaleString()}</div><div class="body-stat-label">總 XP</div></div>
        <div class="body-stat"><div class="body-stat-num">${_fmtVol(all)}</div><div class="body-stat-label">總訓練量</div></div>
      </div>
    </div>

    <div class="card">
      <div class="prog-sec-title">成長階段</div>
      ${roadmap}
    </div>`;
  if (typeof ANIM !== 'undefined') ANIM.animScoreBars();
}

// ── Level-up Modal ─────────────────────────────────────────────────────────

function showLevelUp(level) {
  if (document.getElementById('levelup-modal')) return;
  lockScroll();
  const a = DB.getAvatar(), st = stageFor(level);
  const es = engineState();
  const newStage = STAGES.some(s => s.min === level);
  const el = document.createElement('div');
  el.id = 'levelup-modal'; el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="levelup-card">
      <div class="levelup-burst">🎉</div>
      <div style="width:150px;margin:0 auto">${heroAvatarSvg(a, level, es)}</div>
      <div class="levelup-title">升級！</div>
      <div class="levelup-lv">Lv.${level}</div>
      ${newStage ? `<div class="levelup-stage" style="color:${st.outfit}">🏅 晉升「${st.title}」！</div>` : ''}
      <button class="btn btn-primary" style="margin-top:16px" onclick="closeLevelUp()">太棒了！</button>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
  if (typeof ANIM !== 'undefined') {
    const card = el.querySelector('.levelup-card');
    card.style.animation = 'none';
    ANIM.levelUpEnter(card);
  }
}

function closeLevelUp() {
  const el = document.getElementById('levelup-modal');
  if (!el) return;
  unlockScroll();
  el.classList.remove('open');
  setTimeout(() => el.remove(), 250);
}

// ── PWA ────────────────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});

// ── Boot ────────────────────────────────────────────────────────────────────

window.currentExercises = []; window._editId = null; window._prefilled = false; window._workoutEndStr = '';
_render('home', {});
