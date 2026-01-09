# 🌤️ TW Weather 氣象專案 - 程式碼導覽指引 (Developer Guide)

這份文件旨在幫助您（開發者/講者）深入理解這個專案的每個角落。無論是為了期末報告、功能演示，還是未來的維護，這份指引將是您的最佳地圖。

---

## 📂 1. 專案結構總覽 (Project Structure)
專案採用標準的 **前後端分離** (但同源部署) 架構：

```text
天氣/
├── backend/                  # 🧠【後端】負責邏輯運算、資料存取
│   ├── app.py                # 🔥 [核心] Flask 伺服器主程式
│   ├── data_logger.py        # 📝 [紀錄] 負責將查詢存入資料庫
│   └── db_manager.py         # 🛠️ [工具] CLI 管理工具 (CRUD)
│
├── web/                      # 🎨【前端】負責畫面呈現、用戶互動
│   ├── index.html            # 🖼️ [骨架] 網頁結構與版面
│   ├── style.css             # 🎨 [樣式] 視覺設計、毛玻璃特效
│   ├── script.js             # 🧠 [大腦] 主要互動邏輯 (查詢、語音)
│   └── favorites.js          # ⭐ [外掛] 我的最愛功能模組
│
└── weather_data.db           # 💾 [資料] SQLite 資料庫 (自動生成)
```

---

## 🐍 2. 後端模組解說 (Backend)

後端使用 **Python (Flask)** 撰寫，負責處理由前端發送過來的請求。

### 2.1 `backend/app.py` - 總指揮官
這是整個應用程式的入口點。
*   **啟動方式**：`python backend/app.py`
*   **核心功能**：
    *   **路由 `/`**: 當用戶訪問網址時，傳送 `index.html` 網頁。
    *   **API `/api/weather/<city>`**: 接收城市名稱，向外部氣象局 API 抓取資料，並呼叫 `data_logger` 存檔，最後回傳 JSON 給前端。
    *   **API `/api/stats/analysis`**: 從資料庫撈取歷史數據，計算平均溫、最高溫等統計資料。

### 2.2 `backend/data_logger.py` - 史官 (紀錄員)
負責跟資料庫 (`weather_data.db`) 打交道。
*   **核心函式**：
    *   `log_weather_query(...)`: 執行 `INSERT` SQL 指令，將溫度、濕度、AQI 等數據存起來。
    *   `get_query_history()`: 執行 `SELECT` SQL 指令，撈出歷史資料供圖表使用。
    *   **[CRUD] `delete_record(id)`**: 刪除特定 ID 的紀錄 (期末新增功能)。
    *   **[CRUD] `update_note(id, note)`**: 修改特定紀錄的備註 (期末新增功能)。

### 2.3 `backend/db_manager.py` - 後台管理工具
這是一個 **CLI (Command Line Interface)** 工具，讓您不用開網頁也能管理資料庫。
*   **用途**：給開發者或管理員使用，進行資料維護。
*   **功能選單**：
    1.  顯示資料庫統計
    2.  匯出資料 (CSV)
    3.  重置資料庫
    4.  查詢所有紀錄
    5.  **[CRUD] 刪除紀錄**
    6.  **[CRUD] 修改備註**

---

## 🌐 3. 前端模組解說 (Frontend)

前端使用 **HTML5 / CSS3 / Vanilla JavaScript**，強調高效能與現代化 UI。

### 3.1 `web/index.html` - 網頁骨架
定義了網頁的所有區塊。
*   **關鍵區域**：
    *   Header: 包含 Logo、翻譯按鈕、**我的最愛下拉選單**、主題切換。
    *   Search Section: 搜尋框、語音按鈕、自動定位按鈕。
    *   Weather Card: 顯示當前溫度、天氣圖示的主卡片。
    *   Radar Map: 嵌入整合的氣象雷達地圖。
    *   Chart Container: 顯示歷史趨勢圖表 (Chart.js)。

