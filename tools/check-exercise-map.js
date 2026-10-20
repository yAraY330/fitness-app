// 動作庫檢查：node tools/check-exercise-map.js
// 1) 舊預設動作不得改名、刪除或換部位（舊紀錄存的是名稱字串）  2) 每個預設動作都有對照，l 查得到 dataset
// 3) f 存在於 free-exercise-db（下載 dist/exercises.json 比對；離線時跳過並提示）  4) 同部位無重複  5) 每個預設動作有器材 e
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL ' + msg); } };

// 2026-10-20 擴充前的 122 個預設動作快照
const LEGACY = {"chest":["啞鈴臥推","槓鈴臥推","上斜啞鈴臥推","上斜槓鈴臥推","下斜啞鈴臥推","下斜槓鈴臥推","啞鈴飛鳥","上斜啞鈴飛鳥","下斜啞鈴飛鳥","蝴蝶機夾胸","繩索夾胸","上斜繩索飛鳥","下斜繩索飛鳥","伏地挺身","寬距伏地挺身","鑽石伏地挺身","雙槓撐體（胸）","史密斯機臥推","胸推機"],"back":["引體向上","反握引體向上","寬握引體向上","中立握引體向上","槓鈴划船","啞鈴划船","T槓划船","俯身划船","坐姿繩索划船","繩索直臂下拉","啞鈴直臂划船","滑輪下拉","反握滑輪下拉","中立握下拉","硬舉","臉拉","背伸展","史密斯機划船","彈力帶划船"],"legs":["深蹲","前蹲","相撲深蹲","哈克深蹲","箱上深蹲","史密斯機深蹲","保加利亞分腿蹲","弓箭步","行走弓箭步","側弓箭步","腿推機","腿彎舉（臥式）","腿彎舉（坐式）","腿伸展","臀推","臀腿機","繩索臀踢","蚌式開合","羅馬尼亞硬舉","直腿硬舉","小腿提踵（站姿）","小腿提踵（坐姿）"],"shoulders":["啞鈴肩推","槓鈴肩推","Arnold推舉","史密斯機肩推","坐姿肩推機","側平舉","繩索側平舉","機械側平舉","前平舉","繩索前平舉","後三角啞鈴飛鳥","繩索後三角飛鳥","反向蝴蝶機","直立划船","臉拉","啞鈴聳肩","槓鈴聳肩"],"biceps":["啞鈴彎舉","槓鈴彎舉","EZ槓彎舉","錘式彎舉","斜板錘式彎舉","集中彎舉","斜板彎舉（牧師凳）","托臂彎舉","繩索彎舉","繩索錘式彎舉","反握彎舉","對握引體向上","機械彎舉"],"triceps":["繩索三頭下壓","直桿三頭下壓","反握三頭下壓","法式彎舉（EZ槓）","法式彎舉（啞鈴）","窄握臥推","史密斯機窄握臥推","雙槓撐體（三頭）","板凳撐體","啞鈴三頭伸展（單手）","啞鈴三頭伸展（雙手）","過頭繩索伸展","三頭踢回（Kickback）","機械三頭下壓"],"core":["仰臥起坐","捲腹","反向捲腹","自行車捲腹","平板支撐","側平板","動態平板","俄羅斯轉體","懸吊舉腿","懸吊屈膝舉腿","仰臥舉腿","剪刀腳","死蟲","健腹輪","山式爬行","V字起身","超人式","臀橋"]};

// 刻意的部位搬移（使用者決定）：舊紀錄仍記在原部位，名稱不變所以歷史／PR 照常對得上
const MOVED = { '臀橋': { from: 'core', to: 'legs', date: '2026-10-20' } };
const EQUIP = ['槓鈴', '啞鈴', '繩索', '機械', '徒手', '其他'];

const ctx = { window: {} };
vm.createContext(ctx);
const appSrc = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const m = appSrc.match(/const PRESET_GROUPS = (\{[\s\S]*?\n\});/);
const GROUPS = vm.runInContext('(' + m[1] + ')', ctx);
const PRESET = Object.fromEntries(Object.entries(GROUPS).map(([p, gs]) => [p, gs.flatMap(g => g[1])]));
vm.runInContext(fs.readFileSync(path.join(root, 'js/exercise-map.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/exercise-index.js'), 'utf8'), ctx);
const MAP = ctx.window.EXERCISE_MAP, IDS = new Set(ctx.window.EXERCISE_INDEX.map(e => e.id));

for (const p in LEGACY) for (const n of LEGACY[p]) {
  const to = MOVED[n] && MOVED[n].from === p ? MOVED[n].to : p;
  ok((PRESET[to] || []).includes(n), `舊動作「${n}」仍在 ${to}`);
}
const noMap = [];  // 擴充前就沒有對照的舊動作（兩個資料集都找不到），只提示不算失敗
const noMedia = [];
for (const p in PRESET) {
  ok(new Set(PRESET[p]).size === PRESET[p].length, `${p} 沒有重複名稱`);
  for (const n of PRESET[p]) {
    const e = MAP[n];
    if (!e && LEGACY[p] && LEGACY[p].includes(n)) { noMap.push(n); continue; }
    ok(!!e, `「${n}」有對照表`);
    if (e && e.l) ok(IDS.has(e.l), `「${n}」的 l=${e.l} 存在於 dataset`);
    ok(!!e && EQUIP.includes(e.e), `「${n}」有器材分類（e=${e && e.e}）`);
    if (e && !e.l && !e.f) noMedia.push(n);
  }
}

const done = () => {
  const total = Object.values(PRESET).reduce((s, a) => s + a.length, 0);
  if (noMap.length || noMedia.length) console.log('沒有任何示意圖：' + [...noMap, ...noMedia].join('、'));
  console.log(`預設動作 ${total} 個；${pass} 項通過，${fail} 項失敗`);
  process.exit(fail ? 1 : 0);
};
fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json')
  .then(r => r.json())
  .then(list => {
    const fids = new Set(list.filter(x => (x.images || []).length).map(x => x.id));  // 只認有圖片的條目
    for (const [n, e] of Object.entries(MAP)) if (e.f) ok(fids.has(e.f), `「${n}」的 f=${e.f} 存在於 free-exercise-db 且有圖片`);
    const noF = Object.values(PRESET).flat().filter(n => MAP[n] && !MAP[n].f);
    if (noF.length) console.log('沒有線上示意圖：' + noF.join('、'));
  })
  .catch(() => console.log('（離線：略過 free-exercise-db 比對）'))
  .finally(done);
