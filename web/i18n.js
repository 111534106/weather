// ==================== i18n Translation System ====================

// Translation Dictionary
const translations = {
    'zh-TW': {
        // Header
        'app.subtitle': '全台 22 縣市即時氣象資訊',

        // Search Section
        'search.selectCity': '選擇縣市',
        'search.placeholder': '搜尋縣市 (如：台北、Taipei)',
        'search.voiceInput': '語音輸入',
        'search.noResults': '找不到相符的縣市',
        'search.includes': '包含',
        'search.listening': '正在聆聽...',
        'search.queryWeather': '查詢天氣',
        'search.autoLocate': '自動定位所在縣市',

        // Result Cards
        'advice.title': '生活建議',
        'outfit.title': '建議穿搭',
        'sun.title': '今日天文資訊',
        'sun.sunrise': '日出',
        'sun.sunset': '日落',
        'sun.dayLength': '白天長度',
        'sun.hours': '小時',
        'sun.minutes': '分',

        // AQI Section
        'aqi.title': '空氣品質',
        'aqi.generalPublic': '一般民眾',
        'aqi.sensitiveGroup': '敏感族群',
        'aqi.pm25': '細懸浮微粒 (PM2.5)',
        'aqi.pollutant': '主要污染物',
        'aqi.healthAdvice': '健康建議',
        'aqi.outdoorActivity': '戶外活動',
        'aqi.maskWearing': '口罩配戴',
        'aqi.windowVentilation': '門窗通風',

        // AQI Levels
        'aqi.level.good': '良好',
        'aqi.level.moderate': '普通',
        'aqi.level.unhealthySensitive': '對敏感族群不健康',
        'aqi.level.unhealthy': '不健康',
        'aqi.level.veryUnhealthy': '非常不健康',
        'aqi.level.hazardous': '危害',
        'aqi.level.unknown': '資料不足',

        // Forecast
        'forecast.daytime': '白天',
        'forecast.nighttime': '夜晚',
        'forecast.week.sun': '週日',
        'forecast.week.mon': '週一',
        'forecast.week.tue': '週二',
        'forecast.week.wed': '週三',
        'forecast.week.thu': '週四',
        'forecast.week.fri': '週五',
        'forecast.week.sat': '週六',

        // Radar Section
        'radar.title': '即時雷達回波圖',
        'radar.updateTime': '更新時間',
        'radar.refresh': '重新整理雷達圖',
        'radar.legendTitle': '回波強度圖例',
        'radar.intensity.weak': '微弱',
        'radar.intensity.light': '輕度',
        'radar.intensity.moderate': '中度',
        'radar.intensity.strong': '強烈',
        'radar.intensity.severe': '劇烈',
        'radar.instruction': '可拖曳地圖或使用滑鼠滾輪縮放查看',
        'radar.source': '資料來源：中央氣象署 | 每 10 分鐘自動更新',

        // Buttons and Actions
        'button.viewAllCities': '查看全台溫度分佈',
        'button.themeToggle': '切換深色/淺色模式',
        'button.voiceBroadcast': '語音播報天氣',

        // Dividers
        'divider.more': '更多資訊',
        'divider.or': '或是',
        'divider.dataExport': '資料管理',

        // Footer
        'footer.lastUpdate': '最後更新',
        'footer.dataSource': 'Data Source: CWA (中央氣象署)',

        // Status Messages
        'status.querying': '正在查詢 {city} 的天氣...',
        'status.success': '成功取得 {city} 的天氣資料！',
        'status.error': '查詢失敗',
        'status.selectCity': '請選擇縣市',
        'status.locating': '正在取得您的位置...',
        'status.locationDetected': '偵測到您位於 {city} 附近',
        'status.locationFailed': '定位失敗',
        'status.noLocation': '無法判斷您的位置所屬縣市',
        'status.radarUpdated': '雷達圖已更新',
        'status.queryingAll': '正在查詢全台資料（請稍候...）',
        'status.allCitiesSuccess': '全台資料查詢完成！',

        // Outfit Recommendations
        'outfit.shortSleeve': '短袖 + 防曬',
        'outfit.shortSleeveOnly': '短袖即可',
        'outfit.longSleeve': '長袖或薄外套',
        'outfit.longSleeveJacket': '長袖 + 外套',
        'outfit.thickJacket': '厚外套 + 圍巾',
        'outfit.winter': '厚外套 + 圍巾 + 毛帽',
        'outfit.rainGear': '雨具',
        'outfit.layering': '（洋蔥式穿搭）',
        'outfit.comfortable': '依個人舒適度穿著',

        // Weather Conditions
        'weather.clear': '晴',
        'weather.partlyCloudy': '多雲時晴',
        'weather.cloudy': '多雲',
        'weather.mostlyCloudy': '陰時多雲',
        'weather.overcast': '陰',
        'weather.briefShowers': '短暫雨',
        'weather.showers': '陣雨',
        'weather.thunderstorm': '雷雨',

        // Data Export
        'export.title': '天氣資料匯出',
        'export.totalRecords': '總記錄數',
        'export.dateRange': '資料範圍',
        'export.startDate': '開始日期',
        'export.endDate': '結束日期',
        'export.filterCity': '篩選城市',
        'export.allCities': '全部城市',
        'export.exportCsv': '匯出 CSV',
        'export.exportExcel': '匯出 Excel',
        'export.exportJson': '匯出 JSON',
        'export.noData': '目前沒有可匯出的資料',
        'export.downloading': '下載中...',
        'export.success': '匯出成功！',
        'export.info': '每次天氣查詢都會自動記錄，您可以隨時匯出歷史資料進行分析',
    },

    'en': {
        // Header
        'app.subtitle': 'Real-time Weather for 22 Cities in Taiwan',

        // Search Section
        'search.selectCity': 'Select City',
        'search.placeholder': 'Search city (e.g., Taipei, 台北)',
        'search.voiceInput': 'Voice Input',
        'search.noResults': 'No matching cities found',
        'search.includes': 'Includes',
        'search.listening': 'Listening...',
        'search.queryWeather': 'Check Weather',
        'search.autoLocate': 'Auto Locate',

        // Result Cards
        'advice.title': 'Life Advice',
        'outfit.title': 'Outfit Recommendation',
        'sun.title': 'Astronomical Info',
        'sun.sunrise': 'Sunrise',
        'sun.sunset': 'Sunset',
        'sun.dayLength': 'Day Length',
        'sun.hours': 'hrs',
        'sun.minutes': 'min',

        // AQI Section
        'aqi.title': 'Air Quality',
        'aqi.generalPublic': 'General Public',
        'aqi.sensitiveGroup': 'Sensitive Groups',
        'aqi.pm25': 'Fine Particulate Matter (PM2.5)',
        'aqi.pollutant': 'Main Pollutant',
        'aqi.healthAdvice': 'Health Recommendations',
        'aqi.outdoorActivity': 'Outdoor Activity',
        'aqi.maskWearing': 'Mask Wearing',
        'aqi.windowVentilation': 'Window Ventilation',

        // AQI Levels
        'aqi.level.good': 'Good',
        'aqi.level.moderate': 'Moderate',
        'aqi.level.unhealthySensitive': 'Unhealthy for Sensitive Groups',
        'aqi.level.unhealthy': 'Unhealthy',
        'aqi.level.veryUnhealthy': 'Very Unhealthy',
        'aqi.level.hazardous': 'Hazardous',
        'aqi.level.unknown': 'No Data',

        // Forecast
        'forecast.daytime': 'Day',
        'forecast.nighttime': 'Night',
        'forecast.week.sun': 'Sun',
        'forecast.week.mon': 'Mon',
        'forecast.week.tue': 'Tue',
        'forecast.week.wed': 'Wed',
        'forecast.week.thu': 'Thu',
        'forecast.week.fri': 'Fri',
        'forecast.week.sat': 'Sat',

        // Radar Section
        'radar.title': 'Live Radar Map',
        'radar.updateTime': 'Updated',
        'radar.refresh': 'Refresh Radar',
        'radar.legendTitle': 'Intensity Legend',
        'radar.intensity.weak': 'Weak',
        'radar.intensity.light': 'Light',
        'radar.intensity.moderate': 'Moderate',
        'radar.intensity.strong': 'Strong',
        'radar.intensity.severe': 'Severe',
        'radar.instruction': 'Drag to pan or scroll to zoom',
        'radar.source': 'Data Source: CWA | Auto-updates every 10 minutes',

        // Buttons and Actions
        'button.viewAllCities': 'View Temperature Distribution',
        'button.themeToggle': 'Toggle Light/Dark Mode',
        'button.voiceBroadcast': 'Voice Broadcast',

        // Dividers
        'divider.more': 'More Info',
        'divider.or': 'Or',
        'divider.dataExport': 'Data Management',

        // Footer
        'footer.lastUpdate': 'Last Update',
        'footer.dataSource': 'Data Source: Central Weather Administration (CWA)',

        // Status Messages
        'status.querying': 'Querying weather for {city}...',
        'status.success': 'Successfully retrieved weather data for {city}!',
        'status.error': 'Query failed',
        'status.selectCity': 'Please select a city',
        'status.locating': 'Getting your location...',
        'status.locationDetected': 'Detected near {city}',
        'status.locationFailed': 'Location failed',
        'status.noLocation': 'Unable to determine your city',
        'status.radarUpdated': 'Radar updated',
        'status.queryingAll': 'Querying all cities (please wait...)',
        'status.allCitiesSuccess': 'All cities data retrieved!',

        // Outfit Recommendations
        'outfit.shortSleeve': 'Short sleeves + Sun protection',
        'outfit.shortSleeveOnly': 'Short sleeves',
        'outfit.longSleeve': 'Long sleeves or light jacket',
        'outfit.longSleeveJacket': 'Long sleeves + Jacket',
        'outfit.thickJacket': 'Thick jacket + Scarf',
        'outfit.winter': 'Thick jacket + Scarf + Hat',
        'outfit.rainGear': 'Rain gear',
        'outfit.layering': '(Layering recommended)',
        'outfit.comfortable': 'Dress comfortably',

        // Weather Conditions
        'weather.clear': 'Clear',
        'weather.partlyCloudy': 'Partly Cloudy',
        'weather.cloudy': 'Cloudy',
        'weather.mostlyCloudy': 'Mostly Cloudy',
        'weather.overcast': 'Overcast',
        'weather.briefShowers': 'Brief Showers',
        'weather.showers': 'Showers',
        'weather.thunderstorm': 'Thunderstorm',

        // Data Export
        'export.title': 'Weather Data Export',
        'export.totalRecords': 'Total Records',
        'export.dateRange': 'Date Range',
        'export.startDate': 'Start Date',
        'export.endDate': 'End Date',
        'export.filterCity': 'Filter by City',
        'export.allCities': 'All Cities',
        'export.exportCsv': 'Export CSV',
        'export.exportExcel': 'Export Excel',
        'export.exportJson': 'Export JSON',
        'export.noData': 'No data available for export',
        'export.downloading': 'Downloading...',
        'export.success': 'Export successful!',
        'export.info': 'All weather queries are automatically logged. You can export historical data anytime for analysis',
    }
};

