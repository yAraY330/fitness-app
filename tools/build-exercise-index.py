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

FIELDS = ['id', 'name', 'body_part', 'equipment', 'muscle_group',
          'secondary_muscles', 'target', 'image', 'gif_url']

with open(SRC, encoding='utf-8') as f:
    data = json.load(f)

slim = [{k: e[k] for k in FIELDS} for e in data]

header = (
    '// 由 tools/build-exercise-index.py 自動生成，勿手改。\n'
    '// 資料來源：https://github.com/hasaneyldrm/exercises-dataset（資料 MIT；媒體 © Gym visual）\n'
)
body = 'window.EXERCISE_INDEX = ' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';\n'

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(header + body)

print(f'{len(slim)} exercises -> {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)')
