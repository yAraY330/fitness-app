# 從 Dreamina 參考圖產生像素基底（各圖＝該時期 50 分）→ base_<key>.txt（render.py 預覽）＋ js/sprite-data.js（App 用，列以 RLE 壓縮）
# 用法（fitness-app 根目錄）：python design/characters/pixel/build_base.py [--debug]
#
# 角色模組：10 張圖，6 個稱號 × 體型（精實 lean／壯碩 bulk）。等級決定年紀、體型由體重＋訓練量決定、部位分數決定肌肉。
# 規則（使用者 2026-10-05）：比例只能來自原圖，**絕不垂直拉長**；每張圖只做等比例縮放，
# 縮放依「稱號身高」（hairTop→腳底＝heightCells 格），保證升級一定變高。
# 步驟：等比例取樣（每格中心 r×r 中位數）→ 去背 → k-means 限色 → 依顏色自動量部位列範圍（--debug 輸出色帶疊圖檢查）
import json, os, sys
from collections import deque
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
# 稱號 → 顯示身高（格＝CSS px，1 倍顯示）
TITLES = [
    {'min': 1,  'title': '健身新手',   'heightCells': 150},
    {'min': 5,  'title': '運動愛好者', 'heightCells': 185},
    {'min': 10, 'title': '健身達人',   'heightCells': 225},
    {'min': 15, 'title': '肌肉戰士',   'heightCells': 265},
    {'min': 20, 'title': '健身大師',   'heightCells': 300},
    {'min': 30, 'title': '傳奇冠軍',   'heightCells': 330},
]
# 圖檔與手量位置（原圖 px）：hairTop＝頭髮頂（不含呆毛／髮髻）、feet＝腳底
IMAGES = [
    {'key': 'i1',  'file': 'pixel_A_stage1.jpg',    'hairTop': 300, 'feet': 1900, 'title': 0, 'type': 'both'},
    {'key': 'i6',  'file': 'pixel_A_stage1_v2.jpg', 'hairTop': 150, 'feet': 1895, 'title': 1, 'type': 'both'},
    {'key': 'i7',  'file': 'pixel_A_stage2_v2.jpg', 'hairTop': 200, 'feet': 1895, 'title': 2, 'type': 'lean'},
    {'key': 'i2',  'file': 'pixel_A_stage2.jpg',    'hairTop': 300, 'feet': 1912, 'title': 2, 'type': 'bulk'},
    {'key': 'i8',  'file': 'pixel_A_stage3_v2.jpg', 'hairTop': 155, 'feet': 1935, 'title': 3, 'type': 'lean'},
    {'key': 'i3',  'file': 'pixel_A_stage3.jpg',    'hairTop': 230, 'feet': 1960, 'title': 3, 'type': 'bulk'},
    {'key': 'i9',  'file': 'pixel_A_stage4_v2.jpg', 'hairTop': 200, 'feet': 1905, 'title': 4, 'type': 'lean'},
    {'key': 'i4',  'file': 'pixel_A_stage4.jpg',    'hairTop': 150, 'feet': 1960, 'title': 4, 'type': 'bulk'},
    {'key': 'i10', 'file': 'pixel_A_stage5_v2.jpg', 'hairTop': 175, 'feet': 1915, 'title': 5, 'type': 'lean'},
    {'key': 'i5',  'file': 'pixel_A_stage5.jpg',    'hairTop': 185, 'feet': 1950, 'title': 5, 'type': 'bulk'},
]
# 部位列範圍（基底格座標，手量自 --debug 刻度圖）：neck 下巴下緣｜armpit 手臂與軀幹分開｜hand/handEnd 繃帶＋拳頭｜
# belt 腰帶上緣｜split 褲管分岔｜shortsEnd 褲管下緣｜ankle 腳踝｜bottom 腳底
BANDS = {
    'i1':  dict(neck=90,  armpit=110, hand=120, handEnd=140, belt=118, split=146, shortsEnd=156, ankle=162, bottom=172),
    'i6':  dict(neck=80,  armpit=100, hand=117, handEnd=147, belt=122, split=148, shortsEnd=160, ankle=185, bottom=196),
    'i7':  dict(neck=82,  armpit=105, hand=135, handEnd=170, belt=130, split=170, shortsEnd=182, ankle=222, bottom=243),
    'i2':  dict(neck=98,  armpit=115, hand=143, handEnd=177, belt=145, split=180, shortsEnd=192, ankle=235, bottom=254),
    'i8':  dict(neck=78,  armpit=105, hand=143, handEnd=182, belt=142, split=200, shortsEnd=208, ankle=268, bottom=285),
    'i3':  dict(neck=80,  armpit=112, hand=145, handEnd=188, belt=143, split=193, shortsEnd=228, ankle=275, bottom=290),
    'i9':  dict(neck=82,  armpit=115, hand=165, handEnd=212, belt=160, split=215, shortsEnd=238, ankle=310, bottom=332),
    'i4':  dict(neck=72,  armpit=105, hand=145, handEnd=197, belt=152, split=205, shortsEnd=220, ankle=295, bottom=320),
    'i10': dict(neck=68,  armpit=125, hand=162, handEnd=220, belt=160, split=240, shortsEnd=232, ankle=325, bottom=352),
    'i5':  dict(neck=82,  armpit=150, hand=180, handEnd=236, belt=177, split=250, shortsEnd=262, ankle=312, bottom=345),
}
K = 40
SYMS = 'KSABCDEFGHIJLMNOPQRTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

