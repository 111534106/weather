// Global variable to track currently queried city (for favorites feature)
let currentQueryCity = null;

document.addEventListener('DOMContentLoaded', () => {
    const btnSingle = document.getElementById('btn-query-single');
    const btnAll = document.getElementById('btn-query-all');
    const btnLocate = document.getElementById('btn-locate');
    const statusMsg = document.getElementById('status-message');
    const singleResult = document.getElementById('single-result');
    const forecastContainer = document.getElementById('forecast-container');
    const adviceText = document.getElementById('advice-text');
    const chartContainer = document.getElementById('chart-container');
    const lastUpdate = document.getElementById('last-update');
    const sunriseTime = document.getElementById('sunrise-time');
    const sunsetTime = document.getElementById('sunset-time');
    const dayLength = document.getElementById('day-length');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const voiceBtn = document.getElementById('voice-btn');
    const aqiCard = document.querySelector('.aqi-card');
    const aqiValue = document.getElementById('aqi-value');
    const aqiStatus = document.getElementById('aqi-status');
    const pm25Value = document.getElementById('pm25-value');
    const pollutantValue = document.getElementById('pollutant-value');

    // Smart Search Elements
    const citySearchInput = document.getElementById('city-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    const btnVoice = document.getElementById('btn-voice');
    let selectedCity = null;  // Currently selected city
    let selectedSuggestionIndex = -1;  // For keyboard navigation

    let weatherChart = null;

    // Theme Toggle Logic
    const html = document.documentElement;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            // In dark mode, show sun icon (click to go light)
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            // In light mode, show moon icon (click to go dark)
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Check if running on file protocol
    if (window.location.protocol === 'file:') {
        const errorMsg = "⚠️ 警告：您正在直接開啟檔案 (file://)。\\nAPI 功能將無法運作！\\n請使用 Python 啟動伺服器：\\n1. cd backend\\n2. python app.py\\n3. 開啟 http://127.0.0.1:5000";
        alert(errorMsg);
        updateStatus("請使用 Python Server 啟動網頁，否則無法查詢天氣。", 'error');
        // Disable buttons to prevent confusion
        btnSingle.disabled = true;
        btnAll.disabled = true;
        return;
    }

    // City Coordinates (based on city hall/government center locations)
    const CITY_COORDS = {
        "臺北市": { lat: 25.0478, lon: 121.5170 },  // 台北市政府
        "新北市": { lat: 25.0126, lon: 121.4657 },  // 新北市政府（板橋）
        "基隆市": { lat: 25.1285, lon: 121.7419 },  // 基隆市政府
        "桃園市": { lat: 24.9937, lon: 121.3009 },  // 桃園市政府
        "新竹市": { lat: 24.8067, lon: 120.9686 },  // 新竹市政府
        "新竹縣": { lat: 24.8388, lon: 121.0177 },  // 新竹縣政府（竹北）
        "苗栗縣": { lat: 24.5602, lon: 120.8214 },  // 苗栗縣政府
        "臺中市": { lat: 24.1627, lon: 120.6471 },  // 台中市政府
        "彰化縣": { lat: 24.0757, lon: 120.5169 },  // 彰化縣政府
        "南投縣": { lat: 23.9096, lon: 120.6856 },  // 南投縣政府
        "雲林縣": { lat: 23.7070, lon: 120.4313 },  // 雲林縣政府（斗六）
        "嘉義市": { lat: 23.4800, lon: 120.4491 },  // 嘉義市政府
        "嘉義縣": { lat: 23.4594, lon: 120.2554 },  // 嘉義縣政府（太保）
        "臺南市": { lat: 22.9908, lon: 120.2133 },  // 台南市政府
        "高雄市": { lat: 22.6203, lon: 120.3120 },  // 高雄市政府
        "屏東縣": { lat: 22.6689, lon: 120.4883 },  // 屏東縣政府
        "宜蘭縣": { lat: 24.7472, lon: 121.7542 },  // 宜蘭縣政府
        "花蓮縣": { lat: 23.9933, lon: 121.6015 },  // 花蓮縣政府
        "臺東縣": { lat: 22.7583, lon: 121.1444 },  // 台東縣政府
        "澎湖縣": { lat: 23.5665, lon: 119.5794 },  // 澎湖縣政府（馬公）
        "金門縣": { lat: 24.4362, lon: 118.3175 },  // 金門縣政府
        "連江縣": { lat: 26.1605, lon: 119.9511 }   // 連江縣政府（南竿）
    };

    // ==================== Smart City Search Integration ====================


    // Search input event listener
    if (citySearchInput) {
        citySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            if (query === '') {
                hideSuggestions();
                selectedCity = null;
                return;
            }

            // Search cities using CitySearch module
            const results = CitySearch.searchCities(query);
            showSuggestions(results, query);
        });

        // Show all cities when input is focused and empty
        citySearchInput.addEventListener('focus', (e) => {
            const query = e.target.value.trim();

            if (query === '') {
                // Show all cities
                const allCities = Object.keys(CitySearch.CITY_SEARCH_DATA).map(city => ({
                    city: city,
                    score: 50,
                    matchType: 'all'
                }));
                showSuggestions(allCities, '');
            } else {
                // Show search results
                const results = CitySearch.searchCities(query);
                showSuggestions(results, query);
            }
        });

        // Keyboard navigation
        citySearchInput.addEventListener('keydown', (e) => {
            const suggestions = searchSuggestions.querySelectorAll('.suggestion-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSelectedSuggestion(suggestions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSelectedSuggestion(suggestions);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                    const city = suggestions[selectedSuggestionIndex].dataset.city;
                    selectCity(city);
                } else if (selectedCity) {
                    // If a city is already selected, query it
                    fetchWeather(selectedCity);
                    showRadarSection();
                }
            } else if (e.key === 'Escape') {
                hideSuggestions();
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!citySearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                hideSuggestions();
            }
        });
    }

    // Voice input button
    if (btnVoice) {
        btnVoice.addEventListener('click', () => {
            if (CitySearch.isVoiceRecognitionActive()) {
                CitySearch.stopVoiceRecognition();
                btnVoice.classList.remove('listening');
                updateStatus('', 'info');
                return;
            }

            btnVoice.classList.add('listening');
            updateStatus(t('search.listening'), 'info');

            CitySearch.startVoiceRecognition(
                (result) => {
                    // Voice recognition successful
                    btnVoice.classList.remove('listening');
                    citySearchInput.value = result;

                    // Search with voice result
                    const searchResults = CitySearch.searchCities(result);
                    if (searchResults.length > 0) {
                        selectCity(searchResults[0].city);
                        fetchWeather(searchResults[0].city);
                        showRadarSection();
                    } else {
                        updateStatus(t('search.noResults'), 'error');
                    }
                },
                (error) => {
                    // Voice recognition error
                    btnVoice.classList.remove('listening');
                    updateStatus(error, 'error');
                }
            );
        });
    }

    // Initialize Statistics (Feature #13)
    initStats();

    // Initialize Recommendation (Feature #18)
    initRecommendation();

    // Initialize Alerts (Feature #15)
    initAlerts();

    // Initialize Favorites (CRUD Feature)
    initFavorites();

    // 效能優化調整：雷達區塊可見，但延遲初始化地圖以平衡效能與 UX
    // 顯示雷達區塊但延遲 3 秒載入實際地圖資料
    const radarSectionElement = document.getElementById('radar-section');
    if (radarSectionElement) {
        radarSectionElement.classList.remove('hidden');  // 讓區塊可見
        setTimeout(() => {
            initRadarMap();  // 延遲載入地圖
        }, 3000);
    }

    // Show suggestions dropdown
    function showSuggestions(results, query) {
        if (results.length === 0) {
            searchSuggestions.innerHTML = `<div class="no-results">${t('search.noResults')}</div>`;
            searchSuggestions.classList.remove('hidden');
            return;
        }

        searchSuggestions.innerHTML = '';
        selectedSuggestionIndex = -1;

        results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.dataset.city = result.city;

            const cityName = getCityName(result.city);
            let displayText = cityName;

            // Highlight city name matches
            if (result.matchType !== 'landmark' && query) {
                displayText = CitySearch.highlightMatch(cityName, query);
            }

            // Add landmark hint if matched
            if (result.matchedLandmark) {
                const highlightedLandmark = CitySearch.highlightMatch(result.matchedLandmark, query);
                displayText += ` <span class="landmark-hint">(${t('search.includes')}: ${highlightedLandmark})</span>`;
            }

            item.innerHTML = `
                <i class="fa-solid fa-location-dot"></i>
                <span>${displayText}</span>
            `;

            item.addEventListener('click', () => {
                selectCity(result.city);
            });

            searchSuggestions.appendChild(item);
        });

        searchSuggestions.classList.remove('hidden');
    }

    // Hide suggestions dropdown
    function hideSuggestions() {
        searchSuggestions.classList.add('hidden');
        selectedSuggestionIndex = -1;
    }

    // Update selected suggestion with keyboard navigation
    function updateSelectedSuggestion(suggestions) {
        suggestions.forEach((item, index) => {
            if (index === selectedSuggestionIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Select a city
    function selectCity(city) {
        selectedCity = city;
        citySearchInput.value = getCityName(city);
        hideSuggestions();
        updateStatus(t('status.querying', { city: getCityName(city) }), 'info');

        // Auto-fetch weather when a city is selected
        fetchWeather(city);
    }


    // Weather icon mapping
    const WEATHER_ICONS = {
        '1': 'fa-solid fa-sun',
        '2': 'fa-solid fa-cloud-sun',
        '3': 'fa-solid fa-cloud-sun',
        '4': 'fa-solid fa-cloud',
        '5': 'fa-solid fa-cloud',
        '6': 'fa-solid fa-cloud-rain',
        '7': 'fa-solid fa-cloud-showers-heavy',
        '8': 'fa-solid fa-cloud-bolt',
        // Two-digit codes for 7-day forecast
        '01': 'fa-solid fa-sun',
        '02': 'fa-solid fa-cloud-sun',
        '03': 'fa-solid fa-cloud-sun',
        '04': 'fa-solid fa-cloud',
        '05': 'fa-solid fa-cloud',
        '06': 'fa-solid fa-cloud-rain',
        '07': 'fa-solid fa-cloud-showers-heavy',
        '08': 'fa-solid fa-cloud-bolt',
        '09': 'fa-solid fa-cloud',
        '10': 'fa-solid fa-cloud',
        '11': 'fa-solid fa-cloud-rain',
        '12': 'fa-solid fa-cloud-rain',
        '13': 'fa-solid fa-cloud-rain',
        '14': 'fa-solid fa-cloud-rain',
        '15': 'fa-solid fa-cloud-showers-heavy',
        '16': 'fa-solid fa-cloud-showers-heavy',
        '17': 'fa-solid fa-cloud-showers-heavy',
        '18': 'fa-solid fa-cloud-showers-heavy',
        '19': 'fa-solid fa-wind',
        '20': 'fa-solid fa-wind',
        '21': 'fa-solid fa-wind',
        '22': 'fa-solid fa-wind',
        '23': 'fa-solid fa-cloud-rain',
        '24': 'fa-solid fa-cloud-showers-heavy',
        '25': 'fa-solid fa-cloud-bolt',
        '26': 'fa-solid fa-cloud-bolt',
        '27': 'fa-solid fa-cloud-bolt',
        '28': 'fa-solid fa-cloud-bolt',
        '29': 'fa-solid fa-snowflake',
        '30': 'fa-solid fa-wind',
        '31': 'fa-solid fa-wind',
        '32': 'fa-solid fa-wind',
        '33': 'fa-solid fa-wind',
        '34': 'fa-solid fa-wind',
        '35': 'fa-solid fa-wind',
        '36': 'fa-solid fa-wind',
        '37': 'fa-solid fa-wind',
        '38': 'fa-solid fa-wind',
        '39': 'fa-solid fa-wind',
        '40': 'fa-solid fa-wind',
        '41': 'fa-solid fa-tornado',
        '42': 'fa-solid fa-snowflake'
    }

    // AQI Level Mapping
    const AQI_LEVELS = {
        'good': {
            text: '良好',
            color: '#10b981',
            emoji: '😊',
            healthImpact: '空氣品質優良，正常活動',
            sensitiveGroup: '無影響',
            activity: '盡情享受戶外活動',
            mask: '不需要配戴',
            window: '開窗通風，呼吸新鮮空氣'
        },
        'moderate': {
            text: '普通',
            color: '#f59e0b',
            emoji: '😐',
            healthImpact: '可正常活動',
            sensitiveGroup: '極少數敏感者應留意',
            activity: '可正常活動，敏感者留意',
            mask: '不需要配戴（敏感者可戴）',
            window: '可適度開窗'
        },
        'unhealthy-sensitive': {
            text: '對敏感族群不健康',
            color: '#f97316',
            emoji: '😷',
            healthImpact: '一般人可正常活動',
            sensitiveGroup: '應減少長時間劇烈戶外活動',
            activity: '減少長時間劇烈活動',
            mask: '敏感族群建議配戴',
            window: '減少開窗時間'
        },
        'unhealthy': {
            text: '不健康',
            color: '#ef4444',
            emoji: '😨',
            healthImpact: '應適度減少戶外活動',
            sensitiveGroup: '應避免長時間劇烈戶外活動',
            activity: '減少戶外活動時間',
            mask: '建議配戴口罩',
            window: '減少開窗，使用空氣清淨機'
        },
        'very-unhealthy': {
            text: '非常不健康',
            color: '#a855f7',
            emoji: '😱',
            healthImpact: '應減少戶外活動',
            sensitiveGroup: '應避免所有戶外活動',
            activity: '避免戶外活動',
            mask: '外出務必配戴',
            window: '關閉門窗，使用空氣清淨機'
        },
        'hazardous': {
            text: '危害',
            color: '#7f1d1d',
            emoji: '☠️',
            healthImpact: '應避免外出，留在室內',
            sensitiveGroup: '應留在室內並關閉門窗',
            activity: '留在室內',
            mask: '避免外出，外出務必配戴',
            window: '緊閉門窗，開啟空氣清淨機'
        },
        'unknown': {
            text: '資料不足',
            color: '#6b7280',
            emoji: '❓',
            healthImpact: '資料不足',
            sensitiveGroup: '資料不足',
            activity: '資料不足',
            mask: '資料不足',
            window: '資料不足'
        }
    };

    // Outfit Recommendation Logic
    function getOutfitAdvice(minTemp, maxTemp, pop) {
        try {
            const min = parseInt(minTemp);
            const max = parseInt(maxTemp);
            const avgTemp = (min + max) / 2;
            const rainProb = parseInt(pop);

            let icons = '';
            let text = '';

            // Temperature-based outfit
            if (avgTemp >= 30) {
                icons = '👕🧢☀️';
                text = '短袖 + 防曬';
            } else if (avgTemp >= 25) {
                icons = '👕';
                text = '短袖即可';
            } else if (avgTemp >= 20) {
                icons = '👔🧥';
                text = '長袖或薄外套';
            } else if (avgTemp >= 15) {
                icons = '👔🧥';
                text = '長袖 + 外套';
            } else if (avgTemp >= 10) {
                icons = '🧥🧣';
                text = '厚外套 + 圍巾';
            } else {
                icons = '🧥🧣🎩';
                text = '厚外套 + 圍巾 + 毛帽';
            }

            // Add rain gear if needed
            if (rainProb >= 70) {
                icons += ' ☔';
                text += ' + 雨具';
            }

            // Temperature difference check
            const tempDiff = max - min;
            if (tempDiff >= 10) {
                text += '（洋蔥式穿搭）';
            }

            return { icons, text };
        } catch (e) {
            return { icons: '👕', text: '依個人舒適度穿著' };
        }
    }

    // Helper functions
    function updateStatus(message, type = 'info') {
        statusMsg.textContent = message;
        statusMsg.className = `status ${type}`;
        statusMsg.style.display = 'block';
    }

    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdate.textContent = `最後更新：${timeStr}`;
    }

    function getDayOfWeek(dateStr) {
        const date = new Date(dateStr);
        const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        return days[date.getDay()];
    }

    function getTimePeriod(timeStr) {
        const hour = parseInt(timeStr.split(':')[0]);
        return hour >= 6 && hour < 18 ? '白天' : '夜晚';
    }

    function updateSunTimes(city) {
        const coords = CITY_COORDS[city];
        if (!coords) {
            sunriseTime.textContent = '--:--';
            sunsetTime.textContent = '--:--';
            dayLength.textContent = '-- 小時 -- 分';
            return;
        }

        const now = new Date();
        const times = SunCalc.getTimes(now, coords.lat, coords.lon);

        const sunriseStr = formatTime(times.sunrise);
        const sunsetStr = formatTime(times.sunset);

        sunriseTime.textContent = sunriseStr;
        sunsetTime.textContent = sunsetStr;

        const dayLengthMs = times.sunset - times.sunrise;
        const hours = Math.floor(dayLengthMs / (1000 * 60 * 60));
        const minutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
        dayLength.textContent = `${hours} 小時 ${minutes} 分`;
    }

    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Fetch weather data
    function fetchWeather(city) {
        // Stop any ongoing speech and reset voice button
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (voiceBtn) {
            voiceBtn.classList.remove('speaking', 'paused');
            const icon = voiceBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-volume-high';
        }

        // Track the queried city for favorites feature (Moved to success block)
        updateStatus(`正在查詢 ${city} 的天氣...`, 'info');

        fetch(`/api/weather/${city}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    updateStatus(data.error, 'error');
                    return;
                }

                // Track the successfully queried city for favorites and voice feature
                currentQueryCity = city;

                updateStatus(`成功取得 ${city} 的天氣資料！`, 'success');
                updateTime();
                singleResult.classList.remove('hidden');
                renderForecast(data.data);
                adviceText.textContent = data.advice || '暫無建議';

                // Show add-to-favorites button
                const btnAddFavorite = document.getElementById('btn-add-favorite');
                if (btnAddFavorite) {
                    btnAddFavorite.classList.remove('hidden');
                }

                // Add outfit recommendation with visual feedback
                if (data.data && data.data.length > 0) {
                    const first = data.data[0];
                    const outfit = getOutfitAdvice(first.min_temp, first.max_temp, first.pop);
                    const outfitIcons = document.getElementById('outfit-icons');
                    const outfitText = document.getElementById('outfit-text');

                    if (outfitIcons && outfitText) {
                        // Add fade animation for visual feedback
                        outfitIcons.style.opacity = '0';
                        outfitText.style.opacity = '0';

                        setTimeout(() => {
                            outfitIcons.textContent = outfit.icons;
                            outfitText.textContent = outfit.text;
                            outfitIcons.style.opacity = '1';
                            outfitText.style.opacity = '1';
                        }, 150);

                        console.log(`穿搭建議已更新: ${outfit.text}`);
                    }
                }



                updateSunTimes(city);
                updateAQI(data.aqi);

                // [Feature #13] Auto-sync stats filter and update
                const statsCityFilter = document.getElementById('stats-city-filter');
                if (statsCityFilter) {
                    // Slight delay to ensure DB write (in background) is processed
                    setTimeout(async () => {
                        // Check if option exists, reload if new city added
                        let optionExists = Array.from(statsCityFilter.options).some(opt => opt.value === city);
                        if (!optionExists) {
                            await loadStatsCities();
                        }

                        statsCityFilter.value = city;
                        // Trigger stats refresh for this city
                        fetchWeatherStats(city);
                    }, 500);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                updateStatus(`查詢失敗：${error.message}`, 'error');
            });
    }
    // Expose fetchWeather to global scope for favorites feature
    window.fetchWeather = fetchWeather;

    // Update AQI display
    function updateAQI(aqiData) {
        if (!aqiData || aqiData.aqi === '-') {
            aqiCard.classList.add('hidden');
            return;
        }

        aqiCard.classList.remove('hidden');

        // Get AQI level info
        const levelInfo = AQI_LEVELS[aqiData.level] || AQI_LEVELS['unknown'];

        // Update main AQI values
        aqiValue.textContent = aqiData.aqi;
        aqiValue.style.color = levelInfo.color;

        // Update emoji
        const aqiEmoji = document.getElementById('aqi-emoji');
        if (aqiEmoji) {
            aqiEmoji.textContent = levelInfo.emoji;
        }

        // Update status
        aqiStatus.textContent = levelInfo.text;
        aqiStatus.style.color = levelInfo.color;

        // Update PM2.5 with simplified display
        const pm25Display = document.getElementById('pm25-value');
        if (pm25Display && aqiData.pm25 !== '-') {
            // Get PM2.5 level
            const pm25Value = parseFloat(aqiData.pm25);
            let pm25Level = '';
            if (pm25Value <= 15) pm25Level = '良好';
            else if (pm25Value <= 35) pm25Level = '普通';
            else if (pm25Value <= 54) pm25Level = '對敏感族群不健康';
            else if (pm25Value <= 150) pm25Level = '不健康';
            else if (pm25Value <= 250) pm25Level = '非常不健康';
            else pm25Level = '危害';

            pm25Display.innerHTML = `<strong>${aqiData.pm25}</strong> μg/m³ · ${pm25Level}`;
        } else if (pm25Display) {
            pm25Display.textContent = '--';
        }

        // Update pollutant
        pollutantValue.textContent = aqiData.pollutant !== '-' ? aqiData.pollutant : '--';

        // Update health impact descriptions
        const healthImpactEl = document.getElementById('health-impact');
        const sensitiveGroupEl = document.getElementById('sensitive-group');
        if (healthImpactEl) healthImpactEl.textContent = levelInfo.healthImpact;
        if (sensitiveGroupEl) sensitiveGroupEl.textContent = levelInfo.sensitiveGroup;

        // Update recommendation cards
        const activityRec = document.getElementById('activity-rec');
        const maskRec = document.getElementById('mask-rec');
        const windowRec = document.getElementById('window-rec');

        if (activityRec) activityRec.textContent = levelInfo.activity;
        if (maskRec) maskRec.textContent = levelInfo.mask;
        if (windowRec) windowRec.textContent = levelInfo.window;

        // Apply color to recommendations based on level
        const recCards = document.querySelectorAll('.recommendation-card');
        recCards.forEach(card => {
            card.style.borderColor = levelInfo.color + '40'; // 25% opacity
        });
    }

    // Helper functions for forecast display
    function getDayOfWeek(dateStr) {
        const date = new Date(dateStr);
        const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        return days[date.getDay()];
    }

    function getTimePeriod(startTime) {
        const hour = new Date(startTime).getHours();
        return (hour >= 6 && hour < 18) ? '白天' : '夜晚';
    }

    // Render forecast
    function renderForecast(data) {
        forecastContainer.innerHTML = '';

        if (!data || data.length === 0) {
            forecastContainer.innerHTML = '<p>無預報資料</p>';
            return;
        }

        const forecastGrid = document.createElement('div');
        forecastGrid.className = 'forecast-grid';

        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            const dateObj = new Date(item.start_time);
            const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;
            const dayOfWeek = getDayOfWeek(item.start_time);
            const timePeriod = item.time_period || getTimePeriod(item.start_time);

            if (timePeriod === '夜晚') {
                card.classList.add('night-period');
            }

            const weatherCode = item.weather_code || '4';
            const iconClass = WEATHER_ICONS[weatherCode] || 'fa-solid fa-question';

            // Add umbrella icon only when there's data
            const popDisplay = (item.pop === '-' || item.pop === '' || item.pop === null) ?
                '<span class="forecast-pop-na">N/A</span>' :
                `☔ ${item.pop}%`;

            // Outfit Advice
            const outfit = getOutfitAdvice(item.min_temp, item.max_temp, item.pop);

            card.innerHTML = `
                <div class="forecast-date">${dateStr} (${dayOfWeek})</div>
                <div class="forecast-time">${timePeriod}</div>
                <i class="${iconClass} forecast-icon"></i>
                <div class="forecast-weather">${item.weather_state}</div>
                <div class="forecast-temp">${item.min_temp}° - ${item.max_temp}°C</div>
                <div class="forecast-pop">${popDisplay}</div>
                
                <!-- New Suggestions -->
                <div class="forecast-outfit">
                    <div style="font-size: 1.2em; margin-bottom: 2px;">${outfit.icons}</div>
                    <div>${outfit.text}</div>
                </div>
                ${item.advice ? `<div class="forecast-advice">${item.advice}</div>` : ''}
            `;

            forecastGrid.appendChild(card);
        });

        forecastContainer.appendChild(forecastGrid);
    }

    // Event listeners
    btnSingle.addEventListener('click', () => {
        const city = selectedCity || citySearchInput.value.trim();
        if (!city) {
            updateStatus(t('status.selectCity'), 'error');
            return;
        }

        // Try to find exact  match if not already selected
        if (!selectedCity) {
            const searchResults = CitySearch.searchCities(city);
            if (searchResults.length > 0) {
                selectCity(searchResults[0].city);
                fetchWeather(searchResults[0].city);
                showRadarSection();
            } else {
                updateStatus(t('search.noResults'), 'error');
            }
        } else {
            fetchWeather(city);
            showRadarSection();
        }
    });

    btnLocate.addEventListener('click', () => {
        if (!navigator.geolocation) {
            updateStatus(t('status.locationFailed'), 'error');
            return;
        }

        updateStatus(t('status.locating'), 'info');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                let nearestCity = null;
                let minDistance = Infinity;

                for (const [city, coords] of Object.entries(CITY_COORDS)) {
                    const distance = Math.sqrt(
                        Math.pow(lat - coords.lat, 2) + Math.pow(lon - coords.lon, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCity = city;
                    }
                }

                if (nearestCity) {
                    selectCity(nearestCity);
                    updateStatus(t('status.locationDetected', { city: getCityName(nearestCity) }), 'success');
                    showRadarSection();
                } else {
                    updateStatus(t('status.noLocation'), 'error');
                }
            },
            (error) => {
                updateStatus(`${t('status.locationFailed')}：${error.message}`, 'error');
            }
        );
    });



    // ==================== Radar Map ====================
    let radarMap = null;
    let radarLayer = null;
    const radarSection = document.getElementById('radar-section');
    const radarRefreshBtn = document.getElementById('radar-refresh-btn');

    // Function to show radar section
    function showRadarSection() {
        if (radarSection && radarSection.classList.contains('hidden')) {
            radarSection.classList.remove('hidden');
            // Initialize map only once, when first needed
            if (!radarMap) {
                setTimeout(() => {
                    initRadarMap();
                }, 100);  // 短暫延遲確保 DOM 已渲染
            }
        }
    }



    function initRadarMap() {
        try {
            // Create map centered on Taiwan with all interactions disabled
            radarMap = L.map('radar-map', {
                // 禁用所有互動功能
                zoomControl: false,        // 移除縮放按鈕
                attributionControl: false,
                scrollWheelZoom: false,    // 禁用滑鼠滾輪縮放
                doubleClickZoom: false,    // 禁用雙擊縮放
                dragging: false,           // 禁用拖曳
                touchZoom: false,          // 禁用觸控縮放
                boxZoom: false,            // 禁用框選縮放
                keyboard: false            // 禁用鍵盤控制
            }).setView([23.6, 120.9], 7.4);

            // No tile layer - using solid background from CSS

            // Force map to recalculate size after a small delay
            setTimeout(() => {
                if (radarMap) {
                    radarMap.invalidateSize();
                }
            }, 100);

            // Add radar overlay
            updateRadarLayer();

            // Auto-refresh every 10 minutes
            setInterval(updateRadarLayer, 10 * 60 * 1000);
        } catch (error) {
            console.error('Failed to initialize radar map:', error);
        }
    }


    function updateRadarLayer() {
        if (!radarMap) return;

        // Remove old layer
        if (radarLayer) {
            radarMap.removeLayer(radarLayer);
        }

        // Radar image bounds (approximate Taiwan coverage)
        const bounds = [[21.5, 119], [25.5, 122.5]];

        // Add radar overlay with timestamp to avoid cache
        const radarUrl = `https://www.cwa.gov.tw/Data/radar/CV1_3600.png?t=${Date.now()}`;
        radarLayer = L.imageOverlay(radarUrl, bounds, {
            opacity: 0.7,
            interactive: false
        }).addTo(radarMap);

        // Update last refresh time display
        const updateTimeEl = document.getElementById('radar-update-time');
        if (updateTimeEl) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit'
            });
            updateTimeEl.textContent = `更新時間：${timeStr}`;
        }

        console.log('Radar layer updated');
    }

    // Manual refresh button
    if (radarRefreshBtn) {
        radarRefreshBtn.addEventListener('click', () => {
            updateRadarLayer();
            updateStatus('雷達圖已更新', 'success');
            setTimeout(() => {
                updateStatus('', 'info');
            }, 2000);
        });
    }

    // ==================== All Cities Chart ====================

    // Query All Cities
    btnAll.addEventListener('click', async () => {
        updateStatus('正在查詢全台資料（請稍候...）', 'info');

        try {
            const response = await fetch('/api/weather/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                renderChart(result.data);
                chartContainer.classList.remove('hidden');
                updateStatus('全台資料查詢完成！', 'success');
                updateTime();
            } else {
                updateStatus(`查詢失敗：${result.error}`, 'error');
            }
        } catch (error) {
            updateStatus(`錯誤：${error.message}`, 'error');
            console.error(error);
        }
    });

    function renderChart(data) {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const cities = Object.keys(data);
        const temps = cities.map(city => {
            const tempStr = data[city].temperature || data[city].temp || '0';
            return parseFloat(tempStr.replace(/[^0-9.-]/g, ''));
        });

        if (weatherChart) {
            weatherChart.destroy();
        }

        // Dynamic colors based on temperature
        const colors = temps.map(t => {
            if (t >= 30) return 'rgba(239, 68, 68, 0.8)';
            if (t >= 20) return 'rgba(245, 158, 11, 0.8)';
            return 'rgba(59, 130, 246, 0.8)';
        });

        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', 'Noto Sans TC', sans-serif";

        weatherChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cities,
                datasets: [{
                    label: '目前溫度 (°C)',
                    data: temps,
                    backgroundColor: colors,
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} °C`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false,
                        },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#94a3b8',
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // ==================== Voice Assistant ====================

    // Check if Speech Synthesis is supported
    if ('speechSynthesis' in window) {
        voiceBtn.addEventListener('click', toggleSpeech);
    } else {
        voiceBtn.disabled = true;
        voiceBtn.title = '您的瀏覽器不支援語音播報';
        voiceBtn.style.opacity = '0.5';
    }

    function toggleSpeech() {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            // Pause speaking
            speechSynthesis.pause();
            voiceBtn.classList.add('paused');
            voiceBtn.querySelector('i').className = 'fa-solid fa-play';
        } else if (speechSynthesis.paused) {
            // Resume speaking
            speechSynthesis.resume();
            voiceBtn.classList.remove('paused');
            voiceBtn.querySelector('i').className = 'fa-solid fa-volume-high';
        } else if (speechSynthesis.speaking) {
            // Stop speaking
            speechSynthesis.cancel();
            voiceBtn.classList.remove('speaking', 'paused');
            voiceBtn.querySelector('i').className = 'fa-solid fa-volume-high';
        } else {
            // Start speaking
            speakWeather();
        }
    }

    function speakWeather() {
        // Use the successfully queried city, not the input value
        if (!currentQueryCity || singleResult.classList.contains('hidden')) {
            updateStatus('請先查詢有效的天氣資料', 'warning');
            return;
        }
        const city = currentQueryCity;
        const cityName = getCityName(city);

        // Build natural speech text
        let text = `為您播報${cityName}的天氣，`;

        // Add current weather advice (remove emoji)
        const advice = adviceText.textContent;
        if (advice && advice !== '--' && advice !== '暫無建議') {
            const cleanAdvice = advice.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            if (cleanAdvice) {
                text += `${cleanAdvice}，`;
            }
        }

        // Add AQI information with detailed recommendations
        const aqi = aqiValue.textContent;
        const aqiStatusText = aqiStatus.textContent;
        if (aqi && aqi !== '--' && !aqiCard.classList.contains('hidden')) {
            const levelInfo = AQI_LEVELS[Object.keys(AQI_LEVELS).find(key =>
                AQI_LEVELS[key].text === aqiStatusText
            )] || AQI_LEVELS['unknown'];

            text += `目前空氣品質${aqiStatusText}，AQI指標為${aqi}，`;
            text += `${levelInfo.healthImpact}，`;
            text += `${levelInfo.activity}，`;
            text += `口罩方面${levelInfo.mask}，`;
            text += `${levelInfo.window}，`;
        }

        // Add sun times with natural phrasing
        const sunrise = sunriseTime.textContent;
        const sunset = sunsetTime.textContent;
        if (sunrise && sunrise !== '--:--') {
            text += `今天日出在${formatTimeForSpeech(sunrise)}、日落在${formatTimeForSpeech(sunset)}，`;
        }

        // Add forecast (first 3 periods) with natural phrasing
        const forecastCards = document.querySelectorAll('.forecast-card');
        if (forecastCards.length > 0) {
            text += '未來天氣、';
            Array.from(forecastCards).slice(0, 3).forEach((card, index) => {
                const dateText = card.querySelector('.forecast-date')?.textContent || '';
                const period = card.querySelector('.forecast-time')?.textContent || '';
                const weather = card.querySelector('.forecast-weather')?.textContent || '';
                const temp = card.querySelector('.forecast-temp')?.textContent || '';

                if (dateText && weather) {
                    const dateForSpeech = formatDateForSpeech(dateText);
                    const tempForSpeech = formatTempForSpeech(temp);

                    if (index === 0) {
                        text += `${dateForSpeech}${period}${weather}、${tempForSpeech}、`;
                    } else {
                        text += `${dateForSpeech}${period}則是${weather}、${tempForSpeech}、`;
                    }
                }
            });
        }

        text += '以上是天氣資訊。';

        console.log('📢 準備播報:', text.substring(0, 50) + '...');

        // CRITICAL: Force cancel any existing speech (Windows TTS fix)
        speechSynthesis.cancel();

        // Wait a moment to ensure clean state
        setTimeout(() => {
            performSpeech(text, 0);
        }, 200);
    }

    // Separate function to handle speech with retry logic
    function performSpeech(text, retryCount = 0) {
        console.log(`🎤 嘗試播報 (第 ${retryCount + 1} 次)`);

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to get Chinese voice
        const voices = speechSynthesis.getVoices();
        const zhVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('TW'));
        if (zhVoice) {
            utterance.voice = zhVoice;
            console.log('🔊 使用語音:', zhVoice.name);
        }

        let hasStarted = false;
        let hasEnded = false;

        // Event handlers
        utterance.onstart = () => {
            hasStarted = true;
            console.log('✅ 語音播報開始');
            voiceBtn.classList.add('speaking');
            updateStatus('正在播報...', 'info');
        };

        utterance.onend = () => {
            hasEnded = true;
            console.log('✅ 語音播報結束');
            voiceBtn.classList.remove('speaking');
            updateStatus('播報完成', 'success');
            setTimeout(() => updateStatus('', 'info'), 2000);
        };

        utterance.onerror = (event) => {
            console.error('❌ 語音播報錯誤:', event.error);
            voiceBtn.classList.remove('speaking');

            // Only retry on network errors, NOT on interrupted (which is from our own cancel())
            if (retryCount < 2 && event.error === 'network') {
                console.log('🔄 準備重試...');
                speechSynthesis.cancel();
                setTimeout(() => performSpeech(text, retryCount + 1), 500);
            } else {
                if (event.error !== 'interrupted') {
                    updateStatus(`語音播報失敗: ${event.error}`, 'error');
                }
            }
        };

        // Immediate visual feedback
        voiceBtn.classList.add('speaking');
        updateStatus('準備播報...', 'info');

        // Speak
        try {
            speechSynthesis.speak(utterance);
            console.log('📤 語音已送出');

            // Only check if speech fails to START (not if it takes long to finish)
            setTimeout(() => {
                if (!hasStarted && speechSynthesis.speaking) {
                    console.warn('⚠️ 語音引擎回應緩慢,但似乎正在處理...');
                    // Keep waiting, might just be slow
                } else if (!hasStarted && !speechSynthesis.speaking) {
                    console.error('❌ 語音未能啟動');
                    voiceBtn.classList.remove('speaking');

                    // Retry once if it fails to start
                    if (retryCount === 0) {
                        console.log('🔄 嘗試重新啟動...');
                        speechSynthesis.cancel();
                        setTimeout(() => performSpeech(text, retryCount + 1), 500);
                    } else {
                        updateStatus('語音系統無法啟動', 'error');
                    }
                }
            }, 3000);

        } catch (error) {
            console.error('❌ 語音播報異常:', error);
            voiceBtn.classList.remove('speaking');
            updateStatus('語音播報失敗', 'error');
        }
    }

    function formatTimeForSpeech(time) {
        if (!time || time === '--:--') return '';

        const [hours, minutes] = time.split(':').map(Number);
        let period = '';
        let hour12 = hours;

        if (hours < 12) {
            period = '早上';
            hour12 = hours === 0 ? 12 : hours;
        } else if (hours < 18) {
            period = '下午';
            hour12 = hours === 12 ? 12 : hours - 12;
        } else {
            period = '晚上';
            hour12 = hours - 12;
        }

        return `${period}${hour12}點${minutes}分`;
    }

    function formatTempForSpeech(tempText) {
        if (!tempText) return '';

        const cleaned = tempText.replace(/°C?/g, '').trim();
        const match = cleaned.match(/(\d+)\s*-\s*(\d+)/);

        if (match) {
            return `攝氏${match[1]}到${match[2]}度`;
        }
        return tempText;
    }

    function formatDateForSpeech(dateText) {
        if (!dateText) return '';

        const match = dateText.match(/(\d+)\/(\d+)\s*\((.+?)\)/);
        if (match) {
            const month = match[1];
            const day = match[2];
            const weekday = match[3];

            const monthChinese = convertNumberToChinese(month);
            const dayChinese = convertNumberToChinese(day);

            return `${monthChinese}月${dayChinese}號${weekday}`;
        }
        return dateText;
    }

    function convertNumberToChinese(num) {
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

        const numValue = parseInt(num);
        const numStr = String(numValue);

        if (numStr.length === 1) {
            return digits[numValue];
        } else if (numStr.length === 2) {
            const tens = Math.floor(numValue / 10);
            const ones = numValue % 10;

            if (tens === 1) {
                return ones === 0 ? '十' : `十${digits[ones]}`;
            } else {
                return ones === 0 ? `${digits[tens]}十` : `${digits[tens]}十${digits[ones]}`;
            }
        }
        return num;
    }

    // ==================== Data Export Functionality ====================

    const exportExcelBtn = document.getElementById('export-excel-btn');
    const totalRecordsEl = document.getElementById('total-records');
    const dateRangeEl = document.getElementById('date-range');
    const exportCityFilter = document.getElementById('export-city-filter');
    const exportStartDate = document.getElementById('export-start-date');
    const exportEndDate = document.getElementById('export-end-date');

    // Load export statistics on page load
    loadExportStats();

    async function loadExportStats() {
        try {
            const response = await fetch('/api/export/stats');
            const result = await response.json();

            if (result.success) {
                const stats = result.data;

                // Update total records
                totalRecordsEl.textContent = stats.total_records || 0;

                // Update date range
                if (stats.earliest_date && stats.latest_date) {
                    dateRangeEl.textContent = `${stats.earliest_date} ~ ${stats.latest_date}`;
                } else {
                    dateRangeEl.textContent = '--';
                }

                // Populate city filter dropdown
                if (stats.cities && stats.cities.length > 0) {
                    exportCityFilter.innerHTML = '<option value="">' + t('export.allCities') + '</option>';
                    stats.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city;
                        option.textContent = getCityName(city);
                        exportCityFilter.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('載入匯出統計失敗:', error);
        }
    }

    // Export functions
    async function exportData(format) {
        try {
            // Get filter parameters
            const startDate = exportStartDate.value;
            const endDate = exportEndDate.value;
            const city = exportCityFilter.value;

            // Build query parameters
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (city) params.append('city', city);

            const queryString = params.toString();
            const url = `/api/export/${format}${queryString ? '?' + queryString : ''}`;

            // Show loading status
            updateStatus(t('export.downloading') || '下載中...', 'info');

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = '';  // Filename is set by server
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show success message
            setTimeout(() => {
                updateStatus(t('export.success') || '匯出成功！', 'success');
                // Refresh stats in case new queries were logged
                loadExportStats();
            }, 500);

        } catch (error) {
            console.error('匯出失敗:', error);
            updateStatus(`匯出失敗：${error.message}`, 'error');
        }
    }

    // Event listener for export button
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => exportData('excel'));
    }

    // Refresh stats when filters change
    if (exportStartDate) {
        exportStartDate.addEventListener('change', () => {
            // Could add filtered stats preview here
        });
    }

    if (exportEndDate) {
        exportEndDate.addEventListener('change', () => {
            // Could add filtered stats preview here
        });
    }

    // ==================== Feature #13: Weather Statistics ====================
    let trendChartInstance = null;

    function initStats() {
        const refreshBtn = document.getElementById('btn-refresh-stats');
        const statsCityFilter = document.getElementById('stats-city-filter');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => fetchWeatherStats());
        }

        // 城市篩選器事件
        if (statsCityFilter) {
            statsCityFilter.addEventListener('change', () => fetchWeatherStats());
        }

        // 載入城市選項並初始化統計資料
        loadStatsCityOptions();

        // 效能優化調整：延遲自動載入以平衡效能與使用者體驗
        setTimeout(() => {
            fetchWeatherStats();
        }, 3000);
    }

    async function loadStatsCityOptions() {
        const statsCityFilter = document.getElementById('stats-city-filter');
        if (!statsCityFilter) return;

        try {
            const response = await fetch('/api/export/stats');
            const result = await response.json();

            if (result.success && result.data.cities) {
                // 清空並重新填充選項
                statsCityFilter.innerHTML = '<option value="">全部城市</option>';
                result.data.cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = getCityName(city);
                    statsCityFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('載入城市選項失敗:', error);
        }
    }

    async function fetchWeatherStats() {
        const loading = document.getElementById('stats-loading');
        const container = document.getElementById('stats-container');
        const statsCityFilter = document.getElementById('stats-city-filter');

        if (loading) loading.classList.remove('hidden');
        if (container) container.classList.add('hidden');

        try {
            // 取得選中的城市
            const selectedCity = statsCityFilter ? statsCityFilter.value : '';
            const url = selectedCity ? `/api/stats/analysis?city=${encodeURIComponent(selectedCity)}` : '/api/stats/analysis';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                renderStats(data);
                if (container) container.classList.remove('hidden');
            } else {
                console.error('Statistics API returned error:', data.error);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    }

    function renderStats(data) {
        // 1. Key Metrics
        const summary = data.summary;
        setSafeText('stat-avg-temp', summary.avg_temp);

        // 1.5 Update Current Temp Card (New Location)
        const currentTempCard = document.getElementById('current-temp-card');
        const currentTempVal = document.getElementById('current-temp-val');
        const currentTempCity = document.getElementById('current-temp-city');
        const currentTempTime = document.getElementById('current-temp-time');

        if (currentTempCard && summary.latest_temp !== null) {
            currentTempCard.classList.remove('hidden');
            if (currentTempVal) currentTempVal.textContent = summary.latest_temp;
            if (currentTempCity) currentTempCity.textContent = summary.latest_city || '未知城市';

            // Get today's date and time
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            if (currentTempTime) currentTempTime.textContent = `更新於 ${timeString}`;
        }

        setSafeText('stat-avg-aqi', summary.avg_aqi);

        // 2. Extremes
        const extremes = data.extremes;
        if (extremes.hottest) {
            setSafeText('stat-max-temp', `${extremes.hottest.temp}°C`);
            setSafeText('stat-max-temp-note', `${extremes.hottest.city} (${extremes.hottest.date.split(' ')[0]})`);
        }
        if (extremes.coldest) {
            setSafeText('stat-min-temp', `${extremes.coldest.temp}°C`);
            setSafeText('stat-min-temp-note', `${extremes.coldest.city} (${extremes.coldest.date.split(' ')[0]})`);
        }

        // 3. Trend Chart
        const trend = data.trend;
        const ctx = document.getElementById('trendChart');
        if (ctx && trend) {
            if (trendChartInstance) {
                trendChartInstance.destroy();
            }

            // Format dates to be simpler (MM/DD)
            const simpleDates = trend.dates.map(date => {
                const parts = date.split('-');
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : date;
            });

            trendChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: simpleDates,
                    datasets: [{
                        label: '氣溫 (°C)',
                        data: trend.temps,
                        backgroundColor: '#fbbf24', // Amber-400
                        borderRadius: 6, // Rounded corners for bars
                        barThickness: 'flex',
                        maxBarThickness: 40, // Prevent too wide bars
                        hoverBackgroundColor: '#f59e0b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fbbf24',
                            callbacks: {
                                label: function (context) {
                                    return `${context.parsed.y}°C`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: 'rgba(255, 255, 255, 0.5)', maxRotation: 0 }
                        },
                        y: {
                            display: false, // Hide Y axis completely for cleaner look
                            grid: { display: false },
                            beginAtZero: false // Let the chart scale to focus on temp variation
                        }
                    }
                }
            });
        }
    }

    function setSafeText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // ==================== Feature #18: Recommendation System ====================
    function initRecommendation() {
        const btnRecommend = document.getElementById('btn-recommend');
        const modal = document.getElementById('recommend-modal');
        const closeBtn = document.querySelector('.close-modal');
        const loading = document.getElementById('recommend-loading');
        const results = document.getElementById('recommend-results');

        if (!btnRecommend || !modal) return;

        // Open Modal
        btnRecommend.addEventListener('click', async () => {
            modal.classList.remove('hidden');
            results.innerHTML = ''; // Clear previous
            loading.classList.remove('hidden');

            try {
                const response = await fetch('/api/weather/recommend');
                const data = await response.json();

                if (data.success) {
                    renderRecommendations(data.recommendations);
                } else {
                    results.innerHTML = `<p class="error">無法取得推薦: ${data.error}</p>`;
                }
            } catch (error) {
                console.error('Failed to get recommendation:', error);
                results.innerHTML = `<p class="error">連線失敗，請稍後再試</p>`;
            } finally {
                loading.classList.add('hidden');
            }
        });

        // Close Modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    function renderRecommendations(cities) {
        const resultsContainer = document.getElementById('recommend-results');
        resultsContainer.innerHTML = '';

        cities.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'rec-city-card';

            // Generate tags HTML
            const tagsHtml = item.reasons.map(Reason =>
                `<span class="rec-tag"><i class="fa-solid fa-check"></i> ${Reason}</span>`
            ).join('');

            card.innerHTML = `
                <div class="rec-rank rank-${index + 1}">${index + 1}</div>
                <div class="rec-info">
                    <div class="rec-city-name">
                        ${getCityName(item.city)} 
                        <span class="rec-score">${item.score}分</span>
                    </div>
                    <div class="rec-reasons">
                        ${tagsHtml}
                    </div>
                </div>
                <div class="rec-weather">
                    <span class="rec-temp">${item.temp}°C</span>
                    <span class="rec-desc">${item.weather}</span>
                </div>
            `;

            // Click to query that city
            card.addEventListener('click', () => {
                selectCity(item.city);
                fetchWeather(item.city);
                showRadarSection();
                document.getElementById('recommend-modal').classList.add('hidden');
            });

            resultsContainer.appendChild(card);
        });
    }

    function getCityName(city) {
        // Simple helper if translation needed in future
        return city;
    }

    // ==================== Feature #15: Extreme Weather Alerts ====================
    function initAlerts() {
        // Poll immediately and then every 60 seconds
        pollAlerts();
        setInterval(pollAlerts, 60000);
    }

    async function pollAlerts() {
        const container = document.getElementById('alert-container');
        if (!container) return;

        try {
            const response = await fetch('/api/alerts');
            const data = await response.json();

            if (data.success && data.alerts.length > 0) {
                renderAlerts(data.alerts);
            } else {
                container.innerHTML = ''; // Clear if no alerts
            }
        } catch (error) {
            console.error('Failed to poll alerts:', error);
        }
    }

    function renderAlerts(alerts) {
        const container = document.getElementById('alert-container');
        container.innerHTML = '';

        alerts.forEach(alert => {
            const banner = document.createElement('div');
            banner.className = `alert-banner ${alert.color || 'warning'}`;

            // Icon mapping
            let icon = 'fa-triangle-exclamation';
            if (alert.type === '颱風') icon = 'fa-hurricane';
            if (alert.type === '豪雨') icon = 'fa-cloud-showers-heavy';

            banner.innerHTML = `
                <i class="fa-solid ${icon} alert-icon"></i>
                <div class="alert-content">
                    <div class="alert-title">⚠️ ${alert.title}</div>
                    <div class="alert-desc">${alert.description}</div>
                    <div class="alert-time">發布時間: ${alert.time} | 影響區域: ${alert.location}</div>
                </div>
            `;

            container.appendChild(banner);
        });
    }
});

// ==================== MY FAVORITES FEATURE (CRUD) ====================
// Constants
const MAX_FAVORITES = 10;
const STORAGE_KEY = 'tw_weather_favorites';

// currentQueryCity is declared at the top of the file

// Load favorites from localStorage
function loadFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[Favorites] Error loading favorites:', error);
        return [];
    }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        return true;
    } catch (error) {
        console.error('[Favorites] Error saving favorites:', error);
        return false;
    }
}

// Render favorites list in dropdown
function renderFavoritesList() {
    const favorites = loadFavorites();
    const favoritesList = document.getElementById('favorites-list');
    const favoritesCount = document.querySelector('.favorites-count');
    const favoritesLimit = document.querySelector('.favorites-limit');

    if (!favoritesList) return;

    // Update count
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
    if (favoritesLimit) {
        favoritesLimit.textContent = `${favorites.length} / ${MAX_FAVORITES}`;
    }

    // Render list
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="empty-favorites">尚未新增最愛城市</div>';
    } else {
        favoritesList.innerHTML = favorites.map((fav, index) => `
            <div class="favorite-item" data-city="${fav.city}">
                <div class="favorite-item-name" data-city="${fav.city}">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${fav.label}</span>
                </div>
                <div class="favorite-item-actions">
                    <button class="btn-edit-favorite" data-city="${fav.city}" title="修改地區">
                        ✏️ 修改地區
                    </button>
                    <button class="btn-delete-favorite" data-city="${fav.city}" title="刪除">
                        🗑️ 刪除
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        favoritesList.querySelectorAll('.favorite-item-name').forEach(item => {
            item.addEventListener('click', (e) => {
                const city = e.currentTarget.getAttribute('data-city');
                queryFavoriteCity(city);
            });
        });

        favoritesList.querySelectorAll('.btn-edit-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const city = e.target.getAttribute('data-city');
                updateFavoriteLabel(city);
            });
        });

        favoritesList.querySelectorAll('.btn-delete-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const city = e.target.getAttribute('data-city');
                removeFromFavorites(city);
            });
        });
    }
}

