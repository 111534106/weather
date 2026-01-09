"""
天氣資料記錄模組
負責將天氣查詢資料記錄到 SQLite 資料庫
"""

import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

# 資料庫檔案路徑
DB_DIR = os.path.join(os.path.dirname(__file__), 'data')
DB_PATH = os.path.join(DB_DIR, 'weather_history.db')


def init_database() -> None:
    """
    初始化資料庫，建立資料表（如果不存在）
    """
    # 確保 data 目錄存在
    os.makedirs(DB_DIR, exist_ok=True)
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # 建立天氣查詢記錄表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS weather_queries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    city TEXT NOT NULL,
                    temperature REAL,
                    min_temp REAL,
                    max_temp REAL,
                    feels_like REAL,
                    humidity INTEGER,
                    weather_description TEXT,
                    pop INTEGER,
                    aqi INTEGER,
                    pm25 REAL,
                    aqi_status TEXT,
                    forecast_period TEXT,
                    query_type TEXT DEFAULT 'current'
                )
            ''')
            
            # 建立索引以提升查詢效率
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_city 
                ON weather_queries(city)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_query_time 
                ON weather_queries(query_time)
            ''')
            
            conn.commit()
            print(f"[OK] 資料庫初始化成功: {DB_PATH}")

            # 檢查並新增 note 欄位 (Schema Migration)
            try:
                cursor.execute("SELECT note FROM weather_queries LIMIT 1")
            except sqlite3.OperationalError:
                print("[Info] 偵測到舊版資料庫，正在新增 'note' 欄位...")
                cursor.execute("ALTER TABLE weather_queries ADD COLUMN note TEXT")
                conn.commit()
                print("[OK] 資料庫結構更新完成 (Added 'note' column)")
            
    except sqlite3.Error as e:
        print(f"[Error] 資料庫初始化失敗: {e}")


