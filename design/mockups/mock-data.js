// 示意圖共用的假資料（與 dev-seed.html 的測試帳號一致）＋角色 SVG
window.MOCK = {
  name: '阿力', level: 3, xp: 113, xpNext: 200, stage: '健身新手',
  streak: 4, weekDays: 5, endurance: 37,
  date: { m: 10, d: 4, wd: '日' },
  // 週一~週日：訓練量（kg，0 = 沒練）
  week: [
    { d: 28, wd: '一', vol: 1200 }, { d: 29, wd: '二', vol: 0 }, { d: 30, wd: '三', vol: 860 },
    { d: 1, wd: '四', vol: 1500 }, { d: 2, wd: '五', vol: 640 }, { d: 3, wd: '六', vol: 980 },
    { d: 4, wd: '日', vol: 0, today: true },
  ],
  parts: [
    { k: 'chest', n: '胸部', s: 90, ago: 1 },
    { k: 'back', n: '背部', s: 63, ago: 2 },
    { k: 'legs', n: '腿部', s: 53, ago: 12, decay: 5 },
    { k: 'shoulders', n: '肩部', s: 43, ago: 3 },
    { k: 'biceps', n: '二頭', s: 54, ago: 6 },
    { k: 'triceps', n: '三頭', s: 59, ago: 6 },
    { k: 'core', n: '核心', s: 51, ago: 4 },
  ],
};

window.mockAvatarSvg = function () {
  const scores = {};
  MOCK.parts.forEach(p => { scores[p.k] = p.s; });
  return buildKinniku({
    gender: 'm', height: 175, weight: 72, scores,
    endurance: MOCK.endurance, stageIndex: 0, resting: false, dimParts: ['legs'],
  });
};

window.ICON = name => `https://cdn.jsdelivr.net/npm/@tabler/icons@3/icons/outline/${name}.svg`;
