let _date = new Date(); // 擷取所有時間資訊(Date需大寫)
let _day = _date.getDay(); // 擷取禮拜幾(1~7)資訊

// 顯示資料用函式：render可說是present呈現的意思
function renderDay() {
    // 變數_thisDay：組字串(month會從0開始算，所以要＋1)
    let _thisDay = _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate();

    // 變數_chineseDay會先跑完changeCharacter(day)才執行textContent
    let _chineseDay = changeCharacter(_day);

    // 從HTML頁擷取h2標籤下的span，並插入變數_chineseDay
    document.querySelector('.jsDate span').textContent = _chineseDay;
    document.querySelector('h3').textContent = _thisDay;

    // 判斷奇數、偶數，顯示對應值
    if (_day == 1 || _day == 3 || _day == 5) {
        document.querySelector('.odd').style.display = 'block'
    } else if (_day == 2 || _day == 4 || _day == 6) {
        document.querySelector('.even').style.display = 'block'
    }
}

// 工具類函式：設定參數(day)是為了在判斷式代入數字
function changeCharacter(day) {
    if (day == _day) {
        return '五'
    } else if (day == _day) {
        return '四'
    } else if (day == _day) {
        return '三'
    } else if (day == _day) {
        return '二'
    } else if (day == _day) {
        return '一'
    } else if (day == _day) {
        return '日'
    } else if (day == _day) {
        return '六'
    }
}

// 執行用函式：將所有動作放在init函式
function init() {
    renderDay() // 第1個動作：呈現日期資訊
    getData() // 第2個動作：擷取藥局與口罩地圖資訊
}

// 擷取遠端口罩地圖JSON資料
let data; // 預設值為空值，從getData撈到資料後，將JSON資料存在這裡(避免重複打撈)
function getData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
    xhr.send();
    xhr.onload = function () {
        // 從HTML打撈名為loading的class名稱，並將預設值設定為無法顯示
        // document.querySelector('.loading').style.display = 'none';
        data = JSON.parse(xhr.responseText);
        renderList('臺北市'); // 第3個動作：呈現藥局與口罩資訊('臺北市')為預設值
    }
}

// 顯示資料用函式：呈現藥局名稱、
function renderList(city) {
    let ary = data.features;
    let str = '';
    for (let i = 0; ary.length > i; i++) {
        if (ary[i].properties.county == city) {
            str +=
                '<div class="pharma_Info">' +
                '<li>' + '<h2>' + ary[i].properties.name + '</h2>' +
                '<li>' + ary[i].properties.address + '</li>' +
                '<li>' + ary[i].properties.phone + '</li>' +
                '</div>' +
                '<div class="mask_Info">' +
                '<li class="mask_adult">' + '成人口罩 ' + ary[i].properties.mask_adult + '</li>' +
                '<li class="mask_child">' + '兒童口罩 ' + ary[i].properties.mask_child + '</li>'
            '</div>'
        }
    }
    document.querySelector('.content_block').innerHTML = str;
}

// 只要輸入init()就會執行所有動作
init()

// 監聽事件
document.querySelector('.area').addEventListener('change', function (e) {
    renderList(e.target.value)
}, false)


// 建立Leaflet地圖，設定經緯度座標，預設縮放值
var map = L.map('map', {
    center: [22.988586, 120.190887],
    zoom: 7
});
// 設定圖資來源
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '阿瀚的口罩地圖©',
    maxZoom: 18,
    id: 'mapbox/streets-v11', //地圖樣式
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia2VudHNoZW4iLCJhIjoiY2tleHg3dmJkMHUyMjMzbjR1cm5kMXlrZCJ9.5mGTDOSBrqxXQqGBu45GlA'
}).addTo(map);