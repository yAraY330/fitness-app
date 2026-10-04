---
version: alpha
name: 墨戰 Ki-Ink
description: 以《Street Fighter IV》選角畫面為參照的格鬥遊戲介面。刮痕黑牆、角色背後的暗紅圓相、毛筆標題、格鬥 HUD 能力條；角色是水墨立繪。
colors:
  primary: "#b3161b"
  on-primary: "#f1e9da"
  surface: "#14110f"
  wall: "#1c1815"
  on-surface: "#ece3d2"
  ink: "#0b0908"
  gauge: "#e8b531"
  on-gauge: "#14110f"
  danger: "#e23a2f"
  text-muted: "#9c907d"
typography:
  display:
    fontFamily: Yuji Boku
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.1
  headline-md:
    fontFamily: Yuji Boku
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.3
  title-md:
    fontFamily: Noto Serif TC
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.4
  body-md:
    fontFamily: Noto Serif TC
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Noto Serif TC
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  label-sm:
    fontFamily: Noto Serif TC
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.4
rounded:
  none: 0px
  enso: 9999px
spacing:
  unit: 4px
  gutter: 16px
  panel-gap: 12px
components:
  command-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.none}"
    padding: 8px
  command:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.headline-md}"
  panel:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 14px
  gauge-bar:
    backgroundColor: "{colors.gauge}"
    textColor: "{colors.on-gauge}"
    rounded: "{rounded.none}"
    height: 12px
  gauge-bar-decaying:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: 12px
  nav:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
---

# 墨戰 Ki-Ink

> 候選方向（2026-10-04 探索）：角色定稿為 SF4 水墨 ×《孤高之人》氣質後，測試「介面跟著角色走」的效果。示意圖：`design/mockups/home-sf4.html`。

## Overview

App 像一款格鬥遊戲的選角與對戰前畫面：你的角色站在刮痕斑駁的黑牆前，身後是一圈暗紅的圓相（ensō）。介面元素少而有力——毛筆字標題、格鬥 HUD 式的能力條、像招式選單一樣的指令。語氣延續旁白（「腿部能力下降了 5 點」），但用格鬥遊戲的節奏：短、狠、直接。

參考來源：SF4 選角畫面是「暗黑牆面＋白色刮漆、角色背後半透明暗紅圓相、ki-ink 水墨美學，紅色代表力量」（Street Fighter Wiki：Character Select）。

## Colors

- **血紅 Primary (#b3161b)：** 力量與「目前選中」：選中的指令底色、圓相、衰退警示的主色。
- **刮痕黑 Surface (#14110f) / 牆 (#1c1815)：** 不用純黑；暖黑帶一點棕，像舊牆與墨。
- **宣紙白 On-surface (#ece3d2)：** 所有內文，帶一點米色，與水墨立繪的紙色一致。
- **能量金 Gauge (#e8b531)：** 只給能力條／經驗條（格鬥遊戲的體力條語言）。
- **怒紅 Danger (#e23a2f)：** 能力條衰退段、退化提示。

## Typography

- **毛筆標題：Yuji Boku**（Google Fonts，OFL）。只用在大標、指令、數字等少量「招式名」。此字型是日文字型，缺「值、氧、跑」等字 → 標題用詞要避開這些字（例：「能力」不寫「能力值」）。只自架用到的字（Google Fonts `text=` 子集），不載整套 8.5 MB。
- **內文：Noto Serif TC**（Google Fonts，OFL）。明體的筆畫有刀刻感，比黑體更接近水墨世界觀。
- 只用 DESIGN.md 的六級字級。

## Layout

畫面分三段：上方「對戰 HUD」（名字、Lv、經驗條、耐力條，像格鬥遊戲的體力條橫在頂端）；中段角色舞台（立繪＋背後暗紅圓相＋刮痕牆）；下方旁白條與招式選單。邊緣不放圓角卡片，區塊靠粗墨線與斜切分隔。

## Elevation & Depth

沒有陰影、沒有模糊、沒有玻璃擬態。深度只來自三層：牆（最底）→ 圓相（中）→ 角色與 UI（最上）。

## Shapes

全部直角；唯一的圓是圓相（ensō）——用毛筆畫的不封口圓，不是 CSS 正圓。分隔與選中狀態用斜切（clip-path 平行四邊形），呼應格鬥遊戲的速度感。

## Components

- **招式選單：** 毛筆字指令一行一個；選中的那行是血紅斜切色塊＋宣紙白字。
- **對戰 HUD：** 頂部能力條為金色、衰退段為怒紅，條的末端斜切；數字用毛筆字。
- **圓相：** 角色背後半透明暗紅 ensō（SVG 筆刷路徑），衰退時顏色加深。
- **旁白條：** 底部橫條，左側紅色斜切標籤寫說話者，文字逐字出現。
- **導覽列：** 黑底，選中項下方一道毛筆紅線（不是填滿色塊）。

## Do's and Don'ts

- Do 讓毛筆字少而大，像招式名。
- Do 用真實的筆刷紋理（SVG 路徑、雜訊），讓線條有粗細與飛白。
- Don't 用玻璃擬態、漸層光暈、圓角卡片、膠囊按鈕——這些是通用 AI 介面的標誌。
- Don't 用 emoji、純黑 #000。
- Don't 讓整段內文用毛筆字（難讀，也缺字）。
