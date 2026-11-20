# 實景考題模組 v3.9

- `manifest.js`：檔案清單，依照排列順序載入考題。
- `ns2.js`、`ns5.js`、`dc3.js`：各自獨立的實景考題，含場景建築、道路尺寸、停車格、碰撞、隨機配置、引導及教練指令。

新增實景考題：

1. 參照既有 JS，建立如 `dc4.js`。每個模組使用 `TruckRealScenes.register('dc4', function(physics) { ...; return scene; })`，名稱需與檔名（不含副檔名）一致，場景 `id` 不可重複。
2. 在 `manifest.js` 的 `files` 清單加入 `'dc4.js'`。如有需要，設定 `name`（含顯示編號）、`difficulty`（1–6，6 為 SSR）。
3. 必要場景介面：`start`, `goal`, `obstacles`, `collision`, `parked`, `bounds`, `render`。選用介面：`randomize`, `info`, `coach`, `witness`, `signs`, `guide`, `turnMarkers`, `goalVisible`, `visualGoal`, `coachActualSteering`。
4. 上傳新 JS 與更新的 manifest.js；重新整理即可出現在實景選單。不需改 index.html。

GitHub Pages 為靜態網站，無法直接列出資料夾檔案，因此用 manifest.js 明確登記；每次網頁載入均加上新的時間戳。原根目錄 real-scenes.js 已不再使用，可刪除。nico.js 與其餘原檔不需改動。

## v3.9 共用街景工具

根目錄 `street-assets.js` 由 index.html 在關卡檔之後載入。`render` 介面新增選用的 `street` 物件：

- `street.building(x1,x2,z1,z2,h,keys,y=0)`：依四個牆面指定貼圖；`keys` 可為單一材質或 `{south,east,north,west}`。材質可用 `[名稱,重複次數]`。
- `street.wall(x1,z1,x2,z2,y,h,key,repeat=1)`：定向牆面貼圖。
- `street.tree(x,z,scale)`、`street.scooter(x,z,angle,color)`、`street.signal(x,z,angle,length)`、`street.lamp`、`street.roadArrow`：共用街道道具。
- 可用材質：`brick`, `restaurant`, `glass`, `office`, `fubon`, `fubonCorner`, `warehouse`, `family`, `familySide`, `shops`, `betel`, `hardware`, `fence`。
- `street` 為視覺輔助模組；請保留 `if(street)` 簡化版 fallback。街景裝飾應置於既有碰撞障礙或非行駛空間，新增實體限制須修改對應關卡碰撞資料並驗證教練路徑。

NS5 南向道路為依街景估算的十字路口補全；保留原公館路 12.43m、進場 76.63m、卸貨區 5.57m × 97.55m。店家、樓高、道路未丈量部分與紋理為參考 Excel 街景重建，並非測繪或直接貼入街景截圖。
