// 雲端同步：Google 登入＋Firestore（設計見 ~/.claude/plans/sleepy-fluttering-turtle.md、CLAUDE.md「雲端同步」）
//
// localStorage（DB）仍是唯一讀取來源，雲端只是副本：
//   users/{uid}/workouts/{id}  一筆訓練一份文件；刪除＝墓碑 {deleted:true, updatedAt}
//   users/{uid}/meta/profile   avatar／custom／bodyWeights／restPeriods
// 衝突一律「updatedAt 較新者勝」；體重依日期聯集、自訂動作聯集。
// 拉資料用伺服器時間 syncedAt 做游標（各裝置時鐘可能不準，用 updatedAt 當游標會漏資料）。
// 沒登入時不載入 Firebase SDK（assets/vendor/firebase/，約 720KB）。
(function (root) {
'use strict';

// Firebase 專案設定（公開資訊，非密鑰；安全性靠 firestore.rules）
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBV2VfJqj-7GxdkZ8lHHamNutO-gMnLiAY',
  authDomain: 'fitness-app-yaray.firebaseapp.com',
  projectId: 'fitness-app-yaray',
  storageBucket: 'fitness-app-yaray.firebasestorage.app',
  messagingSenderId: '547426605410',
  appId: '1:547426605410:web:96bb2d9bae2aef57f5f43b',
};

// ── 純函數：合併規則（tools/sync-test.js 測試）─────────────────────────────
const ts = v => (typeof v === 'number' && isFinite(v) ? v : 0);

// 遠端 workout 文件套進本機。回傳新的 { workouts, deleted } 與 changed
function mergeWorkouts(workouts, deleted, remote) {
  const ws = workouts.slice(), del = { ...(deleted || {}) };
  let changed = false;
  for (const r of remote) {
    if (!r || !r.id) continue;
    const i = ws.findIndex(w => w.id === r.id);
    const localTs = i >= 0 ? ts(ws[i].updatedAt) : (r.id in del ? ts(del[r.id]) : -1);
    if (ts(r.updatedAt) <= localTs) continue;           // 本機一樣新或更新 → 保留本機
    changed = true;
    if (r.deleted) {
      if (i >= 0) ws.splice(i, 1);
      del[r.id] = ts(r.updatedAt);
    } else {
      const { deleted: _d, syncedAt: _s, ...w } = r;
      if (i >= 0) ws[i] = w; else ws.push(w);
      delete del[r.id];
    }
  }
  return { workouts: ws, deleted: del, changed };
}

// profile 合併：體重依日期聯集（同一天取較新那份）、自訂動作聯集、角色與休養期間較新者勝
function mergeProfile(local, remote) {
  const lt = ts(local.profileUpdatedAt), rt = ts(remote && remote.updatedAt);
  if (!remote) return { ...pickProfile(local), updatedAt: lt };
  const newer = rt > lt ? remote : local, older = newer === remote ? local : remote;
  const bw = new Map();
  (older.bodyWeights || []).forEach(e => e && e.date && bw.set(e.date, e));
  (newer.bodyWeights || []).forEach(e => e && e.date && bw.set(e.date, e));
  const custom = {};
  [local.custom || {}, remote.custom || {}].forEach(c => Object.keys(c).forEach(p => {
    custom[p] = [...new Set([...(custom[p] || []), ...(c[p] || [])])];
  }));
  return {
    avatar: newer.avatar || older.avatar || null,
    custom,
    bodyWeights: [...bw.values()].sort((a, b) => a.date.localeCompare(b.date)),
    restPeriods: Array.isArray(newer.restPeriods) ? newer.restPeriods : (older.restPeriods || []),
    updatedAt: Math.max(lt, rt),
  };
}
function pickProfile(d) {
  return { avatar: d.avatar || null, custom: d.custom || {}, bodyWeights: d.bodyWeights || [], restPeriods: d.restPeriods || [] };
}
// 比較用：忽略時間欄位與屬性順序
const stable = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x)
  ? Object.keys(x).sort().reduce((o, key) => (o[key] = x[key], o), {}) : x);
const sameProfile = (a, b) => stable(pickProfile(a)) === stable(pickProfile(b || {}));

// Firestore 不接受 undefined 欄位：用 JSON 來回去掉
const clean = o => JSON.parse(JSON.stringify(o));

// ── 本機同步狀態（key: fitnessSync）─────────────────────────────────────────
const SKEY = 'fitnessSync';
const state = {
  _s: null,
  get() { if (this._s) return this._s; try { this._s = JSON.parse(localStorage.getItem(SKEY)) || null; } catch { this._s = null; } return this._s; },
  set(s) { this._s = s; try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch {} },
  patch(p) { const s = this.get(); if (s) this.set({ ...s, ...p }); },
};

