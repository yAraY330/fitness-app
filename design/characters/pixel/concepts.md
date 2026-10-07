# 像素角色：三個虛構概念（2026-10-05）

> 計畫：程式產生的 JRPG 像素主角。頭、臉、髮型、褲子＝手修像素零件（固定）；肌肉＝程式依 7 部位分數產生。
> 本檔產出 Dreamina 參考圖 prompt；參考圖只當「頭臉髮型褲子」的依據，不直接放進 App（AI 像素圖是假像素）。

## 共同條件

- **風格**：SFC／GBA 時代 JRPG 主角立繪（16-bit），1px 深色外框、平塗＋1 階陰影、無反鋸齒、無漸層。
- **鏡子功能**：上半身裸露，7 部位全露（胸、背闊、肩、二頭、三頭、核心、腿）。褲子最長到大腿中段。
- **姿勢**：正面、左右對稱、手臂離身約 20°（腋下留縫）、雙腳與肩同寬。程式要在手臂與軀幹間長肌肉，縫不能太小。
- **體型**：中等身材（約 50 分）。最瘦與最壯由程式往兩邊推。
- **IP 安全**：不可像任何現有角色。不用頭帶加道服（隆）、不用超賽式髮型（悟空）、不用面具或肉字（筋肉人）。
- **場景**：站在 `#0a0d24` 夜空底上，輪廓要清楚 → 外框用暖黑 `#1a1020`，不用純黑（純黑在深藍底上會糊掉）。

### 色票方向（ui-ux-pro-max 查詢結果見文末）

角色本身 ≤ 12 色，App 介面的功能色不能拿來當服裝主色：金 `#ffd34d`（選取）、紅 `#ff6b6b`（衰退圈）、綠 `#4ade80`（HP 條）。衰退紅圈要在角色身上看得清楚，所以服裝避開紅色。

## 概念 A：見習拳士「阿拳」

- **定位**：剛下山的武道見習生，認真、有點呆。旁白吐槽他「腿又偷懶了」時最有喜感。
- **記憶點**：頭頂一撮翹起的呆毛＋雙手纏白色繃帶。
- **服裝**：深藍短武道褲（到大腿中段）、粗麻繩腰帶、赤腳。
- **色票**：外框 `#1a1020`｜膚 `#f2b07a` / `#c4784a`｜髮 `#2a2238` / `#4a3a5c`｜褲 `#2d4a8a` / `#1e3060`｜繃帶 `#f4f0e6` / `#c8c0b0`｜繩 `#b08850`｜眼 `#1a1020`

**Dreamina prompt：**
```
16-bit SNES era JRPG pixel art character sprite, single character, full body, front view, perfectly symmetrical standing pose, arms held about 20 degrees away from the torso with a clear gap under each armpit, fists loosely closed, feet shoulder-width apart. Original young martial arts apprentice, shirtless, average athletic build (not muscular), earnest slightly goofy expression, short messy dark purple-black hair with one single cowlick sticking up on top, white cloth bandages wrapped around both hands and wrists, short dark navy blue martial arts shorts ending at mid-thigh, rough rope belt, barefoot. Crisp pixel art, visible square pixels, 1-pixel dark outline, flat colors with one shadow tone, no anti-aliasing, no gradients, limited palette of about 12 colors. Plain flat light grey background. No text, no logo, no UI, no weapon.
```

## 概念 B：草原冒險者「阿風」

- **定位**：新手村出發的少年冒險者，開朗、愛逞強。最貼 RPG 世界觀。
- **記憶點**：亂翹的紅棕髮＋鼻樑雀斑＋左耳後插一根白羽毛（臉部不對稱放個性，身體保持對稱）。
- **服裝**：棕色皮短褲、大銅扣腰帶、及小腿皮靴、皮護腕。
- **色票**：外框 `#1a1020`｜膚 `#f0b48a` / `#c07a52`｜髮 `#a8502a` / `#6e3018`｜皮革 `#7a4e2c` / `#4e2e18`｜銅扣 `#d8a040`｜羽毛 `#f4f0e6`｜眼 `#1a1020`

**Dreamina prompt：**
```
16-bit SNES era JRPG pixel art character sprite, single character, full body, front view, perfectly symmetrical standing pose, arms held about 20 degrees away from the torso with a clear gap under each armpit, fists loosely closed, feet shoulder-width apart. Original cheerful teenage adventurer from a starting village, shirtless, average athletic build (not muscular), confident grin, messy spiky reddish-brown hair, freckles across the nose, one small white feather tucked behind the left ear, short brown leather shorts ending at mid-thigh, wide belt with a round brass buckle, leather bracers on both forearms, brown leather boots up to mid-calf. Crisp pixel art, visible square pixels, 1-pixel dark outline, flat colors with one shadow tone, no anti-aliasing, no gradients, limited palette of about 12 colors. Plain flat light grey background. No text, no logo, no UI, no weapon.
```

## 概念 C：狼族少年「阿牙」

