"""
極端天氣警報監控系統 (Feature #15)
背景執行緒定期檢查中央氣象署警報 (W-C0033-001)
"""

import threading
import time
import requests
import json
from weather_api import API_KEY

# 全域變數儲存最新警報
CURRENT_ALERTS = []
LAST_UPDATE_TIME = 0
MONITOR_THREAD = None
STOP_EVENT = threading.Event()

# 測試模式：強制產生假警報以供展示
TEST_MODE = False 

def fetch_alerts():
    """
    呼叫 CWA API 取得警報資料
    API: W-C0033-001 (天氣特報-各縣市)
    """
    global CURRENT_ALERTS, LAST_UPDATE_TIME
    
    if not API_KEY:
        print("[AlertMonitor] 無法啟動：找不到 API Key")
        return

    # 測試模式：模擬颱風警報
    if TEST_MODE:
        print("[AlertMonitor] 測試模式：生成模擬警報")
        CURRENT_ALERTS = [{
            "title": "海上陸上颱風警報",
            "type": "颱風",
            "color": "danger",
            "location": "全台各地",
            "description": "強烈颱風接近，請做好防颱準備。",
            "time": time.strftime("%Y-%m-%d %H:%M:%S")
        }]
        LAST_UPDATE_TIME = time.time()
        return

    url = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-001?Authorization={API_KEY}"
    
    try:
        response = requests.get(url, verify=False, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            print("[AlertMonitor] API 呼叫失敗")
            return

        records = data.get('records', {}).get('record', [])
        alerts = []
        
        for record in records:
            # 檢查是否有危害性天氣
            dataset_info = record.get('datasetDescription', '')
            location = record.get('location', [])
            
            # W-C0033-001 結構較複雜，通常 datasetDescription 會包含警報類型
            # 簡化處理：如果有 record，通常代表有特報
            
            hazard_content = record.get('contents', {}).get('content', {}).get('contentText', '')
            if not hazard_content:
                continue
                
            locations_str = "、".join([loc['locationName'] for loc in location])
            
            alerts.append({
                "title": record.get('datasetDescription', '天氣特報'),
                "type": "warning", 
                "color": "warning", # warning, danger
                "location": locations_str if len(locations_str) < 20 else "多個縣市",
                "description": hazard_content,
                "time": record.get('datasetInfo', {}).get('validTime', {}).get('startTime', time.strftime("%Y-%m-%d %H:%M"))
            })
            
        CURRENT_ALERTS = alerts
        LAST_UPDATE_TIME = time.time()
        print(f"[AlertMonitor] 警報更新完成，目前有 {len(alerts)} 則警報")
        
    except Exception as e:
        print(f"[AlertMonitor] 抓取錯誤: {e}")

def monitor_loop():
    """
    監控迴圈
    """
    print("[AlertMonitor] 背景監控服務已啟動")
    while not STOP_EVENT.is_set():
        fetch_alerts()
        # 每 1 小時 (3600秒) 檢查一次，開發期間縮短為 5 分鐘 (300秒)
        # 用 wait 這樣可以被立即中斷
        if STOP_EVENT.wait(300):
            break
    print("[AlertMonitor] 背景監控服務已停止")

def start_alert_monitor():
    """
    啟動監控執行緒
    """
    global MONITOR_THREAD
    if MONITOR_THREAD and MONITOR_THREAD.is_alive():
        return
        
    STOP_EVENT.clear()
    MONITOR_THREAD = threading.Thread(target=monitor_loop, daemon=True)
    MONITOR_THREAD.start()

def stop_alert_monitor():
    """
    停止監控
    """
    STOP_EVENT.set()

def get_current_alerts():
    """
    取得目前警報
    """
    return {
        "success": True,
        "alerts": CURRENT_ALERTS,
        "last_update": LAST_UPDATE_TIME
    }
