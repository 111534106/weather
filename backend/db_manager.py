"""
Database Manager for Weather History
提供資料庫維護功能：檢視統計、清理資料、重置資料庫
"""

import sqlite3
import os
import sys
from data_logger import delete_record, update_note

# Add directory to path to allow imports if needed, though this is standalone
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'weather_history.db')

def get_connection():
    return sqlite3.connect(DB_PATH)

def show_stats():
    print("\n[Stat] 資料庫統計資訊")
    print("-" * 30)
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Total records
        cursor.execute("SELECT COUNT(*) FROM weather_queries")
        result = cursor.fetchone()
        count = result[0] if result else 0
        print(f"總筆數: {count}")
        
        if count > 0:
            # Date range
            cursor.execute("SELECT MIN(query_time), MAX(query_time) FROM weather_queries")
            min_date, max_date = cursor.fetchone()
            print(f"資料範圍: {min_date} ~ {max_date}")
            
            # City distribution (Top 5)
            print("\n熱門查詢城市 (前 5 名):")
            cursor.execute("""
                SELECT city, COUNT(*) as c 
                FROM weather_queries 
                GROUP BY city 
                ORDER BY c DESC 
                LIMIT 5
            """)
            for row in cursor.fetchall():
                print(f"  - {row[0]}: {row[1]} 次")
                
    except Exception as e:
        print(f"[Error] 讀取統計失敗: {e}")
    finally:
        if conn: conn.close()

def show_recent(limit=5):
    print(f"\n[Info] 最近 {limit} 筆記錄")
    print("-" * 30)
    try:
        conn = get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT * FROM weather_queries ORDER BY query_time DESC LIMIT {limit}")
        rows = cursor.fetchall()
        
        if not rows:
            print("目前沒有資料。")
            return
            
        for row in rows:
            print(f"[{row['id']}] {row['query_time']} - {row['city']}: {row['temperature']}度C ({row['weather_description']})")
            
    except Exception as e:
        print(f"[Error] 讀取記錄失敗: {e}")
    finally:
        if conn: conn.close()

def clear_data():
    print("\n[Warn] 警告: 這將會刪除所有歷史記錄！")
    confirm = input("確定要執行嗎？ (y/n): ")
    if confirm.lower() != 'y':
        print("已取消。")
        return

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM weather_queries")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='weather_queries'") # Reset ID
        conn.commit()
        print(f"[OK] 已清除所有資料，資料庫已重置。")
    except Exception as e:
        print(f"[Error] 清除失敗: {e}")
    finally:
        if conn: conn.close()

def delete_data_ui():
    print("\n[Action] 刪除記錄")
    id_str = input("請輸入要刪除的記錄 ID: ")
    if not id_str.isdigit():
        print("[Error] 請輸入數字 ID")
        return
    
    if delete_record(int(id_str)):
        print(f"[OK] 記錄 ID {id_str} 已刪除。")
    else:
        print(f"[Fail] 刪除失敗，找不到 ID {id_str}。")

def update_note_ui():
    print("\n[Action] 修改備註")
    id_str = input("請輸入要修改的記錄 ID: ")
    if not id_str.isdigit():
        print("[Error] 請輸入數字 ID")
        return
    
    note = input(f"請輸入 ID {id_str} 的新備註: ")
    if update_note(int(id_str), note):
        print(f"[OK] 記錄 ID {id_str} 備註已更新。")
    else:
        print(f"[Fail] 更新失敗，找不到 ID {id_str}。")

def main():
    while True:
        print("\n" + "="*30)
        print("[Tool] 天氣資料庫管理工具")
        print("="*30)
        print("1. 查看統計資訊 (Stats)")
        print("2. 查看最近記錄 (Recent)")
        print("3. 清空資料庫 (Clear All)")
        print("4. 離開 (Exit)")
        print("5. 刪除紀錄 (Delete)")
        print("6. 修改備註 (Update)")
        
        try:
            choice = input("\n請選擇功能 (1-6): ")
        except EOFError:
            break
        
        if choice == '1':
            show_stats()
        elif choice == '2':
            show_recent()
        elif choice == '3':
            clear_data()
        elif choice == '4':
            print("Bye!")
            break
        elif choice == '5':
            delete_data_ui()
        elif choice == '6':
            update_note_ui()
        else:
            print("無效的選擇，請重試。")

if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        print(f"[Error] 找不到資料庫檔案: {DB_PATH}")
        print("請先執行後端程式產生資料庫。")
    elif len(sys.argv) > 1:
        # Command line mode
        cmd = sys.argv[1].lower()
        if cmd == 'stats':
            show_stats()
        elif cmd == 'recent':
            show_recent()
        elif cmd == 'clear':
            # Bypass interactive confirm for script usage
            try:
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM weather_queries")
                cursor.execute("DELETE FROM sqlite_sequence WHERE name='weather_queries'")
                conn.commit()
                print(f"[OK] 已清除所有資料，資料庫已重置。")
            except Exception as e:
                print(f"[Error] 清除失敗: {e}")
            finally:
                if conn: conn.close()
        else:
            print(f"Unknown command: {cmd}")
    else:
        main()
