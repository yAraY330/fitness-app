# 角色設計：三個概念（2026-10-04）

> 前提（全部概念共用，來自 `DESIGN.md` 與 Plan A）：
> - 放在 RPG 像素介面的場景中央，夜空藍底 `#0a0d24`、白框黑底視窗包圍 → 角色必須在深色底上輪廓清楚。
> - 高清卡通、**粗黑描邊＋平塗 2 階陰影**，不可寫實、不可漸層光澤、不可 3D 渲染。
> - 要進 Rive 變形：**正面、左右對稱、手臂離開軀幹（腋下留縫）、腳與肩同寬**。
> - 基底畫成**中等身材（約 50 分）**，Rive 往兩邊拉：0 分瘦、100 分爆肌。
> - 7 個變形部位都要露出來：胸、背（從正面看是背闊肌外擴）、肩、二頭、三頭、核心、腿 → 上半身裸露，服裝只能在腰以下、手腕、頭部。
> - IP 安全：不可像任何現有角色（不要筋肉人的面具、肉字、不要七龍珠髮型）。

## 去 AI 感的設計手段

AI 生成角色的典型破綻：油亮的立體光影、每塊肌肉都畫滿、臉孔是「平均帥哥」、配色是飽和的橘藍對比、服裝細節多但沒有意義。對策：

1. **剪影先行**：先用純黑剪影確認三種狀態（0/50/100 分）一眼分得出來，才談細節。
2. **限色**：每個角色最多 8 個顏色（含描邊黑），寫死在色票裡，生圖後用 vtracer 降色強制回到色票。
3. **一個記憶點**：每個角色只給一個獨特道具/特徵，其他全部簡化。
4. **不對稱的個性藏在臉上**：身體對稱（為了 Rive），但表情可以歪嘴、單邊挑眉。
5. **描邊統一粗細**：vtracer 轉向量後重新統一描邊，消除 AI 線條粗細亂飄。

## 概念 A：街機格鬥家「阿力」— 7 頭身

- **定位**：90 年代街機格鬥遊戲的主角，熱血、正派。最接近 v1 的延伸。
- **記憶點**：綁在額頭的長布條頭帶，兩條尾巴飄在腦後（站定時垂在肩上）。
- **服裝**：深色道服長褲＋布腰帶、赤腳、手腕纏白布。
- **表情**：濃眉、咬牙笑，自信。
- **變形可讀性**：比例寫實，肌肉變化最「真實」；但在手機上角色只有約 200px 寬，7 頭身的臉最小。
- **色票**：描邊 `#16100a`｜膚 `#e9a46a`／`#b8723f`｜褲 `#2b3550`／`#1b2236`｜頭帶 `#d8322a`｜纏布 `#f2efe8`｜髮 `#1a1410`

## 概念 B：冒險者大叔「阿力」— 5 頭身

- **定位**：RPG 新手村出發的中年冒險者，憨厚、有點遜，但很努力。最貼 RPG 世界觀與「自嘲」語氣。
- **記憶點**：斜背一條皮革帶，掛一個小水壺（藥水瓶造型）。
- **服裝**：及膝短褲＋寬皮帶、短靴、無袖。下巴有鬍渣。
- **表情**：八字眉、傻笑，看起來不太有自信——正好跟旁白吐槽搭配。
- **變形可讀性**：頭稍大、臉清楚，身體仍有足夠面積表現肌肉變化，**平衡點最好**。
- **色票**：描邊 `#16100a`｜膚 `#e2a072`／`#a86a44`｜短褲 `#4a6b3a`／`#2f4626`｜皮革 `#7a4a26`｜靴 `#3a2a1e`｜鬍渣 `#6b5a4e`

## 概念 C：Q 版小勇者「阿力」— 3.5 頭身

- **定位**：可愛的像素遊戲主角放大版，最像「遊戲角色」。
- **記憶點**：頭上一頂過大的頭盔（單根小角），遮住一點眼睛。
- **服裝**：短披風（只到肩後，從正面看是兩片肩上的布）、短褲、圓頭靴。
- **表情**：大眼、張嘴喊聲，誇張漫畫感。
- **變形可讀性**：頭大身小，肌肉要變化得**非常誇張**才看得出來（像氣球一樣鼓），喜感最強，但「真實進步感」最弱。
- **色票**：描邊 `#16100a`｜膚 `#f0b07c`／`#c07a4c`｜頭盔 `#b9c2cf`／`#7d8796`｜披風 `#c8302c`｜短褲 `#2d3a6b`｜靴 `#5a3a24`

## 生圖 prompt（三個概念共用骨架，只換「角色段」）

共用骨架（去 AI 感的限制都寫在這裡）：

> Character turnaround front view only, full body, perfectly symmetrical standing pose, feet shoulder-width apart, arms held slightly away from the torso at about 20 degrees so there is a clear gap under each armpit, fists loosely closed. **Medium athletic build — clearly trained but not a bodybuilder**, leaving room to look both thinner and much bigger. Upper body bare so chest, shoulders, arms, abs and lats are visible. Style: 1990s Japanese game manual illustration — thick uniform black outlines, flat cel coloring with exactly one shadow tone per color, no gradients, no glossy highlights, no rim light, no texture, no 3D rendering. Limited palette of at most 8 colors. Simple readable shapes, minimal muscle detail lines (only the major separations). Plain flat white background, no shadow on the ground, no text, no logo, no watermark. Original character, not resembling any existing franchise.

角色段：

- **A 街機格鬥家**：
  > A 7-heads-tall Japanese street fighter in his late 20s. Long red cloth headband tied on the forehead with two tails resting on his shoulders. Dark navy martial-arts trousers with a cloth belt, barefoot, white cloth wraps on both wrists. Thick eyebrows, confident gritted-teeth grin. Short black hair.
- **B 冒險者大叔**：
  > A 5-heads-tall slightly goofy middle-aged adventurer from a starting village. Knee-length olive green shorts with a wide brown leather belt, a thin leather strap across the chest holding a small potion flask at the hip, short brown boots. Light stubble, droopy eyebrows, awkward but earnest smile, a bit unsure of himself. Short messy dark brown hair.
- **C Q 版小勇者**：
  > A 3.5-heads-tall chibi hero with a big head and expressive large eyes, shouting with mouth open. An oversized grey steel helmet with a single small horn on top, slightly covering the eyebrows. A short red cape visible only as two flaps behind the shoulders, navy shorts, round brown boots.

生圖後處理（GitHub 工具 vtracer，visioncortex/vtracer）：去背 → 降色到色票 → `vtracer` 轉 SVG（color mode、filter_speckle 提高以去雜點）→ 檢查描邊粗細 → 放進 `design/mockups/home-rpg.html` 實際場景比較。

## 評估結果（2026-10-04，生圖 art/char_A/B/C.png）

以第一性原則「七部位肌肉必須全露」為首要條件：

- **A 淘汰**：褲子蓋住整條腿；頭帶不對稱；太像《快打旋風》隆。
- **C 淘汰**：披風擋肩與背闊、頭盔讓身體面積過小。
- **B 保留個性、改服裝**：改摔角短褲長度、拿掉斜背帶、藥水瓶移到皮帶正中。改良版 prompt 見 `art/RESUME_character.md`。