// Add city to favorites (CREATE)
function addToFavorites(city) {
    if (!city) {
        console.warn('[Favorites] No city specified');
        return;
    }

    const favorites = loadFavorites();

    // Check if already exists
    if (favorites.some(fav => fav.city === city)) {
        alert(`${city} 已經在我的最愛中了！`);
        return;
    }

    // Check limit
    if (favorites.length >= MAX_FAVORITES) {
        alert(`最多只能新增 ${MAX_FAVORITES} 個最愛城市！`);
        return;
    }

    // Add new favorite
    favorites.push({
        city: city,
        label: city  // Default label is the city name
    });

    if (saveFavorites(favorites)) {
        renderFavoritesList();
        console.log(`[Favorites] Added: ${city}`);
        alert(`已將 ${city} 加入我的最愛！`);
    } else {
        alert('儲存失敗，請稍後再試。');
    }
}

// Remove from favorites (DELETE)
function removeFromFavorites(city) {
    const favorites = loadFavorites();
    const filtered = favorites.filter(fav => fav.city !== city);

    if (filtered.length === favorites.length) {
        console.warn('[Favorites] City not found in favorites');
        return;
    }

    if (saveFavorites(filtered)) {
        renderFavoritesList();
        console.log(`[Favorites] Removed: ${city}`);
    }
}

