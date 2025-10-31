import PySimpleGUI as sg
from weather_api import get_weather
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np

# --- 天氣代碼與圖示對照表 ---
WEATHER_ICONS = {
    "1": "☀️", "2": "🌤️", "3": "☁️", "4": "☁️", "5": "🌥️", "6": "🌥️", "7": "☁️",
    "8": "🌦️", "9": "🌦️", "10": "🌦️", "11": "🌧️", "12": "🌧️", "13": "🌧️", "14": "⛈️",
    "15": "⛈️", "16": "⛈️", "17": "⛈️", "18": "⛈️",
}

# --- 台灣 22 縣市 ---
cities = [
    "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市", "基隆市", "新竹市", "嘉義市",
    "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣"
]

# --- Matplotlib 繪圖函式 ---
def draw_figure(canvas, figure):
    figure_canvas_agg = FigureCanvasTkAgg(figure, canvas)
    figure_canvas_agg.draw()
    figure_canvas_agg.get_tk_widget().pack(side='top', fill='both', expand=1)
    return figure_canvas_agg

# --- GUI 介面佈局 ---
sg.theme('DarkGrey14')

info_column_layout = [
    [sg.Text("天氣資訊", font=("Helvetica", 16), text_color='#E0E0E0')],
    [sg.Text("", size=(30, 1), key="-WEATHER-", font=("Helvetica", 10), text_color='#E0E0E0')],
    [sg.Text("", size=(30, 1), key="-TEMP-", font=("Helvetica", 10), text_color='#E0E0E0')],
    [sg.Text("", size=(30, 1), key="-POP-", font=("Helvetica", 10), text_color='#E0E0E0')]
]

icon_column_layout = [
    [sg.Text("", key="-ICON-", font=("Helvetica", 60), text_color='#E0E0E0')]
]

layout = [
    [sg.Text("台灣 22 縣市天氣查詢 (中央氣象署)", font=("Helvetica", 20), text_color='#E0E0E0')],
    [
        sg.Text("請選擇縣市 (單點查詢)：", text_color='#E0E0E0'),
        sg.Combo(cities, key="-CITY-", default_value=cities[0], readonly=True, font=("Helvetica", 10), size=(15, 1)),
        sg.Button("查詢單一縣市", key="-QUERY_SINGLE-", font=("Helvetica", 10), button_color=('white', '#007AFF'))
    ],
    [sg.Button("查詢全部 22 縣市並繪製圖表", key="-QUERY_ALL-", font=("Helvetica", 10), button_color=('white', '#007AFF'))],
    [sg.Text("", key="-STATUS-", size=(50, 1), font=("Helvetica", 10), text_color='#FFCC00')], # 新增狀態欄
    [sg.HorizontalSeparator(pad=(0,10))],
    [sg.Column(info_column_layout), sg.VSeperator(), sg.Column(icon_column_layout)],
    [sg.HorizontalSeparator(pad=(0,10))],
    [sg.Text("溫度圖表", font=("Helvetica", 16), text_color='#E0E0E0')],
    [sg.Canvas(key="-CANVAS-", size=(800, 450))]
]

# --- 建立視窗 ---
window = sg.Window("天氣查詢 App", layout, finalize=True, background_color='#2C2C2C', grab_anywhere=True)
fig_agg = None

# --- 主迴圈 ---
while True:
    event, values = window.read()

    if event == sg.WIN_CLOSED:
        break

    if event == "-QUERY_SINGLE-":
        city = values["-CITY-"]
        window["-STATUS-"].update("") # 清除狀態
        window["-WEATHER-"].update("")
        window["-TEMP-"].update("")
        window["-POP-"].update("")
        window["-ICON-"].update("")
        window["-STATUS-"].update(f"正在查詢 {city}...")
        window.refresh()

        weather_data, error = get_weather(city)

        if weather_data:
            icon = WEATHER_ICONS.get(weather_data.get('weather_code'), '❓')
            window["-ICON-"].update(icon)
            window["-WEATHER-"].update(f"天氣現象: {weather_data['weather_state']}")
            window["-TEMP-"].update(f"溫度: {weather_data['temp']}°C")
            window["-POP-"].update(f"降雨機率: {weather_data['pop']}% ")
            window["-STATUS-"].update(f"{city} 查詢完成！")
        if error:
            sg.popup_error(error)
            window["-STATUS-"].update("查詢失敗")

    if event == "-QUERY_ALL-":
        window["-QUERY_ALL-"].update(disabled=True)
        window["-STATUS-"].update("正在查詢全部 22 縣市的資料，請稍候...")
        window.refresh()
        
        temps = {}
        for city in cities:
            weather_data, error = get_weather(city)
            if weather_data:
                temps[city] = int(weather_data['temp'])
            else:
                print(f"查詢 {city} 失敗: {error}")
                temps[city] = 0

        window["-STATUS-"].update("資料查詢完成，正在繪製圖表...")
        window.refresh()

        # --- 繪製美化後的圖表 ---
        if fig_agg:
            fig_agg.get_tk_widget().forget()
        
        plt.style.use('seaborn-v0_8-darkgrid')
        plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']
        plt.rcParams['axes.unicode_minus'] = False

        fig = plt.figure(figsize=(15, 6))
        
        temp_values = np.array(list(temps.values()))
        norm = plt.Normalize(temp_values.min() - 2, temp_values.max() + 2)
        cmap = plt.get_cmap('coolwarm')
        colors = cmap(norm(temp_values))

        bars = plt.bar(temps.keys(), temp_values, color=colors, zorder=2)
        
        for bar in bars:
            yval = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2.0, yval + 0.2, f'{yval}°', ha='center', va='bottom', fontsize=10)

        plt.xlabel("縣市", fontsize=12)
        plt.ylabel("溫度 (°C)", fontsize=12)
        plt.title("台灣 22 縣市溫度分佈圖", fontsize=16, weight='bold')
        plt.xticks(rotation=45, ha="right", fontsize=10)
        plt.yticks(fontsize=10)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        plt.tight_layout()

        fig_agg = draw_figure(window['-CANVAS-'].TKCanvas, fig)
        window["-STATUS-"].update("圖表繪製完成！")
        window["-QUERY_ALL-"].update(disabled=False)

window.close()