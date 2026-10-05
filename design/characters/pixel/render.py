# 像素基底預覽：python render.py <grid.txt> <out.png> [scale] [x0 y0 x1 y1]
# grid 檔格式：開頭「符號 #hex 說明」色票行，接一行 ---，之後每行一列像素（. ＝透明）
import sys
from PIL import Image

def load(path):
    pal, rows, body = {}, [], False
    for line in open(path, encoding='utf-8').read().splitlines():
        if line.strip() == '---': body = True; continue
        if not body:
            if line.strip() and not line.startswith('#'):
                sym, hexc = line.split()[:2]; pal[sym] = hexc
        else: rows.append(line)
    return pal, rows

def render(path, out, scale=4, crop=None, bg=(10, 13, 36)):
    pal, rows = load(path)
    w = max(len(r) for r in rows); h = len(rows)
    im = Image.new('RGB', (w, h), bg)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.': im.putpixel((x, y), tuple(int(pal[c][i:i+2], 16) for i in (1, 3, 5)))
    if crop: im = im.crop(crop)
    im.resize((im.width * scale, im.height * scale), Image.NEAREST).save(out)

if __name__ == '__main__':
    a = sys.argv
    render(a[1], a[2], int(a[3]) if len(a) > 3 else 4, tuple(map(int, a[4:8])) if len(a) > 7 else None)
