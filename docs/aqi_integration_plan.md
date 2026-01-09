# 😷 空氣品質監測 (AQI Integration) 實作計劃

## 功能概述

整合環境部（原環保署）空氣品質開放資料 API，在天氣查詢結果中顯示即時的空氣品質指標 (AQI)、PM2.5 數值及空氣品質等級，讓使用者能做出更好的戶外活動決策。

## 目標使用者

- 🤧 過敏族群
- 🏃 戶外運動愛好者
- 👶 有幼兒的家長
- 🚴 騎車通勤族
- 📸 攝影師（能見度評估）

---

## 技術方案

### API 選擇

**環境部環境資料開放平臺**
- **API**: 空氣品質指標(AQI)
- **網址**: https://data.moenv.gov.tw/
- **資料集 ID**: 需查詢（通常是 AQI 或類似名稱）
- **格式**: JSON
- **更新頻率**: 每小時更新
- **需要 API Key**: ✅ 是（免費註冊）

### 資料內容

API 提供的主要欄位：
- `SiteName`: 測站名稱
- `County`: 縣市
- `AQI`: 空氣品質指標 (0-500)
- `Status`: 空氣品質等級（良好、普通、對敏感族群不健康等）
- `PM2.5`: PM2.5 濃度 (μg/m³)
- `PM10`: PM10 濃度
- `O3`: 臭氧濃度
- `PublishTime`: 發布時間

---

## 實作計劃

### 階段 1: 後端整合 API

#### 1.1 配置 API Key

**檔案**: `backend/config.ini` 和 `api/config.ini`

```ini
[moenv]
api_key = YOUR_MOENV_API_KEY
```

#### 1.2 建立 AQI API 函數

**檔案**: `api/aqi_api.py` (新增)

```python
import requests
import configparser

def get_aqi_data(city):
    """
    查詢指定縣市的空氣品質資料
    參數:
        city: 縣市名稱（如：臺北市）
    回傳:
        (aqi_data, error)
    """
    # 讀取 API Key
    # 呼叫環保署 API
    # 過濾出該縣市的測站資料
    # 取平均值或選擇代表性測站
    pass
```

#### 1.3 整合到 Flask

**檔案**: `backend/app.py`

```python
from aqi_api import get_aqi_data

@app.route('/api/aqi/<city>')
def api_get_aqi(city):
    data, error = get_aqi_data(city)
    if error:
        return jsonify({'success': False, 'error': error}), 500
    return jsonify({'success': True, 'data': data})
```

---

### 階段 2: 前端顯示

#### 2.1 UI 設計

**位置**: 天文資訊卡片下方

```
┌─────────────────────────────────┐
│  🌬️ 空氣品質                    │
├─────────────────────────────────┤
│  AQI: 42  【良好】              │
│  PM2.5: 12 μg/m³                │
│  建議: 適合所有戶外活動          │
└─────────────────────────────────┘
```

#### 2.2 AQI 等級顏色編碼

根據環保署標準：

| AQI 值 | 等級 | 顏色 | 說明 |
|--------|------|------|------|
| 0-50 | 良好 | 🟢 綠色 | 空氣品質良好 |
| 51-100 | 普通 | 🟡 黃色 | 敏感族群注意 |
| 101-150 | 對敏感族群不健康 | 🟠 橘色 | 減少戶外活動 |
| 151-200 | 對所有族群不健康 | 🔴 紅色 | 避免戶外活動 |
| 201-300 | 非常不健康 | 🟣 紫色 | 所有人應避免戶外活動 |
| 301+ | 危害 | 🟤 褐紅色 | 緊急狀態 |

#### 2.3 HTML 結構

**檔案**: `web/index.html`

