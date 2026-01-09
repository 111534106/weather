"""
天氣資料匯出模組
負責從資料庫查詢資料並轉換為 CSV、Excel、JSON 格式
"""

import sqlite3
import pandas as pd
from io import BytesIO
from typing import Optional, Tuple
from data_logger import DB_PATH, get_query_history


def export_to_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None
) -> Tuple[Optional[BytesIO], Optional[str]]:
    """
    匯出資料為 CSV 格式
    
    Args:
        start_date: 開始日期 (格式: YYYY-MM-DD)
        end_date: 結束日期 (格式: YYYY-MM-DD)
        city: 城市名稱（選填）
        
    Returns:
        Tuple[BytesIO, str]: (CSV 資料流, 錯誤訊息)
    """
    try:
        # 取得歷史記錄
        records = get_query_history(start_date, end_date, city)
        
        if not records:
            return None, "沒有可匯出的資料"
        
        # 轉換為 DataFrame
        df = pd.DataFrame(records)
        
        # 重新命名欄位為中文
        df.columns = [
            'ID', '查詢時間', '城市', '溫度(°C)', '最低溫(°C)', '最高溫(°C)',
            '體感溫度(°C)', '濕度(%)', '天氣狀況', '降雨機率(%)',
            'AQI', 'PM2.5', '空氣品質', '預報時段'
        ]
        
        # 移除 ID 欄位
        df = df.drop('ID', axis=1)
        
        # 匯出為 CSV
        output = BytesIO()
        df.to_csv(output, index=False, encoding='utf-8-sig')  # utf-8-sig 支援中文
        output.seek(0)
        
        return output, None
        
    except Exception as e:
        return None, f"CSV 匯出失敗: {str(e)}"


def export_to_excel(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None
) -> Tuple[Optional[BytesIO], Optional[str]]:
    """
    匯出資料為 Excel 格式
    
    Args:
        start_date: 開始日期 (格式: YYYY-MM-DD)
        end_date: 結束日期 (格式: YYYY-MM-DD)
        city: 城市名稱（選填）
        
    Returns:
        Tuple[BytesIO, str]: (Excel 資料流, 錯誤訊息)
    """
    try:
        # 取得歷史記錄
        records = get_query_history(start_date, end_date, city)
        
        if not records:
            return None, "沒有可匯出的資料"
        
        # 轉換為 DataFrame
        df = pd.DataFrame(records)
        
        # 重新命名欄位為中文
        df.columns = [
            'ID', '查詢時間', '城市', '溫度(°C)', '最低溫(°C)', '最高溫(°C)',
            '體感溫度(°C)', '濕度(%)', '天氣狀況', '降雨機率(%)',
            'AQI', 'PM2.5', '空氣品質', '預報時段'
        ]
        
        # 移除 ID 欄位
        df = df.drop('ID', axis=1)
        
        # 匯出為 Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='天氣歷史資料', index=False)
        output.seek(0)
        
        return output, None
        
    except Exception as e:
        return None, f"Excel 匯出失敗: {str(e)}"


def export_to_json(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None
) -> Tuple[Optional[str], Optional[str]]:
    """
    匯出資料為 JSON 格式
    
    Args:
        start_date: 開始日期 (格式: YYYY-MM-DD)
        end_date: 結束日期 (格式: YYYY-MM-DD)
        city: 城市名稱（選填）
        
    Returns:
        Tuple[str, str]: (JSON 字串, 錯誤訊息)
    """
    try:
        # 取得歷史記錄
        records = get_query_history(start_date, end_date, city)
        
        if not records:
            return None, "沒有可匯出的資料"
        
        # 轉換為 DataFrame
        df = pd.DataFrame(records)
        
        # 移除 ID 欄位
        df = df.drop('id', axis=1)
        
        # 匯出為 JSON
        json_str = df.to_json(orient='records', force_ascii=False, indent=2)
        
        return json_str, None
        
    except Exception as e:
        return None, f"JSON 匯出失敗: {str(e)}"


if __name__ == '__main__':
    # 測試匯出功能
    print("測試 CSV 匯出...")
    csv_data, error = export_to_csv()
    if csv_data:
        print("[OK] CSV 匯出成功")
        print(f"資料大小: {len(csv_data.getvalue())} bytes")
    else:
        print(f"[Fail] {error}")
    
    print("\n測試 Excel 匯出...")
    excel_data, error = export_to_excel()
    if excel_data:
        print("[OK] Excel 匯出成功")
        print(f"資料大小: {len(excel_data.getvalue())} bytes")
    else:
        print(f"[Fail] {error}")
    
    print("\n測試 JSON 匯出...")
    json_data, error = export_to_json()
    if json_data:
        print("[OK] JSON 匯出成功")
        print(f"資料大小: {len(json_data)} bytes")
        print("\n預覽:")
        print(json_data[:500])
    else:
        print(f"[Fail] {error}")
