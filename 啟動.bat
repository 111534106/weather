@echo off
chcp 65001 > nul
echo ==========================================
echo       正在啟動 TW Weather 天氣 App
echo ==========================================

echo [1/3] 正在檢查並安裝必要套件 (Flask, Requests)...
python -m pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [錯誤] 套件安裝失敗，請檢查網路連線或 Python 設定。
    pause
    exit /b
)

echo [2/3] 套件準備完成，正在開啟瀏覽器...
start http://127.0.0.1:5000

echo [3/3] 正在啟動後端伺服器...
echo 請勿關閉此視窗，否則網站將無法運作。
cd backend
python app.py

pause