// ── Firebase（瀏覽器才有）──────────────────────────────────────────────────
let fb = null, loading = null, timer = null, running = false, again = false, lastError = null;
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const inAppBrowser = () => isBrowser && /Line\/|FBAN|FBAV|Instagram|Discord|MicroMessenger/i.test(navigator.userAgent);

function loadScript(src) {
  return new Promise((ok, bad) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('load ' + src));
    document.head.appendChild(s);
  });
}
function loadFirebase() {
  if (fb) return Promise.resolve(fb);
  if (!FIREBASE_CONFIG) return Promise.reject(new Error('未設定 Firebase'));
  if (!loading) loading = (async () => {
    const base = 'assets/vendor/firebase/';
    await loadScript(base + 'firebase-app-compat.js');
    await Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-firestore-compat.js')]);
    const app = root.firebase.initializeApp(FIREBASE_CONFIG);
    fb = { app, auth: app.auth(), db: app.firestore(), FieldValue: root.firebase.firestore.FieldValue, Timestamp: root.firebase.firestore.Timestamp };
    return fb;
  })().catch(e => { loading = null; throw e; });
  return loading;
}

// DB、App 是 js/app.js 的頂層 const（不是 window 屬性），用全域識別字取用
const app = () => (typeof App !== 'undefined' ? App : null);
const ui = () => app() && app().syncChanged();
const toast = m => root.showToast && root.showToast(m);

