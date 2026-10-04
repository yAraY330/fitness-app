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

- 改動後：`node --check js/*.js`、`node tools/engine-test.js`（30 項全過）
- 視覺驗證：`python -m http.server 8123` + headless Chrome 截圖 `dev-seed.html`（注入測試資料後轉首頁）
- 部署前檢查 sw.js 快取版本號已升級

## 約定

- 資料原則：XP 與部位分數一律由全部紀錄純函數重算，不存累計值
- `exercises-dataset/` 不進 git（媒體 © Gym visual）；精簡索引 `js/exercise-index.js` 由 `tools/build-exercise-index.py` 生成
- 中文動作對照表 `js/exercise-map.js`：新增預設動作時需同步補對照
- dev-*.html 為開發工具頁，不加入 sw.js 快取清單
- `design/`：設計探索區，不進 sw.js 快取、App 不引用。`design/directions/*.design.md` 為候選設計方向（DESIGN.md 格式，`npx @google/design.md lint` 驗證）；`design/mockups/*.html` 為示意圖；`design/characters/` 為角色設計（概念簡報 `*.md`、剪影比較頁）。方向定案後，定稿版寫到專案根目錄 `DESIGN.md`，作為改版唯一依據
- `assets/`：自架靜態資源（`fonts/` Cubic 11 字型 + OFL 授權、`icons/` Tabler Icons SVG，MIT、`character/hero.png` 角色立繪＝`art/char2d_v1.png` 去背版）。不用 CDN 字型/圖示，確保離線可用；新增檔案需同步加進 sw.js ASSETS
- UI 不使用 emoji（DESIGN.md 規定），圖示用 `assets/icons/` 搭配 `.ic` CSS mask