def grid(a, cell, r):
    n, m = int(a.shape[1] / cell), int(a.shape[0] / cell)
    g = np.zeros((m, n, 3), int)
    for j in range(m):
        cy = int((j + 0.5) * cell)
        for i in range(n):
            cx = int((i + 0.5) * cell)
            g[j, i] = np.median(a[max(0, cy - r):cy + r + 1, max(0, cx - r):cx + r + 1].reshape(-1, 3), 0)
    return g

def flood(H, W, seeds, ok):
    m = np.zeros((H, W), bool); q = deque(seeds)
    while q:
        y, x = q.popleft()
        if not (0 <= y < H and 0 <= x < W) or m[y, x] or not ok[y, x]: continue
        m[y, x] = True; q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return m

def segment(g, seed, feet_row):
    H, W, _ = g.shape
    R, G, B = g[..., 0], g[..., 1], g[..., 2]
    mx, mn = g.max(2), g.min(2)
    dark = mx < 60
    sky = (B > R + 25) & (R < 70)                                              # 夜空
    ground = (G > R + 10) & (abs(G - B) < 40) & (R > 90) & (R < 190) & (G > 130)  # 夜空圖的地面
    bgc = np.median(g[:6, :6].reshape(-1, 3), 0)                               # 淺灰底（角落取樣）
    grey = (np.abs(g - bgc).max(2) < 22) | ((mx - mn < 30) & (mx > 225))       # 底色、白色浮水印
    # 腳下淡紫陰影和繃帶陰影色很像 → 只在腳底附近（身高 4% 內）當背景
    rows = np.arange(H)[:, None] >= feet_row - max(3, int(feet_row * 0.04))
    grey |= (mx - mn < 36) & (mx > 120) & rows
    border = [(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)]
    bg = flood(H, W, border, (sky | ground | grey) & ~dark)
    body = flood(H, W, [seed], ~bg)
    body &= ~((R < 35) & (G > 60))
    # 被身體圍住的底色（兩腿之間）：與底色幾乎相同的大塊連通區（>30 格）才去掉，避免誤刪繃帶亮面
    near = body & (np.abs(g - bgc).max(2) < 14)
    seen = np.zeros_like(near)
    for y0, x0 in zip(*np.where(near)):
        if seen[y0, x0]: continue
        comp = flood(H, W, [(y0, x0)], near & ~seen); seen |= comp
        if comp.sum() > 30: body &= ~comp
    ys = np.where(body.any(1))[0]
    solid = body & ~dark
    for y in range(max(0, ys.max() - 60), ys.max() + 1):                       # 腳下地平線／陰影外框
        for x in range(W):
            if body[y, x] and dark[y, x] and not solid[max(0, y - 4):y + 5, x].any():
                body[y, x] = False
    return flood(H, W, [seed], body)

def runs(row):
    out, s = [], None
    for x, v in enumerate(list(row) + [False]):
        if v and s is None: s = x
        if not v and s is not None: out.append((s, x - 1)); s = None
    return out

