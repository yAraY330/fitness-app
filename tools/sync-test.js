// 雲端同步測試：node tools/sync-test.js
// 1) 合併規則純函數  2) 兩～三台「裝置」對同一個假 Firestore 跑 Sync.run()，模擬新增／編輯／刪除／衝突／時鐘不準
const Sync = require('../js/sync.js');
const { mergeWorkouts, mergeProfile } = Sync._test;
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

// ── 1. 純函數 ──────────────────────────────────────────────────────────
{
  const m = mergeWorkouts([{ id: 'a', updatedAt: 5, v: 1 }], {}, [{ id: 'a', updatedAt: 9, v: 2 }, { id: 'b', updatedAt: 1, v: 3 }]);
  ok(m.workouts.find(w => w.id === 'a').v === 2, '遠端較新 → 覆蓋本機');
  ok(m.workouts.some(w => w.id === 'b'), '本機沒有 → 新增');
  const m2 = mergeWorkouts([{ id: 'a', updatedAt: 9, v: 1 }], {}, [{ id: 'a', updatedAt: 5, v: 2 }]);
  ok(m2.workouts[0].v === 1 && !m2.changed, '本機較新 → 保留本機');
  const m3 = mergeWorkouts([{ id: 'a', updatedAt: 5 }], {}, [{ id: 'a', updatedAt: 9, deleted: true }]);
  ok(!m3.workouts.length && m3.deleted.a === 9, '遠端墓碑較新 → 刪除並記墓碑');
  const m4 = mergeWorkouts([], { a: 9 }, [{ id: 'a', updatedAt: 5, v: 1 }]);
  ok(!m4.workouts.length, '本機已刪（較新）→ 舊的遠端資料不會復活');
  const m5 = mergeWorkouts([{ id: 'a' }], {}, [{ id: 'a', updatedAt: 0, v: 2 }]);
  ok(m5.workouts[0].v === undefined, '舊資料沒有 updatedAt、時間相同 → 保留本機');
  ok(!('syncedAt' in mergeWorkouts([], {}, [{ id: 'x', updatedAt: 1, syncedAt: {} }]).workouts[0]), '套用時去掉 syncedAt');

  const p = mergeProfile(
    { avatar: { name: 'L' }, profileUpdatedAt: 10, bodyWeights: [{ date: '2026-01-01', weight: 60 }, { date: '2026-02-01', weight: 61 }], custom: { chest: ['x'] }, restPeriods: [1] },
    { avatar: { name: 'R' }, updatedAt: 20, bodyWeights: [{ date: '2026-02-01', weight: 62 }, { date: '2026-03-01', weight: 63 }], custom: { chest: ['y'] }, restPeriods: [2] });
  ok(p.avatar.name === 'R' && p.restPeriods[0] === 2, 'profile：較新的角色／休養期間勝出');
  ok(p.bodyWeights.length === 3 && p.bodyWeights[1].weight === 62, '體重依日期聯集，同一天取較新那份');
  ok(p.custom.chest.length === 2, '自訂動作聯集');
  ok(p.updatedAt === 20, 'profile 時間取較大');
  ok(mergeProfile({ profileUpdatedAt: 50 }, { avatar: { name: 'R' }, updatedAt: 1 }).avatar.name === 'R', '本機沒有角色 → 用雲端的（新裝置還原）');
}

