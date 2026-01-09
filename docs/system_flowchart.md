# 系統架構流程圖 (System Architecture Flowchart)

請使用 VS Code 的 **Markdown Preview** (Ctrl+Shift+V) 或 **Mermaid Preview** 來檢視下方的圖表。

```mermaid
graph TD
    %% 定義樣式
    classDef main fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef py fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef db fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef ext fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    %% 節點：使用者與前端
    User((👤 使用者)) -->|1. 點擊查詢| Frontend[🖥️ 前端網頁 index.html]
    
    %% 節點：後端入口
    Frontend -->|2. AJAX 請求| App[🚀 Flask 主程式 (app.py)]
    class App main

    %% 節點：外部與 API
    App -->|3. 呼叫| API[📡 API 模組 (weather_api.py)]
    class API py
    API -->|4. 抓取| CWA[☁️ 氣象署/環境部 API]
    class CWA ext
    CWA -->|5. 回傳 JSON| API
    API -->|6. 回傳整理後資料| App

    %% 節點：資料庫流程
    App -->|7. 紀錄| Logger[📝 紀錄模組 (data_logger.py)]
    class Logger py
    Logger -->|8. Insert| DB[(🗄️ SQLite 資料庫)]
    class DB db

    %% 節點：分析流程
    Frontend -.->|9. 請求統計圖| App
    App -.->|10. 呼叫| Analysis[📊 分析模組 (data_analysis.py)]
    class Analysis py
    Analysis -.->|11. 讀取| DB
    Analysis -.->|12. 計算平均| App

    %% 節點：背景監控
    Monitor[⚠️ 監控模組 (alert_monitor.py)] -.->|每 5 分鐘| CWA
    class Monitor py
    Monitor -.->|寫入警報| DB

    %% 節點：匯出
    User -.->|下載報表| App
    App -.->|呼叫| Exporter[📥 匯出模組 (data_exporter.py)]
    class Exporter py
    Exporter -.->|讀取| DB
    Exporter -->|回傳 .xlsx| User
```