def classify(C):
    cls = {}
    for i, (r, g, b) in enumerate(C):
        mx, mn = max(r, g, b), min(r, g, b)
        if b > r + 15 and mx < 150: cls[i] = 'pants'                                   # 深藍褲（含頭髮紫藍，靠位置排除）
        elif mn > 160 and mx - mn < 45: cls[i] = 'wrap'                                 # 繃帶
        elif r > 140 and g > 105 and b < 140 and r - b > 45 and abs(r - g) < 55 and g / r > 0.72: cls[i] = 'rope'
        elif r > g > b and r > 120 and 0.55 <= g / r <= 0.86 and 0.35 <= b / r <= 0.72: cls[i] = 'skin'   # 排除瞳孔橘、繩黃
    return cls

def bands(lab, cls):
    H, W = lab.shape
    mask = lab >= 0
    rows = [runs(mask[y]) for y in range(H)]
    ys = [y for y in range(H) if rows[y]]; top, bottom = ys[0], ys[-1]
    kind = lambda y, k, s=0, e=None: sum(1 for v in lab[y, s:e] if v >= 0 and cls.get(v) == k)
    # 腰帶：自上而下第一列，繩色或褲色占該列 25% 以上（頭髮的紫藍只在頭部，位置在上 1/3 以內 → 從 1/3 處開始找）
    belt = next(y for y in range(top + (bottom - top) // 3, bottom)
                if (kind(y, 'rope') + kind(y, 'pants')) > 0.25 * sum(e - s + 1 for s, e in rows[y]))
    # 軀幹中心：腰帶列的褲／繩像素中心
    xs = [x for x in range(W) if lab[belt, x] >= 0 and cls.get(lab[belt, x]) in ('rope', 'pants')]
    cx = (min(xs) + max(xs)) // 2
    # 手（繃帶）：繃帶色出現在軀幹外側的列範圍
    half = (max(xs) - min(xs)) // 2
    def wrap_side(y):
        return any(cls.get(v) == 'wrap' for x, v in enumerate(lab[y]) if v >= 0 and abs(x - cx) > half * 0.9)
    wr = [y for y in range(top, bottom) if wrap_side(y)]
    # 腳踝繃帶也是繃帶色 → 只取腰帶附近（上下 1/4 身高內）最長的連續段
    wr = [y for y in wr if abs(y - belt) < (bottom - top) / 4]
    hand, hand_end = min(wr), max(wr)
    # 手下方的拳頭（皮膚）延伸：繃帶結束後，外側仍有獨立片段的列
    y = hand_end
    while y + 1 < bottom and len(rows[y + 1]) >= 3: y += 1
    hand_end = y
    # 脖子：頭與肩之間最窄處（在腰帶上方、身高前 45% 內，且寬度先達頭寬後）
    widths = [(r[-1][1] - r[0][0] + 1) if r else 0 for r in rows]
    head_max_y = max(range(top, top + int((belt - top) * 0.6)), key=lambda y: widths[y])
    neck = min(range(head_max_y, belt - int((belt - top) * 0.3)), key=lambda y: widths[y])
    # 腋下：脖子以下第一列，中央片段兩側都已分出手臂（≥3 片段）
    armpit = next((y for y in range(neck, hand) if len(rows[y]) >= 3), hand)
    # 褲管分岔：腰帶以下第一次中心沒有像素
    split = next(y for y in range(belt, bottom) if not mask[y, cx])
    pants_rows = [y for y in range(split, bottom) if kind(y, 'pants') > 2]
    shorts_end = max(pants_rows) if pants_rows else split
    lo = shorts_end + (bottom - shorts_end) // 2
    leg_w = [max((e - s + 1) for s, e in rows[y] if e < cx) if any(e < cx for s, e in rows[y]) else 999 for y in range(H)]
    ankle = lo + int(np.argmin(leg_w[lo:max(lo + 1, bottom - 2)]))
    return {k: int(v) for k, v in dict(top=top, neck=neck, armpit=armpit, hand=hand, handEnd=hand_end, belt=belt,
            split=split, shortsEnd=shorts_end, ankle=ankle, bottom=bottom, cx=cx, torsoHalf=half).items()}

def build(img, debug=False):
    t = TITLES[img['title']]
    a = np.asarray(Image.open(os.path.join(ROOT, 'art', img['file'])).convert('RGB')).astype(int)
    cell = (img['feet'] - img['hairTop']) / t['heightCells']
    g = grid(a, cell, r=max(1, int(cell / 4)))
    body = segment(g, (int(g.shape[0] * 0.45), g.shape[1] // 2), int(img['feet'] / cell))
    px = g[body].astype(float)
    rng = np.random.default_rng(0)
    C = px[rng.choice(len(px), K, replace=False)]
    for _ in range(25):
        lk = ((px[:, None] - C[None]) ** 2).sum(2).argmin(1)
        C = np.array([px[lk == i].mean(0) if (lk == i).any() else C[i] for i in range(K)])
    C = C.round().astype(int)
    lab = np.where(body, ((g[..., None, :] - C[None, None]) ** 2).sum(3).argmin(2), -1)
    ys, xs = np.where(lab >= 0)
    lab = lab[ys.min() - 1:ys.max() + 2, xs.min() - 1:xs.max() + 2]
    cls = classify(C)
    meta = dict(BANDS.get(img['key']) or {})
    # 軀幹中心：脖子那列最外兩端的中點（脖子單段、左右對稱）
    nr = runs(lab[meta.get('neck', lab.shape[0] // 4)] >= 0)
    meta['cx'] = (nr[0][0] + nr[-1][1]) // 2 if nr else lab.shape[1] // 2
    cnt = np.bincount(lab[lab >= 0], minlength=K)
    skin = sorted([i for i, k in cls.items() if k == 'skin' and cnt[i] > 0], key=lambda i: C[i].sum())
    pal = {SYMS[i]: '#%02x%02x%02x' % tuple(c) for i, c in enumerate(C)}
    rows = [''.join('.' if v < 0 else SYMS[v] for v in r) for r in lab]
    with open(os.path.join(HERE, f"base_{img['key']}.txt"), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(f'{k} {v}' for k, v in pal.items()) + '\n---\n' + '\n'.join(rows) + '\n')
    print(f"{img['key']:>3} {t['title']} {img['type']:<4} cell {cell:.2f}px size {lab.shape[1]}x{lab.shape[0]} {meta}")
    if debug: overlay(img['key'], lab, C, meta)
    return {'key': img['key'], 'title': img['title'], 'type': img['type'], 'palette': pal,
            'skinRamp': ''.join(SYMS[i] for i in skin), 'meta': meta, 'rows': rows}

def overlay(key, lab, C, meta):
    # 檢查用：角色＋各部位分界線（右側標色）
    H, W = lab.shape
    im = np.zeros((H, W + 30, 3), np.uint8); im[:] = (10, 13, 36)
    im[:, :W][lab >= 0] = C[lab[lab >= 0]]
    colors = {'neck': (255, 0, 0), 'armpit': (255, 128, 0), 'hand': (255, 255, 0), 'handEnd': (0, 255, 0),
              'belt': (0, 255, 255), 'split': (0, 128, 255), 'shortsEnd': (128, 0, 255), 'ankle': (255, 0, 255)}
    for k, c in colors.items():
        if k in meta: im[meta[k], :] = c
    im[:, meta['cx']] = (255, 255, 255)
    Image.fromarray(im).resize(((W + 30) * 2, H * 2), Image.NEAREST).save(os.path.join(os.environ.get('DBG', HERE), f'dbg_{key}.png'))

def rle(row):
    # 連續相同字元寫成「次數＋字元」（色票符號不含數字，次數 1 省略）；js/sprite.js 的 decodeRow 還原
    out, i = [], 0
    while i < len(row):
        j = i
        while j < len(row) and row[j] == row[i]: j += 1
        out.append((str(j - i) if j - i > 1 else '') + row[i]); i = j
    return ''.join(out)

def main():
    debug = '--debug' in sys.argv
    bases = [build(img, debug) for img in IMAGES]
    assert not any(ch.isdigit() for b in bases for ch in b['palette']), '色票符號不可含數字（RLE 用）'
    for b in bases: b['rows'] = [rle(r) for r in b['rows']]
    with open(os.path.join(ROOT, 'js', 'sprite-data.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// 由 design/characters/pixel/build_base.py 產生，勿手改（來源圖 art/ 不在 git）\nwindow.SPRITE_DATA = ' +
                json.dumps({'titles': TITLES, 'bases': bases}, ensure_ascii=False, separators=(',', ':')) +
                ";\nif (typeof module !== 'undefined') module.exports = window.SPRITE_DATA;\n")

if __name__ == '__main__':
    main()
