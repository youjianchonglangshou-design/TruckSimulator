# TruckSimulator — GitHub Pages 版

版本：`v6.0.0-alpha.REBUILD-DEV.14`（部署候選版）

## GitHub Pages 部署（不需要建置）

1. 解壓縮完整 ZIP，將 `TruckSimulator-main/` **內部所有檔案及資料夾**上傳至目標 GitHub repository 的 `main` 分支根目錄；不要再套一層 `TruckSimulator-main/`。保留 `.nojekyll`（隱藏檔案）。
2. Repository → Settings → Pages → Build and deployment → Source 選擇 Deploy from a branch；Branch 選 `main`，資料夾選 `/ (root)`，Save。
3. 從 Pages 設定頁開啟 GitHub 顯示的正式網址（例如 `https://<帳號>.github.io/<repository>/`）。

- `index.html` 已生成；不需 npm install、伺服器端程式、Cloudflare Worker 或自行新增 GitHub Actions。
- 保留所有原有功能、檔名及相對路徑，包括 `stage/`、`cabin/`、`systems/`、`nico/`、`youtube-player/`。
- Three.js 仍使用原版固定 0.152.2 的三個 HTTPS CDN 來源，須有網路及 WebGL。YouTube 播放依原服務的連線、嵌入授權及瀏覽器政策；HTTPS Pages 不需要本機 BAT，初次播放仍可能需要使用者操作。
- 本機原有 BAT 與直接開啟 HTML 的方式仍保留；本機 YouTube 播放請使用原 BAT。
- 保留原始碼、測試及開發工具。正式完整驗收的既有阻擋機制未變更。
- 公開部署前請確認有權公開專案中的真人影像與其他素材；Pages 上的靜態素材可被訪客取得。

本次僅部署準備與版本更新；尚未實際推送至 GitHub，詳細驗收見 `docs/QA_pages/REPORT.md`。
