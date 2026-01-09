"""
天氣資料分析模組
使用 Pandas 進行歷史天氣資料的統計與分析
"""

import sqlite3
import pandas as pd
import json
from data_logger import DB_PATH

def get_weather_statistics(city: Optional[str] = None):
    """
    從資料庫讀取歷史資料並計算統計數據
    
    Args:
        city: 選填，指定城市名稱。如果提供則只分析該城市資料
    """
    try:
        # 連線至資料庫
        conn = sqlite3.connect(DB_PATH)
        
        # 使用 Pandas 讀取資料（可選城市篩選）
        if city:
            df = pd.read_sql_query(
                "SELECT * FROM weather_queries WHERE city = ?", 
                conn, 
                params=(city,)
            )
        else:
            df = pd.read_sql_query("SELECT * FROM weather_queries", conn)
        
        conn.close()
        
        if df.empty:
            return {
                "success": False,
                "error": "目前沒有足夠的歷史資料可供分析"
            }
            
        # --- 數據處理 ---
        
        # 1. 確保數值型別正確
        numeric_cols = ['temperature', 'min_temp', 'max_temp', 'humidity', 'aqi']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        # 2. 計算總歷史平均溫度
        avg_temp = round(df['temperature'].mean(), 1)
        
        # 3. 找出最熱與最冷的紀錄
        max_temp_record = df.loc[df['max_temp'].idxmax()]
        min_temp_record = df.loc[df['min_temp'].idxmin()]
        
        # 4. 城市查詢熱度排行 (Top 3)
        city_counts = df['city'].value_counts().head(3).to_dict()
        
        # 5. 平均 AQI (空氣品質)
        avg_aqi = round(df['aqi'].mean(), 1)

        # 6. 最新氣溫 (Current/Latest Temp)
        # 根據查詢時間排序，抓取最新的一筆
        latest_record = df.sort_values('query_time', ascending=False).iloc[0]
        latest_temp = latest_record['temperature']
        latest_temp = None if pd.isna(latest_temp) else float(latest_temp)
        latest_city = latest_record['city']
        
        # 7. 最近 7 天的平均溫度變化 (每日平均)
        # 轉換時間欄位
        df['query_time'] = pd.to_datetime(df['query_time'])
        # 篩選最近 7 天
        latest_date = df['query_time'].max()
        seven_days_ago = latest_date - pd.Timedelta(days=7)
        recent_df = df[df['query_time'] >= seven_days_ago]
        
        # 每日平均溫
        daily_temp = recent_df.groupby(recent_df['query_time'].dt.date)['temperature'].mean().round(1)
        # 轉成列表格式回傳給前端畫圖，並處理 NaN 值
        temps_list = daily_temp.values.tolist()
        # 將 NaN 轉換為 None (在 JSON 中會變成 null)
        temps_list = [None if pd.isna(temp) else temp for temp in temps_list]
        daily_trend = {
            "dates": [str(d) for d in daily_temp.index],
            "temps": temps_list
        }

        # --- 整理回傳結果 ---
        # 處理極端溫度值，確保不是 NaN
        max_temp_value = max_temp_record['max_temp']
        max_temp_value = None if pd.isna(max_temp_value) else float(max_temp_value)
        
        min_temp_value = min_temp_record['min_temp']
        min_temp_value = None if pd.isna(min_temp_value) else float(min_temp_value)
        
        stats = {
            "success": True,
            "summary": {
                "total_records": len(df),
                "avg_temp": float(avg_temp) if not pd.isna(avg_temp) else None,
                "latest_temp": latest_temp,
                "latest_city": latest_city,
                "avg_aqi": float(avg_aqi) if not pd.isna(avg_aqi) else None
            },
            "extremes": {
                "hottest": {
                    "city": max_temp_record['city'],
                    "temp": max_temp_value,
                    "date": str(max_temp_record['query_time']).split('.')[0]
                },
                "coldest": {
                    "city": min_temp_record['city'],
                    "temp": min_temp_value,
                    "date": str(min_temp_record['query_time']).split('.')[0]
                }
            },
            "popular_cities": city_counts,
            "trend": daily_trend
        }
        
        return stats

    except Exception as e:
        return {
            "success": False,
            "error": f"分析過程發生錯誤: {str(e)}"
        }

if __name__ == "__main__":
    # 測試程式
    print(json.dumps(get_weather_statistics(), indent=4, ensure_ascii=False))