```html
<!-- AQI Info Card -->
<div class="aqi-info-card glass-card">
    <div class="aqi-header">
        <i class="fa-solid fa-wind"></i>
        <h3>空氣品質</h3>
    </div>
    <div class="aqi-content">
        <div class="aqi-main">
            <div class="aqi-value" id="aqi-value">--</div>
            <div class="aqi-status" id="aqi-status">--</div>
        </div>
        <div class="aqi-details">
            <div class="aqi-detail-item">
                <span class="label">PM2.5</span>
                <span class="value" id="pm25-value">--</span>
            </div>
        </div>
        <div class="aqi-advice" id="aqi-advice">查詢中...</div>
    </div>
</div>
```

#### 2.4 JavaScript 邏輯

**檔案**: `web/script.js`

```javascript
async function updateAQI(city) {
    try {
        const response = await fetch(`/api/aqi/${encodeURIComponent(city)}`);
        const result = await response.json();
        
        if (result.success) {
            const { aqi, status, pm25, advice } = result.data;
            
            // 更新顯示
            document.getElementById('aqi-value').textContent = aqi;
            document.getElementById('aqi-status').textContent = status;
            document.getElementById('pm25-value').textContent = `${pm25} μg/m³`;
            document.getElementById('aqi-advice').textContent = advice;
            
            // 根據 AQI 值設定顏色
            const color = getAQIColor(aqi);
            document.querySelector('.aqi-value').style.color = color;
        }
    } catch (error) {
        console.error('AQI 查詢失敗:', error);
    }
}

function getAQIColor(aqi) {
    if (aqi <= 50) return '#10b981'; // 綠色
    if (aqi <= 100) return '#f59e0b'; // 黃色
    if (aqi <= 150) return '#f97316'; // 橘色
    if (aqi <= 200) return '#ef4444'; // 紅色
    if (aqi <= 300) return '#a855f7'; // 紫色
    return '#b91c1c'; // 褐紅色
}
```

---

### 階段 3: CSS 樣式

**檔案**: `web/style.css`

```css
.aqi-info-card {
    padding: 25px;
    margin-bottom: 25px;
}

.aqi-main {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 15px;
}

.aqi-value {
    font-size: 3rem;
    font-weight: 800;
    /* 顏色由 JavaScript 動態設定 */
}

.aqi-status {
    font-size: 1.2rem;
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
}

.aqi-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.aqi-advice {
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    font-size: 0.95rem;
    color: var(--text-secondary);
}
```

---

## 實作步驟

### Step 1: 註冊 API Key
- [ ] 前往環境部環境資料開放平臺註冊
- [ ] 取得 API Key
- [ ] 加入 config.ini

### Step 2: 後端開發
- [ ] 建立 `api/aqi_api.py`
- [ ] 實作 `get_aqi_data()` 函數
- [ ] 在 `backend/app.py` 加入路由
- [ ] 測試 API 回應

### Step 3: 前端開發
- [ ] 在 `index.html` 加入 AQI 卡片
- [ ] 在 `script.js` 加入 `updateAQI()` 函數
- [ ] 整合到查詢流程
- [ ] 加入 CSS 樣式

### Step 4: 測試
- [ ] 測試不同縣市
- [ ] 測試不同 AQI 值的顏色
- [ ] 測試錯誤處理

---

## 注意事項

### API 限制

1. **需要 API Key**: 
   - 必須先註冊環境部帳號
   - 可能有請求次數限制

2. **資料更新頻率**:
   - 每小時更新一次
   - 需要實作快取機制

3. **測站選擇**:
   - 一個縣市可能有多個測站
   - 需選擇代表性測站或計算平均值

### 技術挑戰

1. **API Key 管理**:
   - 不可提交到 Git
   - 需加入 .gitignore

2. **資料對應**:
   - 縣市名稱需與環保署API一致
   - 處理找不到測站的情況

3. **快取策略**:
   - AQI 資料變化不快
   - 建議快取 30-60 分鐘

---

## 預期效果

查詢台北市天氣後，顯示：

```
🌬️ 空氣品質

AQI: 42  【良好】
PM2.5: 12 μg/m³

💡 空氣品質良好，適合所有戶外活動
```

---

## 替代方案

如果環保署 API 申請困難，可使用：

### 方案 A: 
