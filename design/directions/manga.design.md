---
version: alpha
name: 原稿紙 Manga Manuscript
description: 熱血格鬥漫畫原稿風。白紙黑墨加一支朱紅，分格取代卡片。
colors:
  primary: "#111111"
  on-primary: "#ffffff"
  accent: "#c8241b"
  on-accent: "#ffffff"
  surface: "#ffffff"
  on-surface: "#111111"
  ink-muted: "#4a4a4a"
  screentone: "#b8b8b8"
typography:
  headline-display:
    fontFamily: Noto Sans TC
    fontSize: 34px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Noto Sans TC
    fontSize: 22px
    fontWeight: 900
    lineHeight: 1.2
  number-xl:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: 400
    lineHeight: 0.9
  number-md:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1
  sfx:
    fontFamily: Dela Gothic One
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1
  body-md:
    fontFamily: Noto Sans TC
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
  label-md:
    fontFamily: Noto Sans TC
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.3
rounded:
  none: 0px
  bubble: 9999px
spacing:
  gutter: 10px
  panel-pad: 14px
  page-margin: 12px
  border: 3px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.none}"
    height: 64px
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.none}"
    padding: 14px
  stamp:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-md}"
    rounded: "{rounded.bubble}"
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.none}"
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label-md}"
  screentone-shadow:
    backgroundColor: "{colors.screentone}"
---

# 原稿紙 Manga Manuscript

## Overview

整個 App 是一份熱血格鬥漫畫的原稿：白紙、黑墨、網點，加上一支朱紅色的修正筆。角色是這部漫畫的主角，每次訓練是一回連載。使用者情境是健身房日光燈下、兩組之間單手瞄 3 秒——白底黑字在強光下最清楚，所以選亮色。幽默感來自漫畫語法（對白框吐槽、效果音字、集中線），不是來自配色或特效。

## Colors

- **墨黑 Primary (#111111)：** 所有框線、標題、主要按鈕。不是純黑，避免在 OLED 上發藍。
- **朱紅 Accent (#c8241b)：** 唯一的彩色。只用在三件事：今天完成的印章、PR 破紀錄、該練的弱點提示。整頁面積不超過 10%。
- **紙白 Surface (#ffffff)：** 純白、彩度 0。刻意不用米色/奶油色。
- **網點 Screentone (#b8b8b8)：** 只以點狀網點出現，用來做陰影與區塊層次，不當文字色。

## Typography

- **標題：** Noto Sans TC 900，模仿漫畫植字的粗黑體。
- **數字：** Anton，窄而重，像漫畫裡的戰鬥力數值。
- **效果音：** Dela Gothic One，只用在片假名效果音（ドン、ゴゴゴ），每屏最多一個。
- **直排：** 連續天數等短句可直排（`writing-mode: vertical-rl`），這是漫畫對白的原生排法。

## Layout

用「分格」取代卡片：頁面是一張原稿，各區塊是相鄰的漫畫格，格與格之間固定 10px 白色格線（gutter），外框 3px 墨線。主角格最大且可以斜切（clip-path），其他格保持直角矩形。格子大小不一，靠尺寸差製造節奏，不做等大卡片網格。

## Elevation & Depth

沒有陰影。層次只靠三種手段：墨線粗細（3px 外框 / 1.5px 內線）、網點濃淡、黑白反轉（重點格反白成黑底白字）。

## Shapes

所有容器直角（0px）。唯一的圓形是對白框與印章。

## Components

- **主按鈕：** 墨黑實心直角塊，白字，按下時位移 2px 模擬蓋章。不做漸層、不做發光。
- **對白框：** 白底黑框圓角泡泡，帶尾巴指向角色部位，用來吐槽弱點（「腿…是不是太細了？」）。
- **印章：** 朱紅圓形，週曆上標記已訓練日。
- **導覽列：** 白底、上緣 3px 墨線；選中項反白成墨黑方塊。圖示用 Tabler Icons outline，2px 筆畫。

## Do's and Don'ts

- Do 讓朱紅保持稀缺，它一出現就代表「重要」。
- Do 用漫畫語法表達狀態（對白、效果音、集中線），不用通用 UI 徽章。
- Don't 使用漸層、毛玻璃、柔和大陰影、大圓角卡片。
- Don't 在每個區塊上方放英文小標（eyebrow）。
- Don't 使用 emoji 當圖示。
- Don't 把網點當滿版裝飾；只用在主角格背景與陰影。
