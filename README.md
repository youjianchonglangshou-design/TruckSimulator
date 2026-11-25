# TruckSimulator — GitHub Pages 版

版本：`v6.0.0-alpha.REBUILD-DEV.16-RC5`（手機獨立架構開發候選；非正式驗收版）

## GitHub Pages 部署（不需要建置）

1. 解壓縮完整 ZIP，將 `TruckSimulator-main/` **內部所有檔案及資料夾**上傳至目標 GitHub repository 的 `main` 分支根目錄；不要再套一層 `TruckSimulator-main/`。保留 `.nojekyll`（隱藏檔案）。
2. Repository → Settings → Pages → Build and deployment → Source 選擇 Deploy from a branch；Branch 選 `main`，資料夾選 `/ (root)`，Save。
3. 從 Pages 設定頁開啟 GitHub 顯示的正式網址（例如 `https://<帳號>.github.io/<repository>/`）。

- `index.html` 為裝置路由，`desktop.html` 為原桌機流程，`mobile/index.html` 為手機流程。由同一模板生成；可用 `?device=mobile` 或 `?device=desktop` 測試分流。三個入口與 `mobile/` 都必須完整部署。
- 入口已生成；不需 npm install、伺服器端程式、Cloudflare Worker 或自行新增 GitHub Actions。
- 保留所有原有功能、檔名及相對路徑，包括 `stage/`、`cabin/`、`systems/`、`nico/`、`youtube-player/`。
- Three.js 仍使用原版固定 0.152.2 的三個 HTTPS CDN 來源，須有網路及 WebGL。YouTube 播放依原服務的連線、嵌入授權及瀏覽器政策；HTTPS Pages 不需要本機 BAT，初次播放仍可能需要使用者操作。
- 本機原有 BAT 與直接開啟 HTML 的方式仍保留；本機 YouTube 播放請使用原 BAT。
- 保留原始碼、測試及開發工具。正式完整驗收的既有阻擋機制未變更。
- 公開部署前請確認有權公開專案中的真人影像與其他素材；Pages 上的靜態素材可被訪客取得。

本次僅部署準備與版本更新；尚未實際推送至 GitHub，詳細驗收見 `docs/QA_pages/REPORT.md`。

## DEV.16-RC2 驗收狀態

本版為開發候選，完整 WebGL、OPPO 實體手機及 YouTube 線上播放尚未驗收，不可視為正式發布。詳見 `docs/QA_dev16/REPORT.md` 與 `MIGRATION.md`。未執行 GitHub 上傳。

## RC2 覆蓋更新

手機小方塊調鏡介面、設定與選關卡片、車門與雷達 3D 尺寸、YouTube 與手煞車透明感應、兩端手煞車操作警示。RC2 僅為待完整 WebGL 與實機驗收的修正候選，不宣稱正式發布。

## RC4
修正發布入口內嵌版本不一致、重來按鈕顏色、手機雷達深度與尺寸、手機頂部 HUD。恢復 RC2 手機車門模型大小及設定/選關樣式。完整 WebGL 與實機驗收仍未完成。
