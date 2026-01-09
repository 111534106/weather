# 🗣️ 語音播報天氣功能實作計劃

## 功能概述

使用瀏覽器內建的 **Web Speech API**，將當前天氣資訊、預報和生活建議轉換為語音播報，方便開車族、視力不便者或需要多工處理的使用者。

## 目標使用者

- 🚗 開車族（雙手不方便看螢幕）
- 👀 視力不便者
- 🏃 正在運動的使用者
- 👨‍💼 多工處理的上班族
- 📱 想要語音助理體驗的使用者

---

## 技術方案

### Web Speech API

**Speech Synthesis API** (文字轉語音)

**瀏覽器支援**:
- ✅ Chrome / Edge (最佳)
- ✅ Safari
- ✅ Firefox
- ⚠️ 需 HTTPS 或 localhost

**基本用法**:
```javascript
const utterance = new SpeechSynthesisUtterance("天氣晴朗");
utterance.lang = 'zh-TW'; // 繁體中文
utterance.rate = 1.0; // 速度
utterance.pitch = 1.0; // 音調
speechSynthesis.speak(utterance);
```

---

## 實作計劃

### 階段 1: UI 設計

#### 按鈕位置
在生活建議卡片右上角加入語音播報按鈕

```
┌─────────────────────────────────┐
│  💡 生活建議           🔊       │
├─────────────────────────────────┤
│  天氣舒適，適合出遊              │
└─────────────────────────────────┘
```

#### 按鈕狀態
- **未播放**: 🔊 圖標，灰色
- **播放中**: 🔊 圖標，藍色，脈動動畫
- **已播放**: ✓ 圖標，綠色

---

### 階段 2: 語音內容設計

#### 播報內容範例

```
[城市名稱] 的天氣資訊：

目前天氣狀況：晴時多雲，
溫度範圍：攝氏 17 度到 23 度，
降雨機率：10%。

日出時間：早上 6 點 23 分，
日落時間：下午 5 點 15 分。

生活建議：天氣舒適，適合出遊。

未來三天預報：
明天，12月7日，週六，白天，晴時多雲，溫度 16 到 20 度。
明天，12月7日，週六，夜晚，多雲時晴，溫度 15 到 17 度。
後天，12月8日，週日，白天，陰時多雲，溫度 15 到 18 度。

播報完畢。
```

---

### 階段 3: 實作步驟

#### Step 1: HTML 結構

**檔案**: `web/index.html`

在生活建議卡片中加入語音按鈕：

```html
<div class="advice-card glass-card highlight">
    <div class="advice-icon">
        <i class="fa-regular fa-lightbulb"></i>
    </div>
    <div class="advice-content">
        <h3>生活建議</h3>
        <p id="advice-text">--</p>
    </div>
    <button id="voice-btn" class="voice-btn" title="語音播報天氣">
        <i class="fa-solid fa-volume-high"></i>
    </button>
</div>
```

#### Step 2: CSS 樣式

**檔案**: `web/style.css`

```css
.advice-card {
    position: relative;
}

.voice-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: var(--text-secondary);
}

.voice-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    color: var(--accent-primary);
    transform: scale(1.1);
}

.voice-btn.speaking {
    background: var(--accent-primary);
    color: white;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

.voice-btn i {
    font-size: 1.2rem;
}
```

#### Step 3: JavaScript 邏輯

**檔案**: `web/script.js`

