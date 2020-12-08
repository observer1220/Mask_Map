// 擷取遠端口罩地圖JSON資料
let data = []; // 預設空陣列，從getData撈到資料後，將JSON資料存在這裡(避免重複打撈)
function getData() {
    axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
        .then((res) => {
            data = res.data
            console.log(data)
            renderList('高雄市') // 呼叫函式renderList()，參數為預設地點
        });
}
// 顯示資料用函式：render可說是present呈現的意思
let _date = new Date(); // 擷取完整時間資訊(Date需大寫)
// console.log(_date)

let _day = _date.getDay(); // 擷取禮拜幾(1~7)資訊
// console.log(_day)

// 用來顯示日期的函式
function renderDay() {
    // 變數_thisDay：組字串(月份從0開始計算，使用時請+1)
    let _thisDay = _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate();
    // console.log(_thisDay)

    // 變數_chineseDay：將阿拉伯數字轉換成中文小寫日期；changeCharacter為自定義函式
    let _chineseDay = changeCharacter(_day);
    // console.log(_chineseDay)

    // 選取jsDate底下的span標籤，並插入變數_chineseDay
    document.querySelector('.l_sideDate span').textContent = _chineseDay;
    // 選取r-side底下的h3標籤，並插入變數_chineseDay
    document.querySelector('.r_sideDate h3').textContent = _thisDay;

    // 判斷日期為奇數或偶數並顯示對應值
    if (_day == 1 || _day == 3 || _day == 5) {
        document.querySelector('.odd').style.display = 'block';
    } else if (_day == 2 || _day == 4 || _day == 6) {
        document.querySelector('.even').style.display = 'block';
    }
}
// 自定義函式(工具)：將阿拉伯數字1~7轉換為中文小寫數字一到日
function changeCharacter(_day) {
    if (_day == 1) {
        return '一'
    } else if (_day == 2) {
        return '二'
    } else if (_day == 3) {
        return '三'
    } else if (_day == 4) {
        return '四'
    } else if (_day == 5) {
        return '五'
    } else if (_day == 6) {
        return '六'
    } else if (_day == 7) {
        return '日'
    }
}

// 新增圖層：標示層
const markersLayer = new L.MarkerClusterGroup();
// 顯示資料用函式：呈現藥局資訊與地圖標示
function renderList(city) {
    let ary = data.features;
    let str = '';
    markersLayer.clearLayers();
    for (let i = 0; ary.length > i; i++) {
        if (ary[i].properties.county == city) {
            // 建立變數mask，是為了讓口罩數量的判斷式可以抓到顏色資料
            let mask;
            // 口罩數量判斷式：當成人口罩的數量等於0時，顯示紅色標記，大於0時，顯示藍色標記
            if (ary[i].properties.mask_adult == 0) {
                mask = redIcon;
            } else {
                mask = blueIcon;
            }
            // 渲染左側文字
            str += `<div class="pharma_Info">
                        <li><h2>${ary[i].properties.name}</h2>
                        <li>地址：${ary[i].properties.address}</li>
                        <li>電話：${ary[i].properties.phone}</li>
                    </div>
                    <div class="mask_Info">
                        <li class="mask_adult">成人口罩${ary[i].properties.mask_adult}</li>
                        <li class="mask_child">兒童口罩${ary[i].properties.mask_child}</li>
                    </div>`
            // 渲染右側地圖的圖示
            markersLayer.addLayer(L.marker([ary[i].geometry.coordinates[1], ary[i].geometry.coordinates[0]], {
                icon: mask // 這一行如果沒寫，會無法顯示標記顏色
            }).bindPopup(
                `<h2>${ary[i].properties.name}</h2>
                    <span>${ary[i].properties.address}</span>
                    <li>成人口罩：${ary[i].properties.mask_adult}</li>
                    <li>兒童口罩：${ary[i].properties.mask_child}</li>`));
            markersLayer.addTo(map)
        };
    };
    // 將文字渲染至左側欄位
    document.querySelector('.infoCard').innerHTML = str;
}

// 監聽事件
document.querySelector('.area').addEventListener('change', function (e) {
    renderList(e.target.value)
    console.log(e.target.value) // 基隆市、OO市
}, false)

// 執行用函式：將所有動作放在init函式
function init() {
    renderDay() // 第1個動作：呈現日期資訊
    getData() // 第2個動作：擷取藥局與口罩地圖資訊
}
init() // 輸入init()執行所有函式


// 新增圖層：地圖層
const map = L.map('map', {});
// 設定圖資來源
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '阿瀚的口罩地圖©',
    maxZoom: 18, // 預設地圖大小
    id: 'mapbox/streets-v11', //地圖樣式
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia2VudHNoZW4iLCJhIjoiY2tleHg3dmJkMHUyMjMzbjR1cm5kMXlrZCJ9.5mGTDOSBrqxXQqGBu45GlA'
}).addTo(map);

// Leaflet版的Geolocation：可用來標示使用者目前位置
function onLocationFound(e) {
    let radius = e.accuracy.toFixed(0); // 所在位置精確度
    // e.latlng為使用者所在地的座標
    L.marker(e.latlng).addTo(map)
        .bindPopup(`<h2>您大概位於此處</h2><span>誤差值：${radius}公尺內</span>`).openPopup();
    L.circle(e.latlng, radius).addTo(map);
}; map.on('locationfound', onLocationFound);
// 設定目前位置資訊
map.locate({
    watch: true, // 持續監視使用者所在位置
    setView: true, // 顯示地圖
    maxZoom: 7,   // 預設值大小
    enableHighAccuracy: true, // 提高精確度(顯示速度較慢)
});

// 設定標記(marker)樣式
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});