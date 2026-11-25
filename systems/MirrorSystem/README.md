# MirrorSystem — v6.0.0-alpha.P2-DEV (尚未正式驗收)

本目錄是第一個實際抽離的裝置核心，不是完整 MirrorSystem 成品。原始演算法來源為 RC35。原有四鏡攝影機、角度/儲存、快取、scene generation、更新節流及預覽節流移入 `mirror-system.js`。角度與快取是每個實例的私有狀態；沒有其他裝置的 DOM、全域事件或 RAF 依賴。

## API

`TruckMirrorSystem.createMirrorSystem({physics, clock, storage, createCanvas, getFrame, getRect, camera, renderView, paintView, onCapture, sceneName})`。Node 亦可 require 同一檔案。

- `settings()` 回傳獨立的設定副本；`setAngles(id, yaw, pitch)`、`resetAngles()`、`save()` 管理角度及原記憶鍵。
- `capture(objects, all, paint, force)` 使用 Host 提供的真實世界繪製服務；`invalidate()` 作廢原場景資料；`preview()` 保留原設定面板節流。
- `feed(id)`、`revision(id)`、`diagnostics()`、`capturePasses()` 提供場景及畫格對應資料。
- `storageOK()` 提供儲存狀態。

## 安裝狀態

`index.html` 內的相容性 adapter 把 RC35 的物理狀態、畫布世界渲染、2D 布局與現有車艙橋接轉成上述 API。`cabin/integration.js`、鏡片模型、其他控制項原碼完全未更動。原本的 2D 拖曳 UI、設定面板、3D CanvasTexture 消費及鏡框仍在 RC35 層，尚未抽離；亦尚無完整裝卸生命週期與獨立 WebGL 工作台。不可宣稱已完成整個 P2。

唯一維護的模組源碼為 `mirror-system.js`。為保留 file://，發布用 `index.html` 的 `data-v6-generated="MirrorSystem"` 由 `node tools/sync-mirror-source.cjs` 產生，`--check` 驗證一致性。其餘歷史內嵌來源尚未遷移。

## 測試

`node --test tests/v6-mirror*.test.cjs`。單元/行為對照測試使用注入的畫布服務，並非實際 WebGL；原版鏡面捕捉程式保留在 `tests/fixtures/v6/rc35-mirror-capture.txt` 只供對照，並非第二套正式實作。
