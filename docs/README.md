# 🌤️ TW Weather - 台灣天氣查詢系統

完整的台灣天氣查詢網頁應用，提供即時天氣資訊和 7 天預報。

## 📁 專案結構

```
天氣/
├── api/                    # API 相關程式碼
│   ├── weather_api.py     # 中央氣象署 API 串接
│   └── config.ini         # API Key 設定（不納入版本控制）
│
├── backend/               # Flask 後端伺服器
│   ├── app.py            # Flask 應用主程式
│   ├── config.ini        # 後端設定檔（不納入版本控制）
│   └── error_logs/       # API 錯誤日誌
│
├── web/                   # 前端檔案
│   ├── index.html        # 主頁面
│   ├── script.js         # JavaScript 邏輯
│   └── style.css         # 樣式表
│
├── docs/                  # 文檔資料
│   ├── future_features.md # 功能規劃
│   ├── project_details.md # 專案詳細說明
│   └── ai/               # AI 輔助開發相關文件
│
├── tests/                 # 測試檔案和測試資料
│   └── response*.json    # API 回應測試資料
│
├── requirements.txt       # Python 套件依賴
├── .gitignore            # Git 忽略規則
├── 啟動.bat              # Windows 快速啟動腳本
└── 注意事項.md           # 使用注意事項
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
pip install -r requirements.txt
```

### 2. 設定 API Key

在 `api/` 和 `backend/` 資料夾中建立 `config.ini`：

```ini
[cwa]
api_key = YOUR_CWA_API_KEY_HERE
```

> 📝 取得 API Key：前往 [中央氣象署開放資料平台](https://opendata.cwa.gov.tw/) 註冊

### 3. 啟動服務

**方法一：使用批次檔（Windows）**
```bash
啟動.bat
```

**方法二：手動啟動**
```bash
cd backend
python app.py
```

### 4. 開啟瀏覽器

訪問：`http://127.0.0.1:5000`

## ✨ 功能特色

### ✅ 已實作功能

1. **📍 自動定位功能**
   - 使用瀏覽器地理位置 API
   - 自動選擇最近的縣市

2. **📅 7 天天氣預報**
   - 完整 14 個時段（7天 x 早晚）
   - 顯示星期幾標籤
   - 白天/夜晚時段區分
   - 天氣圖標視覺化

3. **🗺️ 全台溫度分布圖**
   - Chart.js 互動圖表
   - 22 縣市同時顯示
   - 顏色編碼（熱/溫暖/涼爽）

4. **💡 生活建議**
   - 根據溫度和降雨機率
   - 穿衣、攜帶雨具建議

### 🔄 資料快取

- In-Memory 快取機制
- TTL：10 分鐘
- 減少 API 請求次數

### 🎨 設計特色

- 🌗 深色主題（Glassmorphism 設計）
- 📱 響應式佈局
- 🎭 平滑動畫效果
- 🎨 動態背景動畫

## 🔧 技術棧

- **後端**: Python 3.x + Flask
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **圖表**: Chart.js
- **API**: 中央氣象署開放資料 API
  - F-C0032-001（36 小時預報）
  - F-D0047-091（7 天預報）

## 📝 開發筆記

### API 使用

- **36 小時預報**: `F-C0032-001`（回傳 3 個時段）
- **7 天預報**: `F-D0047-091`（回傳 14 個時段）✅ 主要使用
- **Fallback 機制**: 7 天失敗時自動降級到 36 小時

### 天氣代碼對應

- 一位數代碼：36 小時預報 API（1-18）
- 兩位數代碼：7 天預報 API（01-42）

## 🎯 待開發功能

詳見 [docs/future_features.md](docs/future_features.md)

- 空氣品質監測（AQI）
- 日出日落時間
- 極端天氣推播
- 穿搭小幫手 2.0
- 雷達回波圖
- PWA 支援
- 深色/淺色模式切換
- 語音播報

## 📄 授權

此專案僅供學習和個人使用。

## 🙏 致謝

- 資料來源：[中央氣象署（CWA）](https://www.cwa.gov.tw/)
- 字型：Google Fonts (Inter, Noto Sans TC)
- 圖示：Font Awesome

---

最後更新：2025-12-06
