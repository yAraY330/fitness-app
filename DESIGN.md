---
version: alpha
name: 狀態視窗 RPG Status
description: 經典日式 RPG 的視窗系統。黑底白框對話窗、像素字、指令選單取代按鈕；角色是會隨等級長大、隨訓練變壯的像素主角。
colors:
  primary: "#ffd34d"
  on-primary: "#000000"
  surface: "#0a0d24"
  window: "#000000"
  on-window: "#ffffff"
  hp: "#4ade80"
  danger: "#ff6b6b"
  text-muted: "#aab0d0"
typography:
  display:
    fontFamily: Cubic 11
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.1
  headline-md:
    fontFamily: Cubic 11
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.3
  body-md:
    fontFamily: Cubic 11
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  title-md:
    fontFamily: Cubic 11
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.4
  label-md:
    fontFamily: Cubic 11
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  label-sm:
    fontFamily: Cubic 11
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  window: 6px
  none: 0px
spacing:
  unit: 4px
  window-pad: 14px
  window-gap: 10px
  border: 3px
components:
  window:
    backgroundColor: "{colors.window}"
    textColor: "{colors.on-window}"
    typography: "{typography.body-md}"
    rounded: "{rounded.window}"
    padding: 14px
  command-selected:
    backgroundColor: "{colors.window}"
    textColor: "{colors.primary}"
    typography: "{typography.headline-md}"
  stat-bar:
    backgroundColor: "{colors.window}"
    textColor: "{colors.hp}"
    rounded: "{rounded.none}"
    height: 10px
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.none}"
  stat-bar-decaying:
    backgroundColor: "{colors.window}"
    textColor: "{colors.danger}"
    rounded: "{rounded.none}"
    height: 10px
  caption:
    backgroundColor: "{colors.window}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
---

# 狀態視窗 RPG Status

> 定稿：2026-10-04 使用者選定（方向 C ＋ 角色方案 ④）。候選稿見 `design/directions/`，示意圖見 `design/mockups/home-rpg.html`。尚未套用到 App：等角色構圖（Plan A）完成後一起更新。

## Overview

App 是一款你自己當主角的日式 RPG。首頁就是戰鬥前的畫面：角色站在場地中央，下方是對話窗與指令選單。7 個部位是 7 項能力值，訓練就是練功。語氣用遊戲旁白（「阿力的腿部變弱了…」），把提醒包裝成劇情。

## Colors

- **游標金 Primary (#ffd34d)：** 只給「目前選中」：▶ 游標、選中的指令、選中的導覽。
- **夜空藍 Surface (#0a0d24)：** 場景底色。
- **視窗黑 (#000000) + 白框：** 所有資訊都放在 3px 白框黑底視窗裡，致敬 8/16-bit 時代的對話窗。
- **HP 綠 / 危險紅：** 只用在能力值條：正常綠、衰退紅。

## Typography

全站單一字體：**Cubic 11（俐方體11號）**，GitHub 開源的繁中像素字（OFL 授權），不加粗，只靠字級分階層。字級固定六級，不得使用其他尺寸：

| 階層 | 尺寸 | 用途 |
|---|---|---|
| display | 40px | 大數字：計時器、升級 Lv、戰績統計 |
| headline-md | 22px | 角色名字、畫面主標 |
| title-md | 18px | 指令選單、卡片標題、次要數字 |
| body-md | 16px | 內文、對話窗、輸入框 |
| label-md | 13px | 說明文字、列表次要資訊 |
| label-sm | 11px | 圖表座標、日曆星期、徽章 |

（2026-10-04 修訂：原為 22/16/13 三級，實作後補上 display、title-md、label-sm；12、14 併入 13。）

## Layout

畫面分三層：上方狀態窗（名字/Lv/EXP）、中間場景（角色）、下方對話窗＋指令選單。視窗之間固定 10px 間距。所有尺寸是 4px 的倍數，對齊像素格。

## Elevation & Depth

沒有陰影與模糊。層次只靠「視窗疊在場景上」這一層。

## Shapes

視窗 6px 圓角（模仿 SNES 對話窗）；能力值條與選中塊為直角。

## Components

- **指令選單：** 取代主按鈕。「▶ 開始訓練」為預設選中項，游標左右輕微跳動。
- **對話窗：** 打字機效果逐字出現，結尾有 ▼ 閃爍。
- **角色（2026-10-05 定稿）：** 原創像素主角「見習拳士」（呆毛、繃帶手、深藍短褲、麻繩腰帶），10 張 Dreamina 生成的 16-bit JRPG 立繪轉成真像素（`js/sprite-data.js`，產生流程見 `design/characters/pixel/`）。外觀由三層決定：
  - **等級 → 年紀**：6 個稱號各一組圖（Lv1 幼兒、Lv5 幼年、Lv10 少年、Lv15 青少年、Lv20 青年、Lv30 壯年），身高 150→330px 逐級變高。經驗值只增不減，角色只會長大。
  - **體重＋近 4 週重訓量 → 體型**：同一稱號有精實／壯碩兩張（Lv1、Lv5 共用），壯碩指數＝BMI 與每週重訓量（公斤÷體重）各半，過半為壯碩。
  - **部位分數 → 肌肉**：50 分＝原圖；各部位依分數逐列撐寬／收窄、陰影線加深／變淡（只做水平變化）。
  - **比例只來自原圖**：只做等比例縮放，絕不垂直拉長或壓縮來湊頭身。原尺寸顯示（1 格＝1px、`image-rendering: pixelated`），場景高度跟著角色長；只有升級畫面等比例縮小。
  - 鏡子疊加層：衰退部位紅圈（快衰退金虛圈）、休養中灰階色票、訓練後部位閃金圈；圈的位置由精靈依部位像素算出。
- **導覽列：** 黑底白框，圖示用 Tabler Icons；選中項金底黑字。

## Do's and Don'ts

- Do 讓所有文字與資訊都住在視窗裡。
- Do 用劇情旁白取代系統提示文字。
- Don't 混入圓潤現代 UI 元件（膠囊按鈕、漸層、柔陰影）。
- Don't 使用第二種字體。
- Don't 使用 emoji。
- Don't 垂直拉長或壓縮角色來改頭身比；比例只能來自生圖本身。
- Don't 用 CSS filter 或非等比縮放改角色；狀態變化（休養灰階等）在精靈色票層處理。
