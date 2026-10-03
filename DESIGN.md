---
version: alpha
name: 狀態視窗 RPG Status
description: 經典日式 RPG 的視窗系統。黑底白框對話窗、像素字、指令選單取代按鈕；角色保持高清。
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
  label-md:
    fontFamily: Cubic 11
    fontSize: 13px
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

全站單一字體：**Cubic 11（俐方體11號）**，GitHub 開源的繁中像素字（OFL 授權），只用一種大小階層區分，不加粗。

## Layout

畫面分三層：上方狀態窗（名字/Lv/EXP）、中間場景（角色）、下方對話窗＋指令選單。視窗之間固定 10px 間距。所有尺寸是 4px 的倍數，對齊像素格。

## Elevation & Depth

沒有陰影與模糊。層次只靠「視窗疊在場景上」這一層。

## Shapes

視窗 6px 圓角（模仿 SNES 對話窗）；能力值條與選中塊為直角。

## Components

- **指令選單：** 取代主按鈕。「▶ 開始訓練」為預設選中項，游標左右輕微跳動。
- **對話窗：** 打字機效果逐字出現，結尾有 ▼ 閃爍。
- **角色（方案 ④）：** 角色**不像素化**，保持高清卡通畫風（粗黑描邊、平塗上色），站在像素介面的場景中央，類似 JRPG「像素介面＋高清立繪」的做法。過渡期用現有 SVG 角色；Plan A 完成後換成 Rive 可變形角色（見 `art/RESUME_character.md`）。角色美術必須是粗描邊扁平風，才能和像素介面搭得起來，不可用寫實、漸層光影或 3D 渲染風。
- **導覽列：** 黑底白框，圖示用 Tabler Icons；選中項金底黑字。

## Do's and Don'ts

- Do 讓所有文字與資訊都住在視窗裡。
- Do 用劇情旁白取代系統提示文字。
- Don't 混入圓潤現代 UI 元件（膠囊按鈕、漸層、柔陰影）。
- Don't 使用第二種字體。
- Don't 使用 emoji。
- Don't 把角色做成像素畫或寫實風；角色固定是高清粗描邊卡通。
