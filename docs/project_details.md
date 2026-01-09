# 專案技術與資料處理說明 (Project Technology & Data Processing)

## 1. 模組與技術 (Modules & Technologies)

### 使用模組/技術：
*   **後端語言**: Python 3
*   **網頁框架**: Flask
*   **HTTP 請求**: Requests
*   **前端技術**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
*   **資料視覺化**: Chart.js
*   **圖示庫**: FontAwesome
*   **資料來源**: 中央氣象署 (CWA) Open Data API

### 技術選擇理由與應用方式：

#### **1. Flask (Python Web Framework)**
*   **理由**: 輕量級、架構簡單、啟動速度快，非常適合用於本專案這類型的中小型應用。
*   **應用方式**: 
    *   擔任 **Web Server**：負責提供靜態網頁 (HTML/CSS/JS) 給使用者。
    *   擔任 **API Proxy (代理)**：前端無法直接呼叫氣象局 API (會有 CORS 跨域問題)，因此由 Flask 在後端代為抓取資料，再轉傳給前端。

#### **2. Chart.js**
*   **理由**: 開源、輕量且支援響應式設計 (RWD) 的 JavaScript 圖表庫，能輕鬆製作出美觀的互動式圖表。
*   **應用方式**: 
    *   用於「全台溫度分佈圖」。
    *   我們實作了**動態顏色邏輯**：高溫顯示紅色、舒適顯示橘色、低溫顯示藍色，讓使用者一眼就能看出全台氣溫差異。

#### **3. Requests**
*   **理由**: Python 生態系中最人性化、最易於使用的 HTTP 函式庫。
*   **應用方式**: 用於後端 `weather_api.py` 中，負責處理與中央氣象署伺服器的連線、發送 API Key 驗證、以及接收回傳的 JSON 資料。

---

## 2. 資料處理 (Data Processing)

### 資料處理方式：

#### **步驟一：資料擷取 (Fetching)**
*   系統透過後端 API (`/api/weather/...`) 接收前端請求。
*   檢查 **記憶體快取 (In-Memory Cache)**：
    *   **有快取且未過期 (10分鐘內)**：直接回傳舊資料，**不消耗** 氣象局 API 額度，速度極快。
    *   **無快取或已過期**：使用 `requests` 向氣象局 API (`F-C0032-001`) 發送 GET 請求。

#### **步驟二：資料清洗與轉換 (Cleaning & Parsing)**
*   氣象局回傳的原始資料是極為複雜的巢狀 JSON 結構。
*   我們在 `weather_api.py` 中撰寫了邏輯，提取出關鍵資訊：
    *   `Wx`: 天氣現象 (如：多雲、短暫雨)
    *   `PoP`: 降雨機率 (如：30%)
    *   `MinT` / `MaxT`: 最低/最高氣溫
*   將這些分散的數據重新組合成**扁平化**的格式 (List of Dictionaries)，方便前端使用。

#### **步驟三：前端渲染 (Rendering)**
*   前端 JavaScript 接收到清洗後的 JSON 資料。
*   **列表渲染**：使用 DOM 操作 (`document.createElement`) 動態產生未來 36 小時的天氣卡片。
*   **圖表渲染**：將全台縣市的溫度數據提取為陣列，餵給 Chart.js 繪製長條圖。