def log_weather_query(
    city: str, 
    weather_data: Optional[Dict[str, Any]] = None,
    aqi_data: Optional[Dict[str, Any]] = None
) -> bool:
    """
    記錄單次天氣查詢到資料庫
    
    Args:
        city: 城市名稱
        weather_data: 天氣資料字典
        aqi_data: 空氣品質資料字典
        
    Returns:
        bool: 是否成功記錄
    """
    if not weather_data:
        return False
    
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # 提取天氣資料
            temperature = weather_data.get('temperature')
            min_temp = weather_data.get('min_temp')
            max_temp = weather_data.get('max_temp')
            
            # 如果沒有 temperature，用 min_temp 和 max_temp 的平均值
            if temperature is None and min_temp is not None and max_temp is not None:
                try:
                    temperature = round((float(min_temp) + float(max_temp)) / 2, 1)
                except (ValueError, TypeError):
                    temperature = None
            
            feels_like = weather_data.get('feels_like')
            humidity = weather_data.get('humidity')
            weather_description = weather_data.get('weather_description', '') or weather_data.get('weather_state', '')
            pop = weather_data.get('pop')
            forecast_period = weather_data.get('time', '') or weather_data.get('time_period', '')
            
            # 提取 AQI 資料
            aqi = None
            pm25 = None
            aqi_status = None
            
            if aqi_data:
                aqi = aqi_data.get('aqi')
                pm25 = aqi_data.get('pm25')
                aqi_status = aqi_data.get('status', '')
            
            # 插入記錄
            cursor.execute('''
                INSERT INTO weather_queries (
                    city, temperature, min_temp, max_temp, feels_like,
                    humidity, weather_description, pop, aqi, pm25, 
                    aqi_status, forecast_period
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                city, temperature, min_temp, max_temp, feels_like,
                humidity, weather_description, pop, aqi, pm25,
                aqi_status, forecast_period
            ))
            
            conn.commit()
            return True
            
    except sqlite3.Error as e:
        print(f"[Error] 記錄天氣查詢失敗: {e}")
        return False


def delete_record(record_id: int) -> bool:
    """
    刪除指定 ID 的天氣記錄
    
    Args:
        record_id: 記錄 ID
        
    Returns:
        bool: 是否刪除成功
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM weather_queries WHERE id = ?", (record_id,))
            if cursor.rowcount > 0:
                conn.commit()
                return True
            return False
    except sqlite3.Error as e:
        print(f"[Error] 刪除記錄失敗: {e}")
        return False


def update_note(record_id: int, note: str) -> bool:
    """
    更新指定 ID 記錄的備註
    
    Args:
        record_id: 記錄 ID
        note: 新的備註內容
        
    Returns:
        bool: 是否更新成功
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE weather_queries SET note = ? WHERE id = ?", (note, record_id))
            if cursor.rowcount > 0:
                conn.commit()
                return True
            return False
    except sqlite3.Error as e:
        print(f"[Error] 更新備註失敗: {e}")
        return False


def get_query_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    查詢歷史天氣記錄
    
    Args:
        start_date: 開始日期 (格式: YYYY-MM-DD)
        end_date: 結束日期 (格式: YYYY-MM-DD)
        city: 城市名稱（選填）
        
    Returns:
        List[Dict]: 查詢結果列表
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row  # 使結果可以用欄位名稱存取
            cursor = conn.cursor()
            
            # 建立查詢 SQL
            query = "SELECT * FROM weather_queries WHERE 1=1"
            params = []
            
            # 加入日期篩選
            if start_date:
                query += " AND date(query_time) >= ?"
                params.append(start_date)
            
            if end_date:
                query += " AND date(query_time) <= ?"
                params.append(end_date)
            
            # 加入城市篩選
            if city:
                query += " AND city = ?"
                params.append(city)
            
            # 按時間排序（最新的在前）
            query += " ORDER BY query_time DESC"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # 轉換為字典列表
            results = []
            for row in rows:
                results.append({
                    'id': row['id'],
                    'query_time': row['query_time'],
                    'city': row['city'],
                    'temperature': row['temperature'],
                    'min_temp': row['min_temp'],
                    'max_temp': row['max_temp'],
                    'feels_like': row['feels_like'],
                    'humidity': row['humidity'],
                    'weather_description': row['weather_description'],
                    'pop': row['pop'],
                    'aqi': row['aqi'],
                    'pm25': row['pm25'],
                    'aqi_status': row['aqi_status'],
                    'aqi_status': row['aqi_status'],
                    'forecast_period': row['forecast_period'],
                    # 如果 note 欄位不存在 (舊資料)，給空字串
                    'note': row['note'] if 'note' in row.keys() else ''
                })
            
            return results
            
    except sqlite3.Error as e:
        print(f"[Error] 查詢歷史記錄失敗: {e}")
        return []


def get_export_stats() -> Dict[str, Any]:
    """
    取得可匯出資料的統計資訊
    
    Returns:
        Dict: 包含總筆數、日期範圍、城市列表等資訊
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # 取得總筆數
            cursor.execute("SELECT COUNT(*) FROM weather_queries")
            total_records = cursor.fetchone()[0]
            
            # 取得日期範圍
            cursor.execute("""
                SELECT 
                    MIN(date(query_time)) as earliest_date,
                    MAX(date(query_time)) as latest_date
                FROM weather_queries
            """)
            date_range = cursor.fetchone()
            
            # 取得所有查詢過的城市
            cursor.execute("""
                SELECT DISTINCT city 
                FROM weather_queries 
                ORDER BY city
            """)
            cities = [row[0] for row in cursor.fetchall()]
            
            return {
                'total_records': total_records,
                'earliest_date': date_range[0] if date_range[0] else None,
                'latest_date': date_range[1] if date_range[1] else None,
                'cities': cities
            }
            
    except sqlite3.Error as e:
        print(f"[Error] 取得統計資訊失敗: {e}")
        return {
            'total_records': 0,
            'earliest_date': None,
            'latest_date': None,
            'cities': []
        }


if __name__ == '__main__':
    # 測試資料庫初始化
    print("測試資料庫初始化...")
    init_database()
    
    # 測試記錄資料
    print("\n測試記錄天氣資料...")
    test_weather_data = {
        'temperature': 25.5,
        'min_temp': 20.0,
        'max_temp': 28.0,
        'feels_like': 26.0,
        'humidity': 70,
        'weather_description': '多雲時晴',
        'pop': 30,
        'time': '2025-12-26 14:00'
    }
    
    test_aqi_data = {
        'aqi': 50,
        'pm25': 15.5,
        'status': '良好'
    }
    
    success = log_weather_query('臺北市', test_weather_data, test_aqi_data)
    print(f"記錄結果: {'[OK] 成功' if success else '[Fail] 失敗'}")
    
    # 測試查詢歷史
    print("\n測試查詢歷史記錄...")
    records = get_query_history()
    print(f"找到 {len(records)} 筆記錄")
    
    if records:
        print("\n最新的一筆記錄:")
        latest = records[0]
        for key, value in latest.items():
            print(f"  {key}: {value}")
    
    # 測試統計資訊
    print("\n測試統計資訊...")
    stats = get_export_stats()
    print(f"總筆數: {stats['total_records']}")
    print(f"日期範圍: {stats['earliest_date']} ~ {stats['latest_date']}")
    print(f"城市列表: {', '.join(stats['cities'])}")