- **定位**：獸人族的見習戰士，不服輸、愛面子。非人類造型，辨識度最高，也最不容易撞到現有角色。
- **記憶點**：灰白狼耳＋從身後露出的蓬鬆尾巴、一顆小虎牙。
- **服裝**：墨綠短褲、布條腰帶、赤腳、雙腳踝纏布。
- **色票**：外框 `#1a1020`｜膚 `#e8a878` / `#b87048`｜毛（髮/耳/尾）`#c8ccd8` / `#8a90a8`｜褲 `#3a5a40` / `#26402c`｜布 `#e8e0d0`｜眼 `#e0a020`（金瞳）

**Dreamina prompt：**
```
16-bit SNES era JRPG pixel art character sprite, single character, full body, front view, perfectly symmetrical standing pose, arms held about 20 degrees away from the torso with a clear gap under each armpit, fists loosely closed, feet shoulder-width apart. Original wolf-kin boy warrior in training, human body with grey-white wolf ears on top of the head and a fluffy grey-white wolf tail visible behind the legs, shirtless, average athletic build (not muscular), cocky smile showing one small fang, golden eyes, shaggy silver-grey hair, short dark green shorts ending at mid-thigh, cloth sash belt, barefoot with cloth wraps around both ankles. Crisp pixel art, visible square pixels, 1-pixel dark outline, flat colors with one shadow tone, no anti-aliasing, no gradients, limited palette of about 12 colors. Plain flat light grey background. No text, no logo, no UI, no weapon.
```

## 給使用者：Dreamina 操作

1. 登入 dreamina.capcut.com → 選「圖片生成」（AI Image）
2. 比例選 **3:4**（直式），貼上 prompt。模型用預設即可（Seedream）
3. 每個概念生一次（通常一次出 4 張），挑最好的一張下載
4. 存成 `C:\Users\shaor\fitness-app\art\pixel_ref_A.png`、`pixel_ref_B.png`、`pixel_ref_C.png`
5. 看到「手臂貼身」、「穿上衣」、「出現兩個人」→ 那張不要，直接重生
6. 生不出來（被擋或品質很差）→ 跟我說，我改 prompt。不要自己在 Dreamina 加很多修改指令，AI 一次改太多會漏

## 證據：ui-ux-pro-max 查詢

- `python scripts/search.py "pixel art retro 8-bit game" --domain style` → **Pixel Art**：採用其實作清單（`image-rendering: pixelated`、限色、逐格動畫、Canvas 10/10）→ 對應計畫的 canvas 輸出＋整數倍放大＋2 格 idle。**不採用** Retro-Futurism（霓虹、CRT 掃描線、glitch），和 DESIGN.md 的 RPG 視窗風衝突。
- `python scripts/search.py "retro game pixel dark" --domain color` → **Arcade & Retro Game** 色票（紅 `#DC2626`／藍 `#2563EB`／綠 `#22C55E`，底 `#0F172A`）。**不採用為角色色**：紅、綠和 App 的衰退圈、HP 條功能色撞色，會讓「紅圈＝退化」看不清楚。只採用它「深底＋高明度主體」的原則 → 角色膚色與服裝取中高明度，外框用暖黑。

## 階段 1 結果（2026-10-05）

使用者選定 **概念 A 見習拳士**（Dreamina 圖，`art/pixel_ref_A.jpg`；圖上有夜空背景與浮水印，因為 prompt 貼入時連同整份文件）。

**做法調整（相對計畫）：** 肌肉不用程式畫橢圓（會和參考圖的陰影風格對不上），改為「以參考圖為 50 分基底，逐列把各部位片段撐寬／收窄＋陰影線深淺」。
- 第一版：12px 格縮成 78×159、限 16 色、手畫臉（`face_patch.py`）→ **使用者否決：「臉整個跑掉，直接用原圖」**
- 定案版：`build_base.py` 以 **6px 半格**取樣（原圖臉部細節約 6px）→ 夜空去背 → k-means 40 色 → `base_A.txt`／`base_A.js`（154×317）。臉不手修，照原圖。`face_patch.py` 已不使用
- 變形：`sprite.js`（純函數，230×320 畫布，1 倍顯示）；50 分＝原圖。使用者說自己目前約 40～50 分，要求 100 分「再粗壯、明顯」→ 往上撐的幅度（KU）約為往下縮（KD）的 2 倍，並加列內漸變（三角肌中段鼓、小腿上粗下細、上臂往手肘收）
- 尺寸與計畫不同：計畫寫 72×100，實際 154×317（再縮會失去臉部細節）

## 證據：impeccable detect（sprite-lab.html）

`node .claude/skills/impeccable/scripts/detect.mjs --json design/characters/pixel/sprite-lab.html` → 5 項，全部是示意頁外框，與角色本身無關，不修改：
- `design-system-color` ×3（`#1b2150`、`#2b3375`）：場景地面色，沿用 App `css/style.css` 首頁場景現有色（advisory）。階段 2 補進 DESIGN.md
- `single-font`：DESIGN.md 規定全站單一 Cubic 11，刻意的
- `flat-type-hierarchy`（13/16/18/22）：用的是 DESIGN.md 六級字級中的四級，刻意的

