import requests
import json
import configparser
import os

def get_api_key():
    """
    從 config.ini 讀取 CWA API Key
    """
    config = configparser.ConfigParser()
    if not config.read("config.ini"):
        return None, "錯誤：找不到 config.ini 檔案。"
    
    if 'cwa' not in config or 'api_key' not in config['cwa']:
        return None, "錯誤：config.ini 檔案中找不到 [cwa] 或 api_key。"
        
    return config['cwa']['api_key'], None

# --- 參數設定 ---
API_KEY, error_msg = get_api_key()
if error_msg:
    print(error_msg)

def get_weather(city_name):
    """
    查詢指定城市的天氣資料 (使用 CWA API F-C0032-001)
    """
    if not API_KEY:
        return None, "錯誤：無法讀取 API Key，請檢查 config.ini 檔案。"

    url = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization={API_KEY}&locationName={city_name}"
    print(f"正在查詢 {city_name} 的天氣資料 (CWA)...")

    data = {} # 確保 data 在 try 外部被定義
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()

        if not data.get("success"):
            raise ValueError("CWA API 回應失敗 (success=false)。")

        location = data['records']['location'][0]
        weather_elements = location['weatherElement']

        def find_element(name):
            return next(item for item in weather_elements if item["elementName"] == name)

        # 提取第一個時間點的預報資料
        weather_state = find_element('Wx')['time'][0]['parameter']['parameterName']
        weather_code = find_element('Wx')['time'][0]['parameter']['parameterValue']
        # 使用 MaxT (最高溫度) 作為代表溫度
        temp = find_element('MaxT')['time'][0]['parameter']['parameterName']
        pop = find_element('PoP')['time'][0]['parameter']['parameterName']

        return {
            "weather_state": weather_state,
            "weather_code": weather_code,
            "temp": temp,
            "pop": pop
        }, None

    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError, StopIteration) as e:
        # 建立日誌資料夾
        log_dir = "error_logs"
        os.makedirs(log_dir, exist_ok=True)
        
        # 定義日誌檔案路徑
        log_filename = os.path.join(log_dir, f"cwa_api_error_{city_name}.json")
        
        # 寫入日誌檔案
        with open(log_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"API 回應已寫入錯誤日誌: {log_filename}")
        return None, f"處理 API 資料時發生錯誤: {e}"

if __name__ == '__main__':
    if not API_KEY:
        print("無法執行測試，因為未設定 API Key。")
    else:
        city = "臺北市"
        weather_data, error = get_weather(city)

        if weather_data:
            print("\n--- CWA API 資料抓取成功 ---")
            print(json.dumps(weather_data, indent=4, ensure_ascii=False))

        if error:
            print(f"\n錯誤: {error}")