// ── 2. 假 Firestore ────────────────────────────────────────────────────
const SENT = { __server: true };
let serverClock = 1000;
const store = new Map();
const tsObj = ms => ({ toMillis: () => ms });
const resolve = v => { const o = {}; for (const k in v) o[k] = v[k] === SENT ? tsObj(++serverClock) : v[k]; return o; };
const docRef = path => ({ path, get: async () => ({ exists: store.has(path), data: () => store.get(path) }), set: async v => store.set(path, resolve(v)) });
const inCol = (path, k) => k.startsWith(path + '/') && !k.slice(path.length + 1).includes('/');
const collRef = path => ({
  doc: id => Object.assign(docRef(path + '/' + id), { collection: c => collRef(path + '/' + id + '/' + c) }),
  get: async () => ({ docs: [...store.keys()].filter(k => inCol(path, k)).map(k => ({ id: k.split('/').pop(), data: () => store.get(k) })) }),
  where: (f, op, t) => ({ get: async () => ({ docs: [...store.keys()].filter(k => inCol(path, k) && store.get(k)[f] && store.get(k)[f].toMillis() > t.toMillis())
    .map(k => ({ id: k.split('/').pop(), data: () => store.get(k) })) }) }),
});
let writes = 0;
const fakeDb = {
  collection: c => collRef(c),
  batch: () => { const ops = []; return { set: (r, v) => ops.push([r, v]), commit: async () => { for (const [r, v] of ops) { await r.set(v); writes++; } } }; },
};
Sync._test.setFirebase({ db: fakeDb, FieldValue: { serverTimestamp: () => SENT }, Timestamp: { fromMillis: tsObj } });
Sync.schedule = () => {};                                   // 測試裡手動呼叫 run()
global.showToast = () => {};

// ── 裝置：各自的 localStorage＋與 js/app.js 相同語意的 DB 寫入方法 ─────────
let clock = 100;
Date.now = () => clock;
function device(name) {
  const ls = new Map();
  const localStorage = { getItem: k => ls.has(k) ? ls.get(k) : null, setItem: (k, v) => ls.set(k, String(v)), removeItem: k => ls.delete(k) };
  const DB = {
    KEY: 'fitnessApp_v1', _cache: null,
    _load() { if (this._cache) return this._cache; const d = JSON.parse(localStorage.getItem(this.KEY)) || {}; d.workouts = d.workouts || []; d.custom = d.custom || {}; return (this._cache = d); },
    _save(d) { localStorage.setItem(this.KEY, JSON.stringify(d)); this._cache = d; return true; },
    _sync(id) { id ? Sync.touch(id) : Sync.touchProfile(); },
    addWorkout(w) { const d = this._load(); d.workouts.push({ ...w, updatedAt: Date.now() }); this._save(d); this._sync(w.id); },
    updateWorkout(id, p) { const d = this._load(); const i = d.workouts.findIndex(w => w.id === id); d.workouts[i] = { ...d.workouts[i], ...p, updatedAt: Date.now() }; this._save(d); this._sync(id); },
    deleteWorkout(id) { const d = this._load(); d.workouts = d.workouts.filter(w => w.id !== id); d.deleted = { ...(d.deleted || {}), [id]: Date.now() }; this._save(d); this._sync(id); },
    saveAvatar(a) { const d = this._load(); d.avatar = { ...(d.avatar || {}), ...a }; d.profileUpdatedAt = Date.now(); this._save(d); this._sync(); },
    addBodyWeight(date, weight) { const d = this._load(); d.bodyWeights = (d.bodyWeights || []).filter(e => e.date !== date).concat({ date, weight }).sort((a, b) => a.date.localeCompare(b.date)); d.profileUpdatedAt = Date.now(); this._save(d); this._sync(); },
  };
  return { name, localStorage, DB };
}
function use(dev) { global.localStorage = dev.localStorage; global.DB = dev.DB; Sync._test.reset(); return dev.DB; }
// 模擬 Sync.init 裡「這台裝置第一次登入」：本機全部標成待推
function login(dev) {
  const db = use(dev), d = db._load(), dirty = {};
  d.workouts.forEach(w => dirty[w.id] = 1); Object.keys(d.deleted || {}).forEach(id => dirty[id] = 1);
  dev.localStorage.setItem('fitnessSync', JSON.stringify({ uid: 'u1', email: 'me@x', lastPull: 0, dirty, profileDirty: true, lastSyncAt: 0 }));
  Sync._test.reset();
}
async function run(dev) { use(dev); await Sync.run(); return dev.DB._load(); }
const ids = d => d.workouts.map(w => w.id).sort().join(',');

