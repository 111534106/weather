"""
智慧天氣推薦系統 (Feature #18)
根據演算法計算舒適度分數，推薦最適合出遊的城市
"""

from weather_api import get_all_weather
import math

def get_recommended_cities():
    """
    計算全台城市舒適度分數並回傳前三名
    """
    all_weather, error = get_all_weather()
    
    if error:
        return {
            "success": False,
            "error": error
        }
        
    scored_cities = []
    
    scored_cities = []
    
    for city_name, city_data in all_weather.items():
        # --- 1. 提取關鍵指標 ---
        try:
            temp = float(city_data.get('temp', 25)) # Note: key is 'temp' in weather_api.py, but I used 'temperature' in recommender.py? 
            # In weather_api.py: "temp": temp
            # So I should use 'temp'.
            rain_prob = int(city_data.get('pop', 0))
            # 這裡假設如果沒有 AQI 資料就給預設值
            aqi = 50 
        except (ValueError, TypeError):
            continue
            
        # --- 2. 評分演算法 (Scoring Algorithm) ---
        score = 100
        reasons = []
        
        # A. 溫度評分 (理想溫度 20-26度)
        # 偏離理想溫度越遠扣分越多
        ideal_temp = 23
        temp_diff = abs(temp - ideal_temp)
        
        if temp_diff <= 3:
            reasons.append("氣溫舒適")
        else:
            # 每偏離 1 度扣 2 分
            deduction = temp_diff * 2
            score -= deduction
            
        # B. 降雨機率評分
        # 降雨機率越高扣分越多
        if rain_prob <= 10:
            reasons.append("降雨機率低")
        elif rain_prob <= 30:
            score -= 10
        elif rain_prob <= 50:
            score -= 30
        else:
            score -= 50 # 不建議出遊
            
        # C. 特殊加分/扣分
        weather_desc = city_data.get('weather_state', '') # weather_state in weather_api
        if "晴" in weather_desc:
            score += 5
            if "晴" not in reasons:  # 避免重複
                 pass # reasons.append("陽光普照") 但可能跟降雨機率低重複，從簡
        
        # 確保分數在 0-100 之間
        score = max(0, min(100, score))
        
        scored_cities.append({
            "city": city_name,
            "score": int(score),
            "temp": temp,
            "weather": weather_desc,
            "reasons": reasons[:2], # 取前兩個優點
            "pop": rain_prob
        })
        
    # --- 3. 排序與篩選 ---
    # 根據分數由高到低排序
    scored_cities.sort(key=lambda x: x['score'], reverse=True)
    
    # 取前三名
    top_3 = scored_cities[:3]
    
    return {
        "success": True,
        "recommendations": top_3
    }
