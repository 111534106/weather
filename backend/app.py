import sys
import os

# Add the api directory to the system path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))

from flask import Flask, render_template, jsonify, send_file, request
from weather_api import get_weather, get_all_weather, get_lifestyle_advice, get_week_forecast, get_aqi_data
from data_logger import init_database, log_weather_query, get_export_stats
from data_exporter import export_to_csv, export_to_excel, export_to_json
from data_analysis import get_weather_statistics
from recommender import get_recommended_cities
from alert_monitor import start_alert_monitor, get_current_alerts
from datetime import datetime

app = Flask(__name__, 
            template_folder='../web', 
            static_folder='../web',
            static_url_path='')
app.config['JSON_AS_ASCII'] = False

# 台灣 22 縣市列表
CITIES = [
    "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹市", "嘉義市",
    "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣"
]

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/weather/<city>')
def api_get_weather(city):
    # 改用可取得 7 天資料的函式
    data, error = get_week_forecast(city)
    if error:
        # 如果 7 天資料失敗，嘗試退回使用舊的 36 小時資料 (Fallback)
        print(f"7天預報抓取失敗 ({error})，嘗試使用一般預報...")
        data, error = get_weather(city)
    if error:
        return jsonify({'success': False, 'error': error}), 500
    
    # 增加生活建議
    advice = None
    if data and len(data) > 0:
        # 為每天產生建議
        for item in data:
            item['advice'] = get_lifestyle_advice(item['min_temp'], item['max_temp'], item['pop'])
            
        # 為了相容性，保留原本單獨回傳的 advice (給當天顯示用)
        first = data[0]
        advice = first.get('advice')
    
    # 嘗試取得 AQI 資料（不影響主要功能）
    aqi_data, aqi_error = get_aqi_data(city)
    if aqi_error:
        print(f"AQI 資料取得失敗: {aqi_error}")
        aqi_data = None
    
    # 記錄天氣查詢到資料庫（不影響主要功能）
    if data and len(data) > 0:
        try:
            log_weather_query(city, data[0], aqi_data)
        except Exception as e:
            print(f"記錄查詢失敗: {e}")
    
    # 將建議和 AQI 加入回傳資料
    response = jsonify({
        'success': True, 
        'data': data, 
        'advice': advice,
        'aqi': aqi_data
    })
    
    # 效能優化：添加緩存 headers（天氣資料 10 分鐘內有效）
    response.cache_control.max_age = 600  # 10 分鐘
    response.cache_control.public = True
    
    return response


@app.route('/api/weather/all')
def api_get_all_weather():
    data, error = get_all_weather()
    if error:
        return jsonify({'success': False, 'error': error}), 500
    return jsonify({'success': True, 'data': data})


# ==================== 資料匯出 API ====================

@app.route('/api/export/stats')
def api_export_stats():
    """取得可匯出資料的統計資訊"""
    try:
        stats = get_export_stats()
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats/analysis')
def api_get_analysis():
    """取得天氣統計分析數據 (Feature #13)"""
    # 取得可選的城市參數
    city = request.args.get('city', None)
    stats = get_weather_statistics(city)
    if stats['success']:
        return jsonify(stats)
    else:
        return jsonify(stats), 500


@app.route('/api/weather/recommend')
def api_get_recommendation():
    """取得智慧出遊推薦 (Feature #18)"""
    result = get_recommended_cities()
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 500


@app.route('/api/alerts')
def api_get_alerts():
    """取得即時災害性警報 (Feature #15)"""
    return jsonify(get_current_alerts())


# 啟動警報監控背景服務
start_alert_monitor()


@app.route('/api/export/csv')


@app.route('/api/export/csv')
def api_export_csv():
    """匯出 CSV 格式資料"""
    try:
        # 取得篩選參數
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        city = request.args.get('city')
        
        # 匯出資料
        csv_data, error = export_to_csv(start_date, end_date, city)
        
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # 產生檔名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'weather_export_{timestamp}.csv'
        
        # 回傳檔案
        return send_file(
            csv_data,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/export/excel')
def api_export_excel():
    """匯出 Excel 格式資料"""
    try:
        # 取得篩選參數
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        city = request.args.get('city')
        
        # 匯出資料
        excel_data, error = export_to_excel(start_date, end_date, city)
        
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # 產生檔名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'weather_export_{timestamp}.xlsx'
        
        # 回傳檔案
        return send_file(
            excel_data,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/export/json')
def api_export_json():
    """匯出 JSON 格式資料"""
    try:
        # 取得篩選參數
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        city = request.args.get('city')
        
        # 匯出資料
        json_data, error = export_to_json(start_date, end_date, city)
        
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # 產生檔名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'weather_export_{timestamp}.json'
        
        # 回傳 JSON 資料
        from io import BytesIO
        json_bytes = BytesIO(json_data.encode('utf-8'))
        
        return send_file(
            json_bytes,
            mimetype='application/json',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    # 初始化資料庫
    print("正在初始化資料庫...")
    init_database()
    
    # 啟動 Flask 應用程式
    app.run(debug=True, port=5000)