(async () => {
  const A = device('A'), B = device('B'), C = device('C');
  // A：登入前就有資料
  let db = use(A);
  db.saveAvatar({ name: '阿A', height: 175, weight: 60 }); clock++;
  db.addWorkout({ id: 'w1', date: '2026-10-01', type: 'weight', exercises: [{ name: '臥推', sets: [{ weight: 60, reps: 8 }] }] }); clock++;
  db.addWorkout({ id: 'w2', date: '2026-10-02', type: 'cardio' }); clock++;
  db.addBodyWeight('2026-10-01', 60); clock++;
  login(A); await run(A);
  ok([...store.keys()].filter(k => k.includes('/workouts/')).length === 2, 'A 第一次登入：2 筆推上雲端');
  ok(store.get('users/u1/meta/profile').avatar.name === '阿A', 'A：角色推上雲端');
  ok(!Object.keys(JSON.parse(A.localStorage.getItem('fitnessSync')).dirty).length, 'A：推完清空待推');

  // B：新裝置，沒有角色 → 登入就還原
  login(B); let b = await run(B);
  ok(ids(b) === 'w1,w2' && b.avatar && b.avatar.name === '阿A' && b.bodyWeights.length === 1, 'B 新裝置登入：紀錄＋角色＋體重全部還原');

  // B：新增、編輯、刪除
  clock += 10; db = use(B);
  db.addWorkout({ id: 'w3', date: '2026-10-03', type: 'weight', exercises: [] }); clock++;
  db.updateWorkout('w1', { note: 'B 改的' }); clock++;
  db.deleteWorkout('w2'); clock++;
  await run(B);
  let a = await run(A);
  ok(ids(a) === 'w1,w3', 'A 收到 B 的新增與刪除');
  ok(a.workouts.find(w => w.id === 'w1').note === 'B 改的', 'A 收到 B 的編輯');
  ok(a.deleted && a.deleted.w2, 'A 記下墓碑（之後不會被舊資料復活）');

  // 衝突：兩台離線各自改 w3，B 較晚 → 兩邊最後都是 B 的版本
  clock += 10; use(A).updateWorkout('w3', { note: 'A 版' });
  clock += 5;  use(B).updateWorkout('w3', { note: 'B 版' });
  await run(A); await run(B); a = await run(A); b = await run(B);
  ok(a.workouts.find(w => w.id === 'w3').note === 'B 版' && b.workouts.find(w => w.id === 'w3').note === 'B 版', '衝突：較晚修改的勝出，兩邊一致');

  // 時鐘不準：B 的時間落後很多，新增的紀錄仍要同步到 A（拉資料用伺服器時間游標）
  const saved = clock; clock = 5; use(B).addWorkout({ id: 'w4', date: '2026-10-04', type: 'cardio' }); clock = saved;
  await run(B); a = await run(A);
  ok(a.workouts.some(w => w.id === 'w4'), '裝置時鐘落後：新紀錄仍同步過去');

  // C：登入前自己也有資料和較舊的角色 → 聯集，C 的獨有紀錄推上雲端、角色以較新的為準
  db = use(C); clock = 50;                                    // C 的角色比雲端舊
  db.saveAvatar({ name: '舊C' }); db.addWorkout({ id: 'w9', date: '2026-09-09', type: 'cardio' }); db.addBodyWeight('2026-09-09', 58);
  clock = saved + 100; login(C); let c = await run(C);
  ok(ids(c) === 'w1,w3,w4,w9', 'C 第一次登入：本機與雲端聯集，誰都沒少');
  ok(c.avatar.name === '阿A', 'C：較新的雲端角色勝出');
  ok(c.bodyWeights.length === 2, 'C：體重依日期聯集');
  a = await run(A);
  ok(a.workouts.some(w => w.id === 'w9') && a.bodyWeights.length === 2, 'A 收到 C 的獨有紀錄與體重');

  // 沒改東西時再同步：不應該重複寫入
  const w0 = writes; await run(A); await run(B);
  ok(writes === w0, '沒有變動 → 不重複寫入 workouts');

  // 第二次拉資料只拿游標之後的文件
  ok(JSON.parse(A.localStorage.getItem('fitnessSync')).lastPull > 1000, '游標記錄伺服器時間');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