```javascript
const voiceBtn = document.getElementById('voice-btn');
let currentUtterance = null;

// Check if Speech Synthesis is supported
if ('speechSynthesis' in window) {
    voiceBtn.addEventListener('click', toggleSpeech);
} else {
    voiceBtn.disabled = true;
    voiceBtn.title = '您的瀏覽器不支援語音播報';
}

function toggleSpeech() {
    if (speechSynthesis.speaking) {
        // Stop speaking
        speechSynthesis.cancel();
        voiceBtn.classList.remove('speaking');
    } else {
        // Start speaking
        speakWeather();
    }
}

function speakWeather() {
    const city = citySelect.value;
    
    // Build speech text
    let text = `${city}的天氣資訊。`;
    
    // Add current weather
    const advice = adviceText.textContent;
    if (advice && advice !== '--') {
        text += `生活建議：${advice}。`;
    }
    
    // Add sun times
    const sunrise = sunriseTime.textContent;
    const sunset = sunsetTime.textContent;
    if (sunrise !== '--:--') {
        text += `日出時間：${formatTimeForSpeech(sunrise)}，`;
        text += `日落時間：${formatTimeForSpeech(sunset)}。`;
    }
    
    // Add forecast (first 3 periods)
    text += `未來預報：`;
    const forecastCards = document.querySelectorAll('.forecast-card');
    Array.from(forecastCards).slice(0, 3).forEach((card, index) => {
        const date = card.querySelector('.forecast-date').textContent;
        const period = card.querySelector('.forecast-time').textContent;
        const weather = card.querySelector('.forecast-weather').textContent;
        const temp = card.querySelector('.forecast-temp').textContent;
        
        text += `${date}，${period}，${weather}，溫度${temp}。`;
    });
    
    text += '播報完畢。';
    
    // Create and configure utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'zh-TW';
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
    
    // Event handlers
    currentUtterance.onstart = () => {
        voiceBtn.classList.add('speaking');
    };
    
    currentUtterance.onend = () => {
        voiceBtn.classList.remove('speaking');
    };
    
    currentUtterance.onerror = (event) => {
        console.error('Speech error:', event);
        voiceBtn.classList.remove('speaking');
        updateStatus('語音播報失敗', 'error');
    };
    
    // Speak
    speechSynthesis.speak(currentUtterance);
}

function formatTimeForSpeech(time) {
    // Convert "06:23" to "早上6點23分" or "下午5點15分"
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours < 12 ? '早上' : (hours < 18 ? '下午' : '晚上');
    const hour12 = hours > 12 ? hours - 12 : hours;
    return `${period}${hour12}點${minutes}分`;
}
```

---

## 功能特色

### 1. 智能播報
- ✅ 自動組合天氣資訊
- ✅ 包含生活建議
- ✅ 包含日出日落時間
- ✅ 包含未來預報（前3個時段）

### 2. 使用者控制
- ✅ 點擊開始播報
- ✅ 再次點擊停止播報
- ✅ 視覺回饋（脈動動畫）

### 3. 錯誤處理
- ✅ 檢查瀏覽器支援
- ✅ 播報失敗提示
- ✅ 優雅降級

---

## 瀏覽器支援

| 瀏覽器 | 支援度 | 語音品質 |
|--------|--------|----------|
| Chrome | ✅ 完整支援 | ⭐⭐⭐⭐⭐ |
| Edge | ✅ 完整支援 | ⭐⭐⭐⭐⭐ |
| Safari | ✅ 支援 | ⭐⭐⭐⭐ |
| Firefox | ✅ 支援 | ⭐⭐⭐ |
| IE | ❌ 不支援 | - |

---

## 實作清單

### HTML
- [ ] 在生活建議卡片加入語音按鈕

### CSS
- [ ] 語音按鈕基本樣式
- [ ] Hover 效果
- [ ] 播放中動畫（脈動）

### JavaScript
- [ ] 檢查瀏覽器支援
- [ ] 實作 `speakWeather()` 函數
- [ ] 實作 `toggleSpeech()` 切換
- [ ] 實作 `formatTimeForSpeech()` 時間格式化
- [ ] 加入事件監聽器
- [ ] 狀態管理（播放/停止）

### 測試
- [ ] 測試播報內容完整性
- [ ] 測試開始/停止控制
- [ ] 測試不同瀏覽器
- [ ] 測試錯誤處理

---

## 進階功能（可選）

### 1. 語音設定
- [ ] 調整播報速度（慢、正常、快）
- [ ] 選擇語音（男聲/女聲）
- [ ] 音量控制

### 2. 播報選項
- [ ] 只播報今日天氣
- [ ] 只播報預報
- [ ] 完整播報

### 3. 快捷鍵
- [ ] 按空白鍵播報
- [ ] ESC 鍵停止

---

## 時程預估

- **規劃**: 10 分鐘 ✅
- **HTML**: 3 分鐘
- **CSS**: 7 分鐘
- **JavaScript**: 15 分鐘
- **測試**: 5 分鐘

**總計**: 約 40 分鐘

---

準備開始實作！🎙️
