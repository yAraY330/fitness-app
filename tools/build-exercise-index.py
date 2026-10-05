# 從 exercises-dataset/data/exercises.json（17MB，含十國語言教學文字）
# 生成精簡執行期索引 js/exercise-index.js（僅保留 App 需要的欄位）。
#
# 資料部分為 MIT 授權（見 exercises-dataset/NOTICE.md「Dataset (non-media)」），
# 可隨 repo 散布；媒體檔（images/videos/）仍為 © Gym visual，不進 git。
#
# 用法：python tools/build-exercise-index.py
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'exercises-dataset', 'data', 'exercises.json')
OUT = os.path.join(ROOT, 'js', 'exercise-index.js')

# 只留執行期實際用到的欄位（每多一欄 × 1,324 筆都會拖慢 App 啟動）。
# 媒體路徑 images/<m>.jpg、videos/<m>.gif 共用同一段檔名，只存 m，由 app.js 組回
FIELDS = ['id', 'name', 'secondary_muscles', 'target']

with open(SRC, encoding='utf-8') as f:
    data = json.load(f)

def media_stem(e):
    stem = e['image'].removeprefix('images/').removesuffix('.jpg')
    assert e['gif_url'] == f'videos/{stem}.gif', e['id']
    return stem

slim = [{**{k: e[k] for k in FIELDS}, 'm': media_stem(e)} for e in data]

header = (
    '// 由 tools/build-exercise-index.py 自動生成，勿手改。\n'
    '// 資料來源：https://github.com/hasaneyldrm/exercises-dataset（資料 MIT；媒體 © Gym visual）\n'
)
body = 'window.EXERCISE_INDEX = ' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';\n'

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(header + body)

print(f'{len(slim)} exercises -> {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)')
