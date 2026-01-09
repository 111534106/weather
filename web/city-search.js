// ==================== City Search Module ====================
// Smart location search with Chinese/English keywords, voice input, and landmark support

(function () {
    'use strict';

    // City search database with aliases and keywords
    const CITY_SEARCH_DATA = {
        "臺北市": {
            aliases: ["台北市", "台北", "臺北", "北市"],
            en: ["taipei", "taipei city"],
            keywords: ["taipei", "北"],
            landmarks: [
                // 景點地標
                "台北101", "101", "故宮", "國立故宮博物院", "士林夜市", "陽明山", "中正紀念堂", "自由廣場", "西門町", "象山", "大稻埕", "松山機場", "Zoo", "動物園", "台北市立動物園", "信義區", "貓空", "貓空纜車", "北投溫泉", "關渡", "淡水河", "華山文創", "松菸", "松山文創園區", "國父紀念館", "二二八公園", "總統府", "台北賓館",
                // 大學院校
                "台大", "台灣大學", "國立台灣大學", "臺大", "NTU",
                "政大", "政治大學", "國立政治大學", "NCCU",
                "師大", "師範大學", "台灣師範大學", "國立台灣師範大學", "NTNU",
                "台科大", "台灣科技大學", "國立台灣科技大學", "NTUST",
                "北科大", "台北科技大學", "國立台北科技大學", "台北科大",
                "北大", "台北大學", "國立台北大學",
                "北教大", "台北教育大學", "國立台北教育大學",
                "台北藝術大學", "北藝大", "國立台北藝術大學",
                "台北護理健康大學", "北護", "國立台北護理健康大學",
                "陽明交通大學", "陽明交大", "陽明", "陽明大學",
                "實踐大學", "大同大學", "世新大學", "文化大學", "中國文化大學", "銘傳大學", "東吳大學", "淡江大學", "輔仁大學", "輔大", "Fu Jen",
                "康寧大學", "德明財經科技大學", "中國科技大學", "致理科技大學", "華梵大學", "真理大學",
                // 醫療機構
                "台大醫院", "國立台灣大學醫學院附設醫院", "NTUH",
                "榮總", "台北榮總", "台北榮民總醫院", "Taipei Veterans",
                "馬偕醫院", "馬偕紀念醫院", "Mackay",
                "三總", "三軍總醫院", "Tri-Service",
                "長庚醫院", "台北長庚", "長庚紀念醫院",
                "和平醫院", "市立聯合醫院", "仁愛醫院", "中興醫院", "忠孝醫院",
                "國泰醫院", "新光醫院", "萬芳醫院", "振興醫院", "北醫", "台北醫學大學", "台北醫學大學附設醫院",
                // 火車站/捷運站
                "台北車站", "北車", "台北火車站", "Taipei Main Station",
                "松山車站", "松山火車站", "南港車站", "南港火車站", "萬華車站",
                "台北101/世貿站", "象山站", "市政府站", "國父紀念館站", "忠孝復興站", "忠孝敦化站", "忠孝新生站",
                "台北小巨蛋站", "南京復興站", "中山站", "雙連站", "民權西路站", "圓山站", "劍潭站", "士林站", "芝山站", "明德站", "石牌站", "唭哩岸站", "奇岩站", "北投站", "復興崗站", "忠義站", "關渡站", "竹圍站", "紅樹林站",
                "西門站", "西門町站", "北門站", "中正紀念堂站", "古亭站", "台電大樓站", "公館站", "萬隆站", "景美站", "大坪林站", "七張站", "新店站",
                "松江南京站", "行天宮站", "中山國小站", "大直站", "劍南路站", "文湖站", "港墘站", "西湖站", "劍南站", "內湖站", "大湖公園站", "葫洲站", "東湖站", "南港軟體園區站",
                "東門站", "信義安和站", "台北101站", "六張犁站", "科技大樓站", "大安站", "忠孝敦化站",
                "南港展覽館站", "昆陽站", "後山埤站", "永春站", "市政府站", "國父紀念館站",
                // 商圈百貨
                "信義商圈", "信義威秀", "微風信義", "微風南山", "BELLAVITA", "ATT 4 FUN", "新光三越信義店", "統一時代百貨", "Neo19",
                "東區", "忠孝東區", "明曜百貨", "SOGO復興館", "微風廣場", "微風松高",
                "西門商圈", "西門紅樓", "誠品西門", "萬年商業大樓",
                "中山商圈", "南京西路", "新光三越南西店", "SOGO中山店", "誠品南西",
                "天母", "天母商圈", "新光三越天母店", "大葉高島屋",
                "內湖", "內湖科學園區", "內科", "美麗華百樂園", "大直美麗華", "大直ATT",
                "南港", "南港軟體園區", "南港City Link", "南港車站Global Mall",
                "公館商圈", "師大夜市", "通化夜市", "饒河夜市", "寧夏夜市", "延三夜市", "南機場夜市", "景美夜市",
                // 政府機構
                "台北市政府", "市府", "City Hall", "總統府", "行政院", "立法院", "監察院", "司法院", "考試院"
            ]
        },
        "新北市": {
            aliases: ["新北"],
            en: ["new taipei", "new taipei city"],
            keywords: ["newtaipei", "新北"],
            landmarks: [
                // 觀光景點
                "九份", "九份老街", "金瓜石", "淡水老街", "淡水", "紅毛城", "野柳", "野柳地質公園", "女王頭", "平溪", "十分", "十分瀑布", "十分老街", "板橋耶誕城", "烏來", "烏來溫泉", "烏來瀑布", "漁人碼頭", "淡水漁人碼頭", "富貴角", "富貴角燈塔", "三貂角", "猴硐", "貓村", "深澳", "象鼻岩", "鼻頭角", "福隆", "福隆海水浴場", "黃金博物館", "朱銘美術館", "鶯歌陶瓷博物館", "鶯歌老街", "三峽老街", "三峽祖師廟",
                // 大學院校
                "輔仁大學", "輔大", "Fu Jen", "淡江大學", "淡江", "TKU", "真理大學", "聖約翰科技大學", "華梵大學", "明志科技大學", "致理科技大學", "醒吾科技大學", "黎明技術學院", "景文科技大學", "德霖科技大學", "東南科技大學", "亞東技術學院", "亞東科技大學",
                // 醫療機構
                "亞東醫院", "亞東紀念醫院", "雙和醫院", "台北慈濟醫院", "慈濟醫院", "恩主公醫院", "新北市立聯合醫院", "淡水馬偕", "馬偕淡水分院",
                // 火車站/捷運站
                "板橋車站", "高鐵板橋站", "板橋火車站", "Banqiao Station",
                "新莊站", "輔大站", "丹鳳站", "迴龍站", "三重站", "菜寮站", "台北橋站", "三和國中站", "徐匯中學站", "三民高中站", "蘆洲站",
                "頂溪站", "永安市場站", "景安站", "南勢角站",
                "淡水站", "紅樹林站", "竹圍站", "關渡站", "忠義站", "復興崗站",
                "中和站", "橋和站", "中原站", "板新站",
                "樹林車站", "山佳車站", "鶯歌車站", "三峽車站", "土城車站", "樹林站",
                "新店站", "七張站", "大坪林站", "景美站", "萬隆站",
                "汐止車站", "汐科車站", "福隆車站", "瑞芳車站", "猴硐車站", "三貂嶺車站",
                // 商圈百貨
                "板橋大遠百", "板橋遠百", "板橋Mega City", "環球購物中心", "板橋環球", "板橋府中", "新埔站", "江子翠站",
                "新莊廟街", "新莊夜市", "輔大花園夜市", "樂華夜市", "興南夜市",
                "林口三井Outlet", "林口Outlet", "林口長庚醫院",
                "淡水老街", "淡水商圈", "九份老街",
                // 政府機構
                "新北市政府", "新北市府", "板橋區公所"
            ]
        },
        "基隆市": {
            aliases: ["基隆"],
            en: ["keelung", "keelung city"],
            keywords: ["keelung", "基隆"],
            landmarks: [
                // 觀光景點
                "基隆廟口", "廟口夜市", "和平島", "和平島公園", "和平島地質公園", "潮境公園", "八斗子", "八斗子車站", "望幽谷", "正濱漁港", "彩色屋", "阿根納造船廠", "中正公園", "大佛禪院", "白米甕砲台", "槓子寮砲台", "仙洞巖", "外木山", "情人湖", "暖暖車站", "暖東峽谷",
                // 大學院校
                "海洋大學", "國立台灣海洋大學", "國立海洋大學", "海大", "NTOU", "經國管理暨健康學院",
                // 醫療機構
                "基隆長庚醫院", "長庚基隆院區", "基隆醫院", "衛生福利部基隆醫院", "基隆市立醫院",
                // 火車站
                "基隆車站", "基隆火車站", "Keelung Station", "七堵車站", "百福車站", "海科館站", "八斗子站", "暖暖車站", "三坑車站", "汐止車站",
                // 商圈百貨
                "基隆廟口", "孝三路", "仁愛市場", "基隆港", "海洋廣場", "基隆東岸商場",
                // 政府機構
                "基隆市政府", "基隆市府"
            ]
        },
        "桃園市": {
            aliases: ["桃園"],
            en: ["taoyuan", "taoyuan city"],
            keywords: ["taoyuan", "桃園"],
            landmarks: [
                // 觀光景點
                "桃園國際機場", "桃園機場", "桃機", "TPE Airport", "大溪老街", "大溪", "慈湖", "兩蔣文化園區", "石門水庫", "拉拉山", "小人國", "小人國主題樂園", "Xpark", "華泰名品城", "Gloria Outlets", "置地廣場", "青埔", "桃園水族館", "大園花海", "虎頭山", "虎頭山公園", "龍潭大池", "龍潭觀光大池", "三坑老街", "角板山", "小烏來", "小烏來天空步道", "竹圍漁港", "永安漁港",
                // 大學院校
                "中央大學", "國立中央大學", "中大", "NCU",
                "中原大學", "CYCU",
                "元智大學", "YZU",
                "開南大學", "長庚大學", "健行科技大學", "萬能科技大學", "龍華科技大學", "明新科技大學", "南亞技術學院",
                // 醫療機構
                "長庚醫院", "林口長庚", "林口長庚醫院", "長庚紀念醫院", "Chang Gung",
                "桃園長庚", "桃園榮總", "桃園榮民總醫院", "敏盛醫院", "怡仁醫院", "聖保祿醫院", "天成醫院",
                // 火車站/捷運站
                "桃園車站", "桃園火車站", "Taoyuan Station",
                "高鐵桃園站", "桃園高鐵站", "Taoyuan HSR",
                "A1台北車站", "A2三重站", "A3新北產業園區站", "A7體育大學站", "A8長庚醫院站", "A9林口站", "A10山鼻站", "A11坑口站", "A12機場第一航廈站", "A13機場第二航廈站", "A14a機場旅館站", "A15大園站", "A16橫山站", "A17領航站", "A18高鐵桃園站", "A19桃園體育園區站", "A21環北站", "A22老街溪站",
                "內壢車站", "中壢車站", "埔心車站", "楊梅車站", "富岡車站", "湖口車站", "新豐車站",
                // 商圈百貨
                "桃園站前商圈", "桃園統領百貨", "遠東百貨桃園", "新光三越桃園", "大江購物中心", "台茂購物中心",
                "中壢SOGO", "中壢大江", "中壢夜市", "中壢觀光夜市", "中原夜市",
                "華泰名品城", "桃園青埔", "置地廣場", "Outlet",
                // 政府機構
                "桃園市政府", "桃園市府", "中壢區公所"
            ]
        },
        "新竹市": {
            aliases: ["新竹"],
            en: ["hsinchu", "hsinchu city"],
            keywords: ["hsinchu", "新竹"],
            landmarks: ["新竹科學園區", "竹科", "城隍廟", "南寮漁港", "十七公里海岸線", "新竹車站"]
        },
        "新竹縣": {
            aliases: ["新竹縣"],
            en: ["hsinchu county"],
            keywords: ["hsinchu", "新竹"],
            landmarks: ["六福村", "內灣老街", "司馬庫斯", "綠世界", "北埔老街", "高鐵新竹站", "竹北車站"]
        },
        "苗栗縣": {
            aliases: ["苗栗"],
            en: ["miaoli", "miaoli county"],
            keywords: ["miaoli", "苗栗"],
            landmarks: ["龍騰斷橋", "勝興車站", "大湖草莓", "南庄老街", "飛牛牧場", "苗栗車站", "高鐵苗栗站"]
        },
        "臺中市": {
            aliases: ["台中市", "台中", "臺中", "中市"],
            en: ["taichung", "taichung city"],
            keywords: ["taichung", "中"],
            landmarks: ["逢甲夜市", "高美濕地", "台中歌劇院", "宮原眼科", "彩虹眷村", "勤美", "大坑", "谷關", "麗寶樂園", "台中車站", "高鐵台中站"]
        },
        "彰化縣": {
            aliases: ["彰化"],
            en: ["changhua", "changhua county"],
            keywords: ["changhua", "彰化"],
            landmarks: ["八卦山", "大佛", "鹿港老街", "天后宮", "扇形車庫", "田尾公路花園", "彰化車站", "高鐵彰化站"]
        },
        "南投縣": {
            aliases: ["南投"],
            en: ["nantou", "nantou county"],
            keywords: ["nantou", "南投"],
            landmarks: ["日月潭", "合歡山", "清境農場", "溪頭", "妖怪村", "紫南宮", "武嶺", "九族文化村", "集集車站"]
        },
        "雲林縣": {
            aliases: ["雲林", "云林"],
            en: ["yunlin", "yunlin county"],
            keywords: ["yunlin", "雲林", "云林"],
            landmarks: ["劍湖山", "北港朝天宮", "西螺大橋", "古坑咖啡", "斗六車站", "高鐵雲林站"]
        },
        "嘉義市": {
            aliases: ["嘉義"],
            en: ["chiayi", "chiayi city"],
            keywords: ["chiayi", "嘉義"],
            landmarks: ["文化路夜市", "檜意森活村", "嘉義公園", "KANO", "嘉義車站"]
        },
        "嘉義縣": {
            aliases: ["嘉義縣"],
            en: ["chiayi county"],
            keywords: ["chiayi", "嘉義"],
            landmarks: ["阿里山", "奮起湖", "高跟鞋教堂", "故宮南院", "高鐵嘉義站"]
        },
        "臺南市": {
            aliases: ["台南市", "台南", "臺南", "南市"],
            en: ["tainan", "tainan city"],
            keywords: ["tainan", "南"],
            landmarks: ["赤崁樓", "安平古堡", "奇美博物館", "花園夜市", "孔廟", "億載金城", "四草綠色隧道", "台南車站", "高鐵台南站"]
        },
        "高雄市": {
            aliases: ["高雄", "高市"],
            en: ["kaohsiung", "kaohsiung city"],
            keywords: ["kaohsiung", "高"],
            landmarks: ["愛河", "85大樓", "駁二", "旗津", "西子灣", "蓮池潭", "龍虎塔", "義大世界", "瑞豐夜市", "美麗島", "高雄車站", "左營高鐵站", "新左營站"]
        },
        "屏東縣": {
            aliases: ["屏東"],
            en: ["pingtung", "pingtung county"],
            keywords: ["pingtung", "屏東"],
            landmarks: ["墾丁", "鵝鑾鼻", "海生館", "小琉球", "東港", "大鵬灣", "屏東車站", "潮州車站"]
        },
        "宜蘭縣": {
            aliases: ["宜蘭"],
            en: ["yilan", "yilan county"],
            keywords: ["yilan", "宜蘭"],
            landmarks: ["礁溪溫泉", "羅東夜市", "龜山島", "幾米公園", "太平山", "清水地熱", "蘭陽博物館", "宜蘭車站", "礁溪車站", "羅東車站"]
        },
        "花蓮縣": {
            aliases: ["花蓮"],
            en: ["hualien", "hualien county"],
            keywords: ["hualien", "花蓮"],
            landmarks: ["太魯閣", "七星潭", "東大門夜市", "瑞穗牧場", "清水斷崖", "遠雄海洋公園", "花蓮車站", "玉里車站"]
        },
        "臺東縣": {
            aliases: ["台東縣", "台東", "臺東"],
            en: ["taitung", "taitung county"],
            keywords: ["taitung", "台東", "臺東"],
            landmarks: ["伯朗大道", "金城武樹", "三仙台", "知本溫泉", "綠島", "蘭嶼", "多良車站", "鹿野高台", "台東車站", "知本車站", "池上車站"]
        },
        "澎湖縣": {
            aliases: ["澎湖"],
            en: ["penghu", "penghu county"],
            keywords: ["penghu", "澎湖"],
            landmarks: ["雙心石滬", "跨海大橋", "玄武岩", "吉貝島"]
        },
        "金門縣": {
            aliases: ["金門"],
            en: ["kinmen", "kinmen county"],
            keywords: ["kinmen", "金門"],
            landmarks: ["翟山坑道", "莒光樓", "風獅爺", "金門大橋"]
        },
        "連江縣": {
            aliases: ["連江", "马祖", "馬祖"],
            en: ["lienchiang", "lienchiang county", "matsu"],
            keywords: ["lienchiang", "matsu", "連江", "馬祖"],
            landmarks: ["藍眼淚", "芹壁村", "八八坑道", "北海坑道"]
        }
    };

    // Fuzzy search algorithm
    function searchCities(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const lowerQuery = query.toLowerCase().trim();
        const results = [];

        for (const [officialName, data] of Object.entries(CITY_SEARCH_DATA)) {
            let score = 0;
            let matchType = '';
            let matchedLandmark = null;

            // 1. Exact match (highest priority)
            if (officialName === query || officialName.toLowerCase() === lowerQuery) {
                score = 100;
                matchType = 'exact';
            }
            // 2. Alias exact match
            else if (data.aliases.some(alias => alias.toLowerCase() === lowerQuery)) {
                score = 95;
                matchType = 'alias-exact';
            }
            // 3. English exact match
            else if (data.en.some(en => en === lowerQuery)) {
                score = 90;
                matchType = 'en-exact';
            }
            // 4. Landmark match (NEW)
            else if (data.landmarks && data.landmarks.some(l => {
                if (l.toLowerCase().includes(lowerQuery)) {
                    matchedLandmark = l;
                    return true;
                }
                return false;
            })) {
                score = 85;
                matchType = 'landmark';
            }
            // 5. Starts with (Chinese)
            else if (officialName.startsWith(query) || data.aliases.some(alias => alias.startsWith(query))) {
                score = 80;
                matchType = 'starts-with';
            }
            // 6. Starts with (English)
            else if (data.en.some(en => en.startsWith(lowerQuery))) {
                score = 75;
                matchType = 'en-starts-with';
            }
            // 7. Contains (Chinese)
            else if (officialName.includes(query) || data.aliases.some(alias => alias.includes(query))) {
                score = 60;
                matchType = 'contains';
            }
            // 8. Contains (English)
            else if (data.en.some(en => en.includes(lowerQuery))) {
                score = 55;
                matchType = 'en-contains';
            }
            // 9. Keyword match
            else if (data.keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
                score = 50;
                matchType = 'keyword';
            }

            if (score > 0) {
                results.push({
                    city: officialName,
                    score: score,
                    matchType: matchType,
                    matchedLandmark: matchedLandmark
                });
            }
        }

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        return results;
    }

    // Highlight matched text in suggestion
    function highlightMatch(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Voice recognition support
    let recognition = null;
    let isRecognizing = false;

    function initVoiceRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return null;
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'zh-TW';  // Traditional Chinese
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 5;

        return recognition;
    }

    function startVoiceRecognition(onResult, onError) {
        if (!recognition) {
            recognition = initVoiceRecognition();
            if (!recognition) {
                onError('不支援語音識別');
                return;
            }
        }

        if (isRecognizing) {
            recognition.stop();
            isRecognizing = false;
            return;
        }

        recognition.onstart = () => {
            isRecognizing = true;
            console.log('Voice recognition started');
        };

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            console.log('Voice recognition result:', result);
            onResult(result);
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            isRecognizing = false;

            let errorMsg = '語音識別錯誤';
            if (event.error === 'not-allowed') {
                errorMsg = '請允許麥克風權限';
            } else if (event.error === 'no-speech') {
                errorMsg = '未偵測到語音，請再試一次';
            }

            onError(errorMsg);
        };

        recognition.onend = () => {
            isRecognizing = false;
            console.log('Voice recognition ended');
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Failed to start voice recognition:', e);
            isRecognizing = false;
            onError('無法啟動語音識別');
        }
    }

    function stopVoiceRecognition() {
        if (recognition && isRecognizing) {
            recognition.stop();
            isRecognizing = false;
        }
    }

    function isVoiceRecognitionActive() {
        return isRecognizing;
    }

    // Export to global scope
    window.CitySearch = {
        searchCities: searchCities,
        highlightMatch: highlightMatch,
        startVoiceRecognition: startVoiceRecognition,
        stopVoiceRecognition: stopVoiceRecognition,
        isVoiceRecognitionActive: isVoiceRecognitionActive,
        CITY_SEARCH_DATA: CITY_SEARCH_DATA
    };

})();
