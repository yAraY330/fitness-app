# CLAUDE.md — fitness-app

健身紀錄 PWA（vanilla JS、無 build step、localStorage）。視覺規格以根目錄 `DESIGN.md`（復古 RPG 狀態視窗風）為準；`REDESIGN_PROMPT.md` 為上一版（黑金屬熱血風）的歷史規格，僅供參考。

## 技能使用證據制（強制）

改版期間每個階段必須遵守：

1. **階段開始前**，先列出「本階段會用到哪些技能（Impeccable / UI UX PRO MAX / GSAP / Lenis 等）、會產出什麼使用證據」。
2. **階段結束的回報必須附上證據**，例如：
   - UI UX PRO MAX：查詢指令與結果、採用的配色/字體編號、不採用的理由
   - Impeccable：audit 清單與逐項處理結果
   - GSAP / Lenis：依官方技能的哪條準則寫了哪段動畫程式碼
3. **沒有證據就視為該階段未完成，不得進入下一階段。**

技能位置：`.claude/skills/`（impeccable、ui-ux-pro-max、gsap-*、scroll-experience）。

## 驗證

- 改動後：`node --check js/*.js`、`node tools/engine-test.js`（30 項全過）、`node tools/sprite-test.js`
- 視覺驗證：`python -m http.server 8123` + headless Chrome 截圖 `dev-seed.html`（注入測試資料後轉首頁）
- 部署前檢查 sw.js 快取版本號已升級
- 同步合併規則：`node tools/sync-test.js`

## 部署

- 正式網址：Firebase Hosting（`firebase deploy --only hosting,firestore:rules`，設定在 `firebase.json`／`.firebaserc`／`firestore.rules`）。部署＝公開發布，執行前必須問使用者
- GitHub Pages（yaray330.github.io/fitness-app）為搬家前的舊網址，git push 後仍會自動更新

## 約定

- 資料原則：XP 與部位分數一律由全部紀錄純函數重算，不存累計值
- `exercises-dataset/` 不進 git（媒體 © Gym visual）；精簡索引 `js/exercise-index.js` 由 `tools/build-exercise-index.py` 生成
- 中文動作對照表 `js/exercise-map.js`：新增預設動作時需同步補對照
- dev-*.html 為開發工具頁，不加入 sw.js 快取清單
- `design/`：設計探索區，不進 sw.js 快取、App 不引用。`design/directions/*.design.md` 為候選設計方向（DESIGN.md 格式，用 `@google/design.md lint` 驗證。**Windows 上 `npx @google/design.md` 會卡住**：執行檔名就叫 `design.md`，被當成 Markdown 檔開啟。改為 `npm install @google/design.md` 到暫存目錄，再 `node <暫存>/node_modules/@google/design.md/dist/index.js lint <檔案>`）；`design/mockups/*.html` 為示意圖；`design/characters/` 為角色設計（概念簡報 `*.md`、剪影比較頁）。方向定案後，定稿版寫到專案根目錄 `DESIGN.md`，作為改版唯一依據
- `assets/`：自架靜態資源（`fonts/` Cubic 11 字型 + OFL 授權、`icons/` Tabler Icons SVG，MIT、`vendor/` GSAP、Lenis、Firebase（`vendor/firebase/`，只在登入後載入）原檔（授權見 `vendor/LICENSES.txt`）、`character/hero.webp` 舊水墨立繪，已不使用）。不用 CDN 字型/圖示/JS 函式庫，確保離線與弱網路下可用（升級函式庫＝下載新版原檔覆蓋並升 sw 版本）；新增檔案需同步加進 sw.js ASSETS
- `DB._load()` 有記憶體快取：回傳的物件是共用的，**修改前必須先複製**，寫入一律走 `DB._save()`（不要直接 `localStorage.setItem(DB.KEY, …)`，會讓快取過期）
- 角色：`js/sprite.js`（選圖＋部位分數變形，純函數＋結果快取）＋ `js/sprite-data.js`（10 張基底，**勿手改**）。改角色圖或部位範圍 → 改 `design/characters/pixel/build_base.py`（IMAGES 手量的頭髮頂／腳底、BANDS 手量的部位列）後執行 `python design/characters/pixel/build_base.py`（來源圖在 `art/`，不進 git）；預覽 `design/characters/pixel/sprite-lab.html`。**不得垂直拉長角色**（使用者明確禁止）
- 雲端同步（`js/sync.js`）：Google 登入（一律 `signInWithRedirect`）＋ Firestore `users/{uid}/workouts/{id}`、`users/{uid}/meta/profile`。**localStorage 仍是唯一讀取來源**，雲端只是副本；沒登入時不載入 Firebase SDK（`assets/vendor/firebase/` compat 版，延遲載入）。DB 寫入方法負責蓋 `updatedAt`（workout）／`profileUpdatedAt`、刪除記墓碑 `deleted[id]`，並通知 `Sync`——**新增任何會改資料的 DB 方法都要照做**，否則該改動不會同步。合併規則（新者勝、墓碑、體重依日期聯集）是 `js/sync.js` 的純函數
- UI 不使用 emoji（DESIGN.md 規定），圖示用 `assets/icons/` 搭配 `.ic` CSS mask
