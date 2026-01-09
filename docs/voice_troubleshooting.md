# 語音播報故障排除指南

## 問題：按播放按鈕沒有聲音

### 可能原因與解決方案

#### 1. 瀏覽器快取問題 ⭐⭐⭐⭐⭐ (最常見)

**解決方式**：
- 按 `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac) 強制重新載入
- 或按 `Ctrl + F5` 清除快取並重新載入

#### 2. JavaScript 錯誤

**檢查方式**：
1. 按 `F12` 打開開發者工具
2. 切換到 `Console` (控制台) 標籤
3. 查看是否有紅色錯誤訊息

**常見錯誤**：
- `formatDateForSpeech is not defined` → 函數未正確定義
- `Speech synthesis not supported` → 瀏覽器不支援

#### 3. 瀏覽器權限問題

**解決方式**：
- 確認瀏覽器允許語音合成
- 某些瀏覽器需要用戶互動才能播放語音

#### 4. 語音引擎未就緒

**解決方式**：
- 重新整理頁面
- 等待幾秒後再試

#### 5. 尚未查詢天氣

**檢查**：
- 確認已經點擊「查詢天氣」
- 確認有顯示生活建議內容

---

## 快速測試步驟

1. **強制重新載入**: `Ctrl + Shift + R`
2. **查詢天氣**: 選擇城市 → 點擊「查詢天氣」
3. **等待載入完成**: 確認顯示預報資料
4. **點擊語音按鈕**: 生活建議卡片右上角的 🔊
5. **檢查控制台**: 按 `F12` 查看是否有錯誤

---

## 開發者檢查清單

### 檢查 1：函數是否存在

打開控制台輸入：
```javascript
console.log(typeof formatDateForSpeech);
console.log(typeof formatTempForSpeech);
console.log(typeof convertNumberToChinese);
```

應該都顯示 `function`

### 檢查 2：語音API是否支援

```javascript
console.log('speechSynthesis' in window);
```

應該顯示 `true`

### 檢查 3：手動測試語音

```javascript
const utterance = new SpeechSynthesisUtterance('測試');
utterance.lang = 'zh-TW';
speechSynthesis.speak(utterance);
```

應該聽到「測試」

---

## 如果仍然沒聲音

### 方案 A：回復到簡單版本

暫時移除日期和溫度格式化，直接播報原始文本：

在 `speakWeather()` 函數中：
```javascript
// 暫時註解掉
// const dateForSpeech = formatDateForSpeech(dateText);
// const tempForSpeech = formatTempForSpeech(temp);

// 改用原始資料
text += `${dateText}，${period}，${weather}，溫度${temp}。`;
```

### 方案 B：檢查是否有語法錯誤

查看檔案 `script.js` 第 613-636 行的 `convertNumberToChinese` 函數

確認：
- 所有括號都有配對 `{}`
- 沒有遺漏分號 `;`
- 函數有正確的 `return`

---

## 最近的修改

### 修改 1：日期格式化 (第 613-636 行)
```javascript
function convertNumberToChinese(num) {
    // Remove leading zeros
    const numValue = parseInt(num);
    // ...
}
```

### 修改 2：預報內容格式化 (第 520-524 行)
```javascript
const dateForSpeech = formatDateForSpeech(dateText);
const tempForSpeech = formatTempForSpeech(temp);
```

**如果這兩個修改導致錯誤，可能是**：
- `formatDateForSpeech` 或 `formatTempForSpeech` 未定義
- 函數內部有錯誤導致例外

---

## 緊急修復

如果需要快速恢復功能，可以暫時刪除或註解掉格式化：

**在 line 522-523**：
```javascript
// const dateForSpeech = formatDateForSpeech(dateText);
// const tempForSpeech = formatTempForSpeech(temp);
text += `${dateText}，${period}，${weather}，溫度${temp}。`;
```

這樣至少可以播報，雖然會念「十二斜線零六」

---

建立時間：2025-12-06
