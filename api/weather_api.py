import requests
import json
import configparser
import os
import urllib3

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_api_key():
    """
    從 config.ini 讀取 CWA API Key
    """
    config = configparser.ConfigParser()
    
    # Try different paths
    paths = [
        "config.ini",
        "../backend/config.ini",
        os.path.join(os.path.dirname(__file__), "../backend/config.ini"),
        os.path.join(os.path.dirname(__file__), "config.ini")
    ]
    
    found = False
    for path in paths:
        if config.read(path):
            found = True
            break
            
    if not found:
        return None, f"錯誤：找不到 config.ini 檔案 (嘗試路徑: {paths})。"
    
    if 'cwa' not in config or 'api_key' not in config['cwa']:
        return None, "錯誤：config.ini 檔案中找不到 [cwa] 或 api_key。"
        
    return config['cwa']['api_key'], None

# --- 參數設定 ---
API_KEY, error_msg = get_api_key()
if error_msg:
    print(error_msg)

# --- In-Memory Cache ---
import time
CACHE = {}
CACHE_TTL = 600  # 10 minutes

def get_weather(city_name):
    """
    查詢指定城市的天氣資料 (使用 CWA API F-C0032-001)
    """
    if not API_KEY:
        return None, "錯誤：無法讀取 API Key，請檢查 config.ini 檔案。"

    # Check Cache
    cache_key = f"city_{city_name}"
    if cache_key in CACHE:
        timestamp, cached_data = CACHE[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            print(f"[{city_name}] 使用快取資料 (無需呼叫 API)")
            return cached_data, None

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

        forecasts = []
        # CWA API 通常回傳 3 個時間區段 (未來 36 小時)
        # 我們假設每個 element 的 time 陣列長度都相同 (通常是 3)
        num_periods = len(find_element('Wx')['time'])

        for i in range(num_periods):
            wx_time = find_element('Wx')['time'][i]
            start_time = wx_time['startTime']
            end_time = wx_time['endTime']
            
            weather_state = wx_time['parameter']['parameterName']
            weather_code = wx_time['parameter']['parameterValue']
            
            # MaxT: 最高溫, MinT: 最低溫. 這裡我們可以用 MaxT 代表或是顯示範圍
            # 為了簡化，我們先維持用 MaxT，或者也可以抓 MinT 來顯示區間
            max_temp = find_element('MaxT')['time'][i]['parameter']['parameterName']
            min_temp = find_element('MinT')['time'][i]['parameter']['parameterName']
            
            pop = find_element('PoP')['time'][i]['parameter']['parameterName']

            forecasts.append({
                "start_time": start_time,
                "end_time": end_time,
                "weather_state": weather_state,
                "weather_code": weather_code,
                "max_temp": max_temp,
                "min_temp": min_temp,
                "pop": pop
            })

        result = (forecasts, None)
        CACHE[cache_key] = (time.time(), result[0])
        return result

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

def get_lifestyle_advice(min_temp, max_temp, pop):
    """
    根據天氣數據提供穿衣與生活建議
    """
    advice = []
    
    try:
        min_t = int(min_temp)
        max_t = int(max_temp)
        pop_val = int(pop)
    except ValueError:
        return "數據不足，無法提供建議"

    # 降雨建議
    if pop_val >= 70:
        advice.append("🌧️ 出門記得帶傘")
    elif pop_val >= 30:
        advice.append("🌂 攜帶雨具備用")

    # 溫度建議
    if max_t >= 30:
        advice.append("☀️ 天氣炎熱，注意防曬補水")
    elif min_t < 15:
        advice.append("❄️ 天氣寒冷，請穿著保暖衣物")
    
    # 溫差建議
    if (max_t - min_t) >= 10:
        advice.append("🧥 日夜溫差大，建議洋蔥式穿搭")
        
    if not advice:
        advice.append("😊 天氣舒適，適合出遊")
        
    return " | ".join(advice)

def get_all_weather():
    """
    一次查詢全台所有縣市的天氣資料 (使用 CWA API F-C0032-001)
    回傳: ({縣市名: 天氣資料字典}, 錯誤訊息)
    """
    if not API_KEY:
        return None, "錯誤：無法讀取 API Key，請檢查 config.ini 檔案。"

    # Check Cache
    cache_key = "all_cities"
    if cache_key in CACHE:
        timestamp, cached_data = CACHE[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            print(f"[全台] 使用快取資料 (無需呼叫 API)")
            return cached_data, None

    # 不指定 locationName 即可獲取全部資料
    url = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization={API_KEY}"
    print(f"正在查詢全台天氣資料 (CWA)...")

    data = {}
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()

        if not data.get("success"):
            raise ValueError("CWA API 回應失敗 (success=false)。")

        all_weather = {}
        locations = data['records']['location']
        
        for location in locations:
            city_name = location['locationName']
            weather_elements = location['weatherElement']

            def find_element(name):
                return next(item for item in weather_elements if item["elementName"] == name)

            # 提取第一個時間點的預報資料
            weather_state = find_element('Wx')['time'][0]['parameter']['parameterName']
            weather_code = find_element('Wx')['time'][0]['parameter']['parameterValue']
            temp = find_element('MaxT')['time'][0]['parameter']['parameterName']
            pop = find_element('PoP')['time'][0]['parameter']['parameterName']

            all_weather[city_name] = {
                "weather_state": weather_state,
                "weather_code": weather_code,
                "temp": temp,
                "pop": pop
            }

        result = (all_weather, None)
        CACHE[cache_key] = (time.time(), result[0])
        return result

    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError, StopIteration) as e:
        # 建立日誌資料夾
        log_dir = "error_logs"
        os.makedirs(log_dir, exist_ok=True)
        
        # 定義日誌檔案路徑
        log_filename = os.path.join(log_dir, f"cwa_api_error_ALL.json")
        
        # 寫入日誌檔案
        with open(log_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"API 回應已寫入錯誤日誌: {log_filename}")
        return None, f"處理 API 資料時發生錯誤: {e}"

def get_week_forecast(city_name):
    """
    查詢指定城市的一週天氣預報 (使用 CWA API F-D0047-091)
    """
    if not API_KEY:
        return None, "錯誤：無法讀取 API Key，請檢查 config.ini 檔案。"

    # Check Cache
    cache_key = f"week_{city_name}"
    if cache_key in CACHE:
        timestamp, cached_data = CACHE[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            print(f"[{city_name}] 使用快取資料 (無需呼叫 API)")
            return cached_data, None

    # F-D0047-091: 臺灣各縣市鄉鎮未來1週逐12小時天氣預報
    # locationName in this API requires a specific city name, sometimes followed by district.
    # But F-D0047-091 actually returns ALL districts for a specific County if we don't specify locationName?
    # Wait, F-D0047-091 parameter is 'locationName' which is the County/City name (e.g., 宜蘭縣).
    # Then inside 'location' list, it contains districts.
    # However, F-D0047-091 is "Taiwan 7-Day Forecast by Location (City)".
    
    url = f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization={API_KEY}&locationName={city_name}"
    print(f"正在查詢 {city_name} 的一週天氣資料 (CWA Week)...")

    data = {}
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()

        if not data.get("success"):
            raise ValueError("CWA API 回應失敗 (success=false)。")

        # The result typically contains a list of locations. Since we filtered by locationName={city_name},
        # we should get that city's data.
        # But wait, F-D0047-091 returns "Content: The weather forecasts for the townships in the specified county/city."
        # This means we will get a list of TOWNSHIPS (e.g. Banqiao, Xinzhuang...).
        # We need to pick ONE representative township for the "City View".
        # As a heuristic, we will pick the first location returned, or try to find a district that matches the city name (usually not applicable for Counties).
        # Let's just pick the first one which is usually the County Seat or a major district.
        
        locations = data['records']['Locations'][0]['Location']
        if not locations:
            return None, "找不到該縣市的預報資料"
            
        # Find the location that matches the city name
        # The city_name is typically the county/city (e.g., "臺北市", "新北市")
        # We need to find a district/location that best represents this city
        location = None
        
        # First, try to find a location whose name contains the city name (without 市/縣)
        city_base_name = city_name.replace('市', '').replace('縣', '')
        for loc in locations:
            if city_base_name in loc['LocationName']:
                location = loc
                break
        
        # If not found, just use the first available location as fallback
        if location is None:
            location = locations[0]
            
        print(f"使用觀測點: {location['LocationName']}")

        weather_elements = location['WeatherElement']

        def find_element(name):
            return next(item for item in weather_elements if item["ElementName"] == name)

        # F-D0047-091 typically has:
        # Wx: Weather Description
        # MaxT: Max Temp
        # MinT: Min Temp
        # PoP12h: Probability of Precipitation (12h)
        
        # F-D0047-091 使用中文 ElementName
        # 天氣現象: Weather (Value: Weather, WeatherCode)
        # 最高溫度: MaxTemperature (Value: MaxTemperature)
        # 最低溫度: MinTemperature (Value: MinTemperature)
        # 12小時降雨機率: 12小時降雨機率 (Value: ProbabilityOfPrecipitation)
        
        forecasts = []
        # Usually 14 periods for 7 days
        try:
            time_periods = find_element('天氣現象')['Time']
        except StopIteration:
            return None, "找不到'天氣現象'資料"

        for i in range(len(time_periods)):
            wx_time = time_periods[i]
            start_time = wx_time['StartTime']
            end_time = wx_time['EndTime']
            
            # Extract Weather and WeatherCode
            # Structure: ElementValue: [ { "Weather": "...", "WeatherCode": "..." } ]
            wx_val_list = wx_time['ElementValue'][0]
            weather_state = wx_val_list.get('Weather', '')
            weather_code = wx_val_list.get('WeatherCode', '')
            
            # Extract Max Temp
            try:
                max_t_time = find_element('最高溫度')['Time'][i]
                max_temp = max_t_time['ElementValue'][0]['MaxTemperature']
            except:
                max_temp = "-"

            # Extract Min Temp
            try:
                min_t_time = find_element('最低溫度')['Time'][i]
                min_temp = min_t_time['ElementValue'][0]['MinTemperature']
            except:
                min_temp = "-"
            
            # Extract PoP (12h)
            try:
                pop_time = find_element('12小時降雨機率')['Time'][i]
                pop = pop_time['ElementValue'][0]['ProbabilityOfPrecipitation']
                if pop == ' ': pop = "0"
            except:
                pop = "0"

            forecasts.append({
                "start_time": start_time,
                "end_time": end_time,
                "weather_state": weather_state,
                "weather_code": weather_code,
                "max_temp": max_temp,
                "min_temp": min_temp,
                "pop": pop
            })

        result = (forecasts, None)
        CACHE[cache_key] = (time.time(), result[0])
        return result

    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError, StopIteration) as e:
        log_dir = "error_logs"
        os.makedirs(log_dir, exist_ok=True)
        log_filename = os.path.join(log_dir, f"cwa_api_week_error_{city_name}.json")
        with open(log_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"API 回應已寫入錯誤日誌: {log_filename}")
        return None, f"處理 API 資料時發生錯誤: {e}"

def get_aqi_key():
    """
    從 config.ini 讀取環境部 API Key
    """
    config = configparser.ConfigParser()
    
    # Try different paths
    paths = [
        "config.ini",
        "../backend/config.ini",
        os.path.join(os.path.dirname(__file__), "../backend/config.ini"),
        os.path.join(os.path.dirname(__file__), "config.ini")
    ]
    
    found = False
    for path in paths:
        if config.read(path):
            found = True
            break
            
    if not found:
        return None, f"錯誤：找不到 config.ini 檔案 (嘗試路徑: {paths})。"
    
    if 'moenv' not in config or 'api_key' not in config['moenv']:
        return None, "錯誤：config.ini 檔案中找不到 [moenv] 或 api_key。"
        
    return config['moenv']['api_key'], None

# AQI API Key
AQI_API_KEY, aqi_error_msg = get_aqi_key()
if aqi_error_msg:
    print(f"[警告] {aqi_error_msg} - AQI 功能將無法使用")

# City name mapping for AQI stations
# Maps weather API city names to AQI monitoring stations
CITY_TO_AQI_STATION = {
    "臺北市": "臺北市",
    "新北市": "新北市",
    "基隆市": "基隆市", 
    "桃園市": "桃園市",
    "新竹市": "新竹市",
    "新竹縣": "新竹縣",
    "苗栗縣": "苗栗縣",
    "臺中市": "臺中市",
    "彰化縣": "彰化縣",
    "南投縣": "南投縣",
    "雲林縣": "雲林縣",
    "嘉義市": "嘉義市",
    "嘉義縣": "嘉義縣",
    "臺南市": "臺南市",
    "高雄市": "高雄市",
    "屏東縣": "屏東縣",
    "宜蘭縣": "宜蘭縣",
    "花蓮縣": "花蓮縣",
    "臺東縣": "臺東縣",
    "澎湖縣": "澎湖縣",
    "金門縣": "金門縣",
    "連江縣": "連江縣"
}

def get_aqi_data(city_name):
    """
    查詢指定城市的空氣品質資料 (使用環境部 API AQX_P_432)
    回傳: (資料字典, 錯誤訊息)
    """
    if not AQI_API_KEY:
        return None, "錯誤：無法讀取環境部 API Key，請檢查 config.ini 檔案中的 [moenv] 設定。"

    # Check Cache
    cache_key = f"aqi_{city_name}"
    if cache_key in CACHE:
        timestamp, cached_data = CACHE[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            print(f"[{city_name} AQI] 使用快取資料 (無需呼叫 API)")
            return cached_data, None

    # Map city name to monitoring station county
    aqi_county = CITY_TO_AQI_STATION.get(city_name, city_name)
    
    # Taiwan EPA AQI API URL
    url = f"https://data.moenv.gov.tw/api/v2/aqx_p_432?api_key={AQI_API_KEY}&limit=1000&sort=ImportDate%20desc&format=json"
    print(f"正在查詢 {city_name} 的空氣品質資料 (EPA)...")

    data = {}
    try:
        response = requests.get(url, verify=False, timeout=10)
        response.raise_for_status()
        data = response.json()

        if 'records' not in data:
            raise ValueError("EPA API 回應格式不正確")

        records = data['records']
        
        # Find stations in the specified county
        county_stations = [r for r in records if r.get('county') == aqi_county]
        
        if not county_stations:
            # Fallback: try to find any station with the city name
            county_stations = [r for r in records if city_name.replace('市', '').replace('縣', '') in r.get('sitename', '')]
        
        if not county_stations:
            return None, f"找不到 {city_name} 的空氣品質測站資料"
        
        # Use the first valid station with AQI data
        station_data = None
        for station in county_stations:
            if station.get('aqi') and station.get('aqi') != '':
                station_data = station
                break
        
        if not station_data:
            # If no station has AQI, just use the first one
            station_data = county_stations[0]
        
        # Extract AQI information
        aqi_value = station_data.get('aqi', '-')
        pm25_value = station_data.get('pm2.5', '-')
        status = station_data.get('status', '-')
        pollutant = station_data.get('pollutant', '-')
        sitename = station_data.get('sitename', '-')
        
        # Determine AQI level and color
        aqi_level = 'unknown'
        try:
            aqi_num = int(aqi_value) if aqi_value != '-' else 0
            if aqi_num <= 50:
                aqi_level = 'good'
            elif aqi_num <= 100:
                aqi_level = 'moderate'
            elif aqi_num <= 150:
                aqi_level = 'unhealthy-sensitive'
            elif aqi_num <= 200:
                aqi_level = 'unhealthy'
            elif aqi_num <= 300:
                aqi_level = 'very-unhealthy'
            else:
                aqi_level = 'hazardous'
        except ValueError:
            aqi_level = 'unknown'
        
        result_data = {
            "aqi": aqi_value,
            "pm25": pm25_value,
            "status": status,
            "pollutant": pollutant,
            "sitename": sitename,
            "level": aqi_level
        }
        
        # Cache the result
        CACHE[cache_key] = (time.time(), result_data)
        return result_data, None

    except (requests.exceptions.RequestException, ValueError, KeyError) as e:
        # Log error
        log_dir = "error_logs"
        os.makedirs(log_dir, exist_ok=True)
        log_filename = os.path.join(log_dir, f"epa_aqi_error_{city_name}.json")
        
        with open(log_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"AQI API 回應已寫入錯誤日誌: {log_filename}")
        return None, f"處理 AQI API 資料時發生錯誤: {e}"

if __name__ == '__main__':

    if not API_KEY:
        print("無法執行測試，因為未設定 API Key。")
    else:
        city = "臺北市"
        # Test 7-day forecast
        print(f"Testing 7-day forecast for {city}...")
        weather_data, error = get_week_forecast(city)

        if weather_data:
            print("\n--- CWA API (Week) 資料抓取成功 ---")
            print(json.dumps(weather_data, indent=4, ensure_ascii=False))

        if error:
            print(f"\n錯誤: {error}")
