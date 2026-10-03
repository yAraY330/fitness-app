---
version: alpha
name: 訓練日誌 Training Log
description: 克制的運動數據風。石墨黑底、單一訊號橘，首頁先回答「今天練什麼」。
colors:
  primary: "#ff5a1f"
  on-primary: "#111214"
  surface: "#111214"
  surface-raised: "#1a1c1f"
  on-surface: "#ececec"
  text-muted: "#a3a6ab"
  hairline: "#2c2f33"
  warn: "#ffb020"
typography:
  headline-lg:
    fontFamily: Noto Sans TC
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1.2
  number-xl:
    fontFamily: Archivo
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.02em
    fontFeature: '"tnum" 1'
  number-md:
    fontFamily: Archivo
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1
    fontFeature: '"tnum" 1'
  body-md:
    fontFamily: Noto Sans TC
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Noto Sans TC
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: 4px
  md: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 28px
  page-margin: 20px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline-lg}"
    rounded: "{rounded.md}"
    height: 60px
  row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    padding: 12px
  panel-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
  divider:
    backgroundColor: "{colors.hairline}"
    height: 1px
  decay-warning:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warn}"
    typography: "{typography.label-md}"
---

# 訓練日誌 Training Log

## Overview

像一本被認真記錄的訓練日誌，不像遊戲。首頁的第一行字直接回答使用者走進健身房時唯一的問題：「今天練什麼？」，答案由部位分數與衰退天數推出。角色退為配角，縮在左側當身體地圖，失衡仍看得出來，但主角是數據。語氣冷靜、精確，靠清楚而不是熱血來激勵。

## Colors

- **訊號橘 Primary (#ff5a1f)：** 唯一強調色，面積 ≤10%：主按鈕、今天建議的部位、選中的導覽。
- **石墨 Surface (#111214)：** 中性近黑、彩度 0。不用藍黑或紫黑。
- **抬升面 (#1a1c1f)：** 只用在一個需要聚焦的區塊，不層層疊卡片。
- **琥珀 Warn (#ffb020)：** 只表示「即將衰退」。
- 部位不各配一色。所有部位條同色，用長短表達差異。

## Typography

- **數字：** Archivo，開啟等寬數字（tnum），讓分數縱向對齊。
- **中文：** Noto Sans TC，800 給標題、400/500 給內文，兩個字重就夠。

## Layout

單欄、以分隔線（hairline）分段，不用卡片包每一塊。間距刻意不均：決策區（今天練什麼 + 開始按鈕）上下留大空白，資料區緊密。7 部位用一張排序後的對齊表格呈現，弱到強由上而下。

## Elevation & Depth

扁平。層次靠：一個抬升面、1px 分隔線、字重與尺寸對比。不用陰影。

## Shapes

小圓角：按鈕與抬升面 8px，進度條 4px。

## Components

- **主按鈕：** 實心訊號橘、深色字，寬滿版。無漸層、無外發光。
- **部位列：** 名稱｜長條｜分數｜上次訓練天數，四欄對齊。
- **週列：** 7 欄，每欄是當日訓練量的細長條，比圓點多帶一層資訊。
- **導覽列：** Tabler Icons outline 1.75px，選中項只變色加一條 2px 頂線。

## Do's and Don'ts

- Do 每屏只有一個橘色主動作。
- Do 讓數字對齊、讓排序說話。
- Don't 做「大數字＋小標籤」的 hero 指標橫條。
- Don't 給 7 個部位 7 種顏色。
- Don't 使用 emoji、漸層、毛玻璃。