### 3.2 `web/style.css` - 視覺設計
負責所有「好看」的事情。
*   **關鍵技術**：
    *   **Glassmorphism (毛玻璃)**: 使用 `backdrop-filter: blur()` 創造模糊背景效果。
    *   **RWD (響應式設計)**: 使用 `@media` 查詢，確保手機版 (`max-width: 768px`) 版面自動調整。
    *   **CSS Variables**: 定義 `--glass-bg`, `--text-primary` 等變數，方便切換深色/淺色主題。
    *   **Animations**: 定義了天氣卡片浮入 (`fade-in`) 和背景光暈飄動 (`float`) 的動畫。

### 3.3 `web/script.js` - 互動邏輯核心
這是網頁的大腦，控制所有動態行為。
*   **核心函式**：
    *   `fetchWeather(city)`: **最重要的函式**。發送請求給後端，收到資料後更新所有 DOM 元素。**包含語音重置邏輯**。
    *   `speakWeather()`: 負責語音播報。包含智慧判斷 (檢查是否有資料、過濾 Emoji)。
    *   `selectCity(city)`: 當用戶點選建議或語音輸入時，自動填入並呼叫 `fetchWeather`。
    *   `btnLocate.onclick`: 處理 GPS 定位請求。

### 3.4 `web/favorites.js` - 我的最愛模組
(期末新增) 專門處理最愛功能的獨立檔案。
*   **技術特點**：
    *   **LocalStorage**: 使用瀏覽器儲存空間，即使關掉網頁，最愛名單也不會消失。
    *   **Modular**: 雖然寫在獨立檔案，但透過全域變數與 `script.js` 溝通。
*   **核心功能**：
    *   `addToFavorites(city)`: 新增城市 (含重複檢查、上限 10 筆限制)。
    *   `renderFavoritesList()`: 動態生成下拉選單的 HTML。
    *   `queryFavoriteCity(city)`: 連結到主程式的查詢功能。

---

## 🔄 4. 資料流動全景 (Data Flow)

當用戶執行一次查詢時，資料是如何流動的？

1.  **用戶動作**：在網頁輸入「台中」並按下搜尋。
2.  **前端請求** (`script.js`): `fetchWeather('台中')` 被觸發，透過 `fetch()` 發送 request 給後端。
3.  **後端路由** (`app.py`): 收到 `/api/weather/台中` 請求。
4.  **外部 API** (`app.py`): 後端向氣象局 OpenWeather/CWA 請求真實數據。
5.  **資料紀錄** (`data_logger.py`): 資料被寫入 `weather_data.db` (SQLite)，便於之後畫圖表。
6.  **回傳回應** (`app.py`): 將整理好的天氣資料打包成 JSON 格式回傳。
7.  **前端渲染** (`script.js`):
    *   解析 JSON。
    *   更新溫度 (`.temp-val`)、濕度、AQI 等 DOM 元素。
    *   更新 Chart.js 圖表數據。
    *   更新雷達圖中心點。
8.  **語音準備**: 若用戶點擊播報，`speakWeather()` 讀取當前畫面上的數據進行朗讀。

---

## ✨ 5. 期末專題亮點 (Key Features)

在報告時，您可以特別強調以下這些具有技術含量的功能：

*   **全端 CRUD 整合**：不僅有前端介面，後端與資料庫也完整實習了 Create/Read/Update/Delete 流程。
*   **智慧語音助理**：
    *   支援自然語言播報。
    *   **自動防呆機制** (查錯不報)。
    *   **智慧中斷機制** (查新城市自動切斷舊語音)。
*   **高效能前端**：
    *   CSS 硬體加速動畫。
    *   Local Storage 本地快取最愛名單。
    *   Chart.js 資料視覺化。
*   **現代化 UI/UX**：
    *   毛玻璃擬態設計 (Glassmorphism)。
    *   深色/淺色主題一鍵切換。

這份文件涵蓋了專案的所有技術細節，祝您報告順利！🚀