## 成長期：五個時期各一張 Dreamina 圖（2026-10-05 使用者決定）

使用者：「幼年、少年、青年、壯年、完全期的臉部應該越來越成熟，身高也要逐漸生長」→ 每個時期一張參考圖，各自轉成基底；程式負責「時期內每升一級再長一點」＋部位分數的肌肉變化。

| 時期 | 等級 | 年紀感 | 頭身 | 檔名 |
|---|---|---|---|---|
| 幼年期 | Lv1–4 | 約 8 歲 | 約 4 頭身 | `art/pixel_A_stage1.*` |
| 少年期 | Lv5–9 | 約 13 歲 | 約 5.5 頭身 | `art/pixel_A_stage2.*` |
| 青年期 | Lv10–19 | 約 18 歲 | 約 6.5 頭身 | 已有：`art/pixel_ref_A.jpg` |
| 壯年期 | Lv20–29 | 約 28 歲 | 約 7 頭身 | `art/pixel_A_stage4.*` |
| 完全期 | Lv30+ | 約 35 歲（巔峰） | 約 7.5 頭身 | `art/pixel_A_stage5.*` |

每張都是「該年紀的 50 分身材」（肌肉多寡仍由部位分數調）。身高差距由程式統一（各時期取樣格大小不同），不靠 AI 畫準。

### 共同後半段（每段 prompt 都接在後面）
```
Keep exactly the same character identity as the reference image: same face shape, same dark purple-black messy hair with the single cowlick sticking up on top, same orange-brown eyes, same white cloth bandages on both hands, same dark navy martial arts shorts with rough rope belt, barefoot. Same pose: full body, front view, perfectly symmetrical standing pose, arms about 20 degrees away from the torso, fists loosely closed, feet shoulder-width apart. Same 16-bit SNES JRPG pixel art style, 1-pixel dark outline, flat colors, no anti-aliasing. Single character only. Plain flat light grey background. No text, no scenery.
```

### 各時期前半段
- **幼年期**：`Change only his age: make him a young child about 8 years old, about 4 heads tall, large head relative to the body, round soft face, big eyes, short limbs, slim child body with no muscle definition, small hands.`
- **少年期**：`Change only his age: make him about 13 years old, about 5.5 heads tall, slightly rounder and younger face than the reference, lean wiry body with light muscle definition, longer thin limbs.`
- **壯年期**：`Change only his age: make him an adult man about 28 years old, about 7 heads tall, more mature face with a stronger jaw and sharper eyes, light stubble, broad shoulders, well-developed athletic muscles.`
- **完全期**：`Change only his age: make him about 35 years old at the absolute peak of his strength, about 7.5 heads tall, mature rugged face, strong square jaw, calm confident eyes, a small scar across one eyebrow, broad heavy frame with powerful natural muscles (not a bodybuilder).`

### 第三版 prompt：明確比例標記（2026-10-05）

第二版 Dreamina 仍未達頭身數（實測 2.6／3.5／4.5／5.3／5.4）。第三版改寫成「身高切 N 等分＋各部位落在第幾格」，並要求只參考臉、髮、服裝，不沿用參考圖比例。頭高定義：頭髮頂（不含呆毛／髮髻）到下巴。存成 `art/pixel_A_stage<N>_v3.jpg`。

## POSING 實驗：背面雙手二頭（少年期，2026-10-07）

目的：先生一張，轉成像素確認姿勢在小尺寸看不看得清，再決定 posing room 做不做。
參考圖：`art/pixel_A_stage1_v2.jpg`（App 目前 Lv5–9 用的這張）。比例 9:16。存成 `art/pixel_pose_backbi_teen.jpg`。

```
Use the reference image only for the character's identity and art style: the same boy, same dark purple-black messy spiky hair with the single cowlick sticking up on top, same white cloth bandages wrapped on both hands and wrists, same dark navy martial arts shorts with a rough beige rope belt, barefoot. He is about 13 years old with a lean, wiry teenage body and light muscle definition (not bulky).

New pose: back double biceps, seen exactly from behind. We see his back, the back of his head and his hair, not his face. Both upper arms raised out to the sides at shoulder height, elbows bent at 90 degrees, forearms pointing straight up, fists closed at about the height of the top of his head, flexing both biceps. Shoulder blades squeezed, light back muscle lines visible. Perfectly symmetrical. Feet shoulder-width apart, both feet flat on the ground. The arms must not overlap the head or the body: clear empty background between the fists and the head, and between the elbows and the torso.

Full body, centered, the whole figure including both elbows and both fists fits inside the frame with margin on all sides. Same 16-bit SNES JRPG pixel art style as the reference, 1-pixel dark outline, flat colors, no anti-aliasing, no blur. Single character only. Plain flat light grey background, no shadow on the ground, no text, no scenery.
```