const Sync = {
  // 只在 Firebase 網址（與本機開發）開放登入：GitHub Pages 舊網址上 redirect 登入會被瀏覽器擋
  enabled: () => !!FIREBASE_CONFIG && isBrowser && /(\.firebaseapp\.com|\.web\.app)$|^localhost$|^127\./.test(location.hostname),
  signedIn: () => !!(state.get() && state.get().uid),
  info: () => state.get(),
  error: () => lastError,

  // DB 寫入時呼叫：記下哪些資料要推上去（沒登入就不記，第一次登入時會全部標記）
  touch(id) { const s = state.get(); if (!s || !s.uid) return; state.patch({ dirty: { ...(s.dirty || {}), [id]: 1 } }); this.schedule(); },
  touchProfile() { const s = state.get(); if (!s || !s.uid) return; state.patch({ profileDirty: true }); this.schedule(); },
  // 匯入備份後：全部重推
  touchAll() {
    const s = state.get(); if (!s || !s.uid) return;
    const d = DB._load(), dirty = {};
    d.workouts.forEach(w => dirty[w.id] = 1); Object.keys(d.deleted || {}).forEach(id => dirty[id] = 1);
    state.patch({ dirty, profileDirty: true }); this.schedule();
  },
  schedule(ms = 2000) { if (!this.signedIn()) return; clearTimeout(timer); timer = setTimeout(() => this.run(), ms); },

  signIn() {
    if (inAppBrowser()) { toast('請用 Chrome 或 Safari 開啟（LINE／IG 內建瀏覽器無法 Google 登入）'); return; }
    try { sessionStorage.setItem('syncLoginPending', '1'); } catch {}
    loadFirebase().then(({ auth }) => {
      const p = new root.firebase.auth.GoogleAuthProvider();
      p.setCustomParameters({ prompt: 'select_account' });
      return auth.signInWithRedirect(p);
    }).catch(e => { try { sessionStorage.removeItem('syncLoginPending'); } catch {} toast('登入失敗：' + e.message); });
  },
  async signOut() {
    if (!confirm('登出後這台裝置的紀錄會保留，但不再同步。確定登出？')) return;
    clearTimeout(timer);
    try { const { auth } = await loadFirebase(); await auth.signOut(); } catch {}
    state.set(null); ui();
  },

  // 開 App 時：有登入過、或剛從 Google 登入頁回來，才載入 SDK
  async init() {
    if (!this.enabled()) return;
    let pending = false; try { pending = sessionStorage.getItem('syncLoginPending') === '1'; } catch {}
    if (!this.signedIn() && !pending) return;
    try {
      const { auth } = await loadFirebase();
      const res = await auth.getRedirectResult().catch(e => { toast('登入失敗：' + (e.code || e.message)); return null; });
      try { sessionStorage.removeItem('syncLoginPending'); } catch {}
      auth.onAuthStateChanged(user => {
        const s = state.get();
        if (!user) { if (s) { state.set(null); ui(); } return; }
        if (!s || s.uid !== user.uid) {
          // 這台裝置第一次登入此帳號：本機全部標成待推，和雲端做聯集
          state.set({ uid: user.uid, email: user.email, lastPull: 0, dirty: {}, profileDirty: true, lastSyncAt: 0 });
          const d = DB._load(), dirty = {};
          d.workouts.forEach(w => dirty[w.id] = 1); Object.keys(d.deleted || {}).forEach(id => dirty[id] = 1);
          state.patch({ dirty });
          if (res && res.user) toast('已登入，正在同步…');
        }
        ui(); this.run();
      });
      window.addEventListener('online', () => this.schedule(500));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.schedule(500); });
    } catch (e) { lastError = e.message; ui(); }
  },

  async run() {
    if (!this.signedIn()) return;
    if (running) { again = true; return; }
    if (isBrowser && navigator.onLine === false) return;
    running = true; again = false;
    try {
      const { db, FieldValue, Timestamp } = await loadFirebase();
      const s = state.get(), uid = s.uid;
      const col = db.collection('users').doc(uid).collection('workouts');
      const profRef = db.collection('users').doc(uid).collection('meta').doc('profile');

      // 拉：伺服器時間游標之後的變動
      const q = s.lastPull ? col.where('syncedAt', '>', Timestamp.fromMillis(s.lastPull)) : col;
      const [snap, profSnap] = await Promise.all([q.get(), profRef.get()]);
      let maxPull = s.lastPull || 0;
      const remote = snap.docs.map(doc => {
        const v = doc.data(), t = v.syncedAt && v.syncedAt.toMillis ? v.syncedAt.toMillis() : 0;
        if (t > maxPull) maxPull = t;
        return { ...v, id: doc.id };
      });
      const remoteProfile = profSnap.exists ? profSnap.data() : null;

      // 合併進本機（複製後再改，遵守 DB 快取約定）
      const cur = DB._load();
      const m = mergeWorkouts(cur.workouts, cur.deleted, remote);
      const prof = mergeProfile(cur, remoteProfile);
      const profChangedLocal = !sameProfile(cur, prof);
      if (m.changed || profChangedLocal) {
        const next = { ...cur, workouts: m.workouts, deleted: m.deleted, ...pickProfile(prof), profileUpdatedAt: prof.updatedAt };
        if (!prof.avatar) delete next.avatar;
        DB._save(next);
      }

      // 推：待推的訓練（含墓碑）＋ profile
      const now = DB._load(), dirty = Object.keys(state.get().dirty || {});
      const writes = [];
      dirty.forEach(id => {
        const w = now.workouts.find(x => x.id === id);
        if (w) writes.push([col.doc(id), { ...clean(w), updatedAt: ts(w.updatedAt), syncedAt: FieldValue.serverTimestamp() }]);
        else if (now.deleted && id in now.deleted) writes.push([col.doc(id), { deleted: true, updatedAt: ts(now.deleted[id]), syncedAt: FieldValue.serverTimestamp() }]);
      });
      const pushProfile = state.get().profileDirty || !remoteProfile || !sameProfile(prof, remoteProfile) || ts(remoteProfile.updatedAt) !== prof.updatedAt;
      for (let i = 0; i < writes.length; i += 400) {                  // batch 上限 500
        const b = db.batch(); writes.slice(i, i + 400).forEach(([ref, v]) => b.set(ref, v)); await b.commit();
      }
      if (pushProfile) await profRef.set(clean({ ...pickProfile(prof), updatedAt: prof.updatedAt }));

      // 推送期間又有新改動的不能清掉：只清這次推上去的
      const after = state.get().dirty || {}; dirty.forEach(id => delete after[id]);
      state.patch({ dirty: after, profileDirty: pushProfile ? false : state.get().profileDirty, lastPull: maxPull, lastSyncAt: Date.now() });
      lastError = null;
      if ((m.changed || profChangedLocal) && app()) app().refresh();
    } catch (e) {
      lastError = e.code || e.message;
      console.warn('[sync]', e);
    } finally {
      running = false; ui();
      if (again) this.schedule(300);
    }
  },
};

// 測試用：注入假的 Firestore、切換裝置時清掉狀態快取
Sync._test = { mergeWorkouts, mergeProfile, sameProfile, setFirebase: f => { fb = f; }, reset: () => { state._s = null; running = false; again = false; } };
if (typeof module !== 'undefined') module.exports = Sync; else root.Sync = Sync;
})(typeof window !== 'undefined' ? window : globalThis);