// City Name Translations
const cityNames = {
    'zh-TW': {
        '臺北市': '臺北市',
        '新北市': '新北市',
        '基隆市': '基隆市',
        '桃園市': '桃園市',
        '新竹市': '新竹市',
        '新竹縣': '新竹縣',
        '苗栗縣': '苗栗縣',
        '臺中市': '臺中市',
        '彰化縣': '彰化縣',
        '南投縣': '南投縣',
        '雲林縣': '雲林縣',
        '嘉義市': '嘉義市',
        '嘉義縣': '嘉義縣',
        '臺南市': '臺南市',
        '高雄市': '高雄市',
        '屏東縣': '屏東縣',
        '宜蘭縣': '宜蘭縣',
        '花蓮縣': '花蓮縣',
        '臺東縣': '臺東縣',
        '澎湖縣': '澎湖縣',
        '金門縣': '金門縣',
        '連江縣': '連江縣'
    },
    'en': {
        '臺北市': 'Taipei City',
        '新北市': 'New Taipei City',
        '基隆市': 'Keelung City',
        '桃園市': 'Taoyuan City',
        '新竹市': 'Hsinchu City',
        '新竹縣': 'Hsinchu County',
        '苗栗縣': 'Miaoli County',
        '臺中市': 'Taichung City',
        '彰化縣': 'Changhua County',
        '南投縣': 'Nantou County',
        '雲林縣': 'Yunlin County',
        '嘉義市': 'Chiayi City',
        '嘉義縣': 'Chiayi County',
        '臺南市': 'Tainan City',
        '高雄市': 'Kaohsiung City',
        '屏東縣': 'Pingtung County',
        '宜蘭縣': 'Yilan County',
        '花蓮縣': 'Hualien County',
        '臺東縣': 'Taitung County',
        '澎湖縣': 'Penghu County',
        '金門縣': 'Kinmen County',
        '連江縣': 'Lienchiang County'
    }
};

// Get current language from localStorage
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'zh-TW';
}

// Translation function with parameter interpolation
function t(key, params = {}) {
    const lang = getCurrentLanguage();
    let text = translations[lang]?.[key] || translations['zh-TW'][key] || key;

    // Support parameter interpolation (e.g., "Querying {city}...")
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });

    return text;
}

// Get translated city name
function getCityName(city, lang = null) {
    lang = lang || getCurrentLanguage();
    return cityNames[lang]?.[city] || city;
}

// Get translated day of week
function getDayOfWeekTranslated(dateStr) {
    const date = new Date(dateStr);
    const dayIndex = date.getDay();
    const dayKeys = [
        'forecast.week.sun',
        'forecast.week.mon',
        'forecast.week.tue',
        'forecast.week.wed',
        'forecast.week.thu',
        'forecast.week.fri',
        'forecast.week.sat'
    ];
    return t(dayKeys[dayIndex]);
}

// Get translated time period
function getTimePeriodTranslated(startTime) {
    const hour = new Date(startTime).getHours();
    return (hour >= 6 && hour < 18) ? t('forecast.daytime') : t('forecast.nighttime');
}