// Update favorite label (UPDATE)
function updateFavoriteLabel(city) {
    const favorites = loadFavorites();
    const favorite = favorites.find(fav => fav.city === city);

    if (!favorite) {
        console.warn('[Favorites] City not found');
        return;
    }

    const currentLabel = favorite.label;
    // User requested clearer text: "Modify Region" instead of "New Name"
    const newLabel = prompt(`修改 ${favorite.label} 的地區或名稱 (輸入城市名可變更地區)：`, currentLabel);

    if (newLabel === null) return;  // User cancelled
    if (newLabel.trim() === '') {
        alert('名稱不能為空！');
        return;
    }

    const updatedName = newLabel.trim();
    favorite.label = updatedName;

    // Smart Update: Check if the new name corresponds to a valid city
    // If it's a known city/alias, update the underlying city ID too.
    if (window.CitySearch && window.CitySearch.searchCities) {
        const results = window.CitySearch.searchCities(updatedName);
        console.log('[Favorites] Smart Update Check:', updatedName, results);

        if (results && results.length > 0) {
            const bestMatch = results[0];
            // Allow Alias match (95) and Exact match (100)
            if (bestMatch.score >= 90) {
                favorite.city = bestMatch.city;
                console.log(`[Favorites] Smart updated city ID to: ${favorite.city}`);
                // Removed debug alert as verify complete
            }
        }
    } else {
        // Fallback: If no smart search, just update city ID to match label
        // This handles simple cases even without the module
        favorite.city = updatedName;
    }

    if (saveFavorites(favorites)) {
        renderFavoritesList();
        console.log(`[Favorites] Updated label: ${city} -> ${newLabel}`);
    }
}

