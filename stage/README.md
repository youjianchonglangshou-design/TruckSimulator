# 實景考題模組 v3.8

- `manifest.js`：檔案清單，依照排列順序載入考題。
- `ns2.js`、`ns5.js`、`dc3.js`：各自獨立的實景考題，含場景建築、道路尺寸、停車格、碰撞、隨機配置、引導及教練指令。

新增實景考題：

1. 參照既有 JS，建立如 `dc4.js`。每個模組使用 `TruckRealScenes.register('dc4', function(physics) { ...; return scene; })`，名稱需與檔名（不含副檔名）一致，場景 `id` 不可重複。
2. 在 `manifest.js` 的 `files` 清單加入 `'dc4.js'`。如有需要，設定 `name`（含顯示編號）、`difficulty`（1–6，6 為 SSR）。
3. 必要場景介面：`start`, `goal`, `obstacles`, `collision`, `parked`, `bounds`, `render`。選用介面：`randomize`, `info`, `coach`, `witness`, `signs`, `guide`, `turnMarkers`, `goalVisible`, `visualGoal`, `coachActualSteering`。
4. 上傳新 JS 與更新的 manifest.js；重新整理即可出現在實景選單。不需改 index.html。

GitHub Pages 為靜態網站，無法直接列出資料夾檔案，因此用 manifest.js 明確登記；每次網頁載入均加上新的時間戳。原根目錄 real-scenes.js 已不再使用，可刪除。nico.js 與其餘原檔不需改動。
