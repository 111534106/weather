# 🌗 深色/淺色模式切換功能實作計劃

## 功能概述

提供深色/淺色模式切換按鈕，讓使用者可以根據環境光線和個人偏好選擇介面主題。使用 localStorage 記住使用者的選擇。

## 目標使用者

- 🌙 夜間使用者（深色模式減少眼睛疲勞）
- ☀️ 白天使用者（淺色模式可能更清晰）
- 🎨 喜歡自訂介面的使用者
- 📱 行動裝置使用者（深色模式省電）

---

## 設計方案

### 選項 1: CSS 變數切換 ⭐⭐⭐⭐⭐ (推薦)

**優點**:
- ✅ 效能最佳
- ✅ 易於維護
- ✅ 平滑過渡動畫

**做法**:
```css
:root {
    --bg-dark: #0f172a;
    --text-primary: #f8fafc;
    /* 更多變數... */
}

[data-theme="light"] {
    --bg-dark: #ffffff;
    --text-primary: #1e293b;
    /* 重新定義所有變數 */
}
```

### 選項 2: 雙重樣式表

**優點**:
- ✅ 完全分離

**缺點**:
- ❌ 需要維護兩個 CSS 檔案
- ❌ 載入時間較長

**決定**: 使用選項 1 (CSS 變數切換)

---

## 實作計劃

### 階段 1: 定義顏色主題

#### 1.1 深色主題（現有）

```css
:root {
    /* Background */
    --bg-dark: #0f172a;
    --bg-card: rgba(255, 255, 255, 0.05);
    
    /* Text */
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    
    /* Accent */
    --accent-primary: #3b82f6;
    --accent-secondary: #8b5cf6;
    
    /* Status */
    --color-sunny: #f59e0b;
    --color-rainy: #0ea5e9;
    --color-cloudy: #64748b;
    --color-warning: #ef4444;
    
    /* Glass */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
}
```

#### 1.2 淺色主題（新增）

```css
[data-theme="light"] {
    /* Background */
    --bg-dark: #f8fafc;
    --bg-card: #ffffff;
    
    /* Text */
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    
    /* Accent */
    --accent-primary: #3b82f6;
    --accent-secondary: #8b5cf6;
    
    /* Status */
    --color-sunny: #f59e0b;
    --color-rainy: #0ea5e9;
    --color-cloudy: #64748b;
    --color-warning: #ef4444;
    
    /* Glass */
    --glass-bg: rgba(255, 255, 255, 0.8);
    --glass-border: rgba(0, 0, 0, 0.1);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
```

---

### 階段 2: UI 設計

#### 2.1 切換按鈕位置

**選項 A**: 右上角固定按鈕
**選項 B**: Header 右側
**選項 C**: Footer

**決定**: Header 右側（容易看到且不遮擋內容）

#### 2.2 按鈕樣式

```
┌─────────────────────────┐
│  TW Weather    🌙 / ☀️  │  ← Header
└─────────────────────────┘
```

按鈕設計：
- 深色模式下顯示 ☀️（點擊切換到淺色）
- 淺色模式下顯示 🌙（點擊切換到深色）
- 使用 toggle 動畫

---

### 階段 3: 實作步驟

#### Step 1: HTML 結構

**檔案**: `web/index.html`

在 Header 中加入切換按鈕：

```html
<header class="glass-header">
    <div class="logo">
        <i class="fa-solid fa-cloud-sun-rain"></i>
        <h1>TW Weather</h1>
    </div>
    <button id="theme-toggle" class="theme-toggle-btn" aria-label="切換主題">
        <i class="fa-solid fa-sun theme-icon"></i>
    </button>
    <p class="subtitle">全台 22 縣市即時氣象資訊</p>
</header>
```

#### Step 2: CSS 樣式

**檔案**: `web/style.css`

```css
/* Theme Toggle Button */
.glass-header {
    position: relative;
}

.theme-toggle-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.theme-icon {
    font-size: 1.5rem;
    color: var(--text-primary);
    transition: transform 0.3s ease;
}

.theme-toggle-btn:hover .theme-icon {
    transform: rotate(20deg);
}

/* Light Theme */
[data-theme="light"] {
    /* 所有顏色變數定義 */
}

[data-theme="light"] .bg-blobs {
    opacity: 0.3; /* 淺色模式下背景較淡 */
}

[data-theme="light"] .blob-1 {
    background: #3b82f6;
}

[data-theme="light"] .blob-2 {
    background: #8b5cf6;
}

[data-theme="light"] .blob-3 {
    background: #10b981;
}

/* Smooth transition */
* {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

#### Step 3: JavaScript 邏輯

**檔案**: `web/script.js`

```javascript
// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}
```

---

## 顏色對照表

### 深色模式（現有）
| 元素 | 顏色 | 說明 |
|------|------|------|
| 背景 | `#0f172a` | 深藍黑色 |
| 文字主色 | `#f8fafc` | 近白色 |
| 文字次色 | `#94a3b8` | 灰藍色 |

### 淺色模式（新增）
| 元素 | 顏色 | 說明 |
|------|------|------|
| 背景 | `#f8fafc` | 淺灰白色 |
| 文字主色 | `#1e293b` | 深藍灰色 |
| 文字次色 | `#64748b` | 中灰色 |

---

## 實作清單

### HTML
- [ ] 在 Header 加入切換按鈕
- [ ] 調整 Header 佈局（flex 或 grid）

### CSS
- [ ] 定義淺色主題變數
- [ ] 加入切換按鈕樣式
- [ ] 調整背景 blob 在淺色模式下的顯示
- [ ] 確保所有元素使用 CSS 變數

### JavaScript
- [ ] 實作主題切換邏輯
- [ ] 使用 localStorage 記憶選擇
- [ ] 更新圖標狀態

### 測試
- [ ] 測試深色→淺色切換
- [ ] 測試淺色→深色切換
- [ ] 測試重新載入頁面後主題保持
- [ ] 測試所有元件在兩種模式下的可讀性

---

## 預期效果

### 深色模式（預設）
- 背景：深藍黑色
- 文字：白色/淺灰色
- 適合：夜間使用、護眼

### 淺色模式
- 背景：淺灰白色
- 文字：深灰色
- 適合：白天使用、明亮環境

---

## 時程預估

- **規劃**: 15 分鐘 ✅
- **HTML**: 5 分鐘
- **CSS**: 15 分鐘
- **JavaScript**: 10 分鐘
- **測試**: 10 分鐘

**總計**: 約 55 分鐘

---

準備開始實作！🚀