// Query favorite city (READ)
function queryFavoriteCity(city) {
    console.log(`[Favorites] Querying: ${city}`);

    // Close dropdown
    const dropdown = document.querySelector('.favorites-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }

    // Fill search input
    const citySearchInput = document.getElementById('city-search');
    if (citySearchInput) {
        citySearchInput.value = city;
    }

    // Trigger weather query
    window.fetchWeather(city);
}

// Toggle dropdown visibility
function toggleFavoritesDropdown() {
    const dropdown = document.querySelector('.favorites-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Initialize favorites functionality
function initFavorites() {
    console.log('[Favorites] Initializing...');

    // Render initial favorites list
    renderFavoritesList();

    // Setup favorites button click handler
    const favoritesBtn = document.getElementById('favorites-btn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoritesDropdown();
        });
    }

    // Setup add to favorites button click handler
    const btnAddFavorite = document.getElementById('btn-add-favorite');
    if (btnAddFavorite) {
        btnAddFavorite.addEventListener('click', () => {
            if (currentQueryCity) {
                addToFavorites(currentQueryCity);
            } else {
                alert('請先查詢一個城市！');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.favorites-dropdown-wrapper');
        const dropdown = document.querySelector('.favorites-dropdown');

        if (wrapper && dropdown &&
            !wrapper.contains(e.target) &&
            !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    console.log('[Favorites] Initialized successfully');
}

