"use strict";

// 擷取遠端口罩地圖JSON資料
var data; // 預設值為空值，從getData撈到資料後，將JSON資料存在這裡(避免重複打撈)

function getData() {
  // 開啟一個網路請求
  var xhr = new XMLHttpRequest(); // 準備跟某伺服器要資料

  xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'); // 執行要資料的動作

  xhr.send(); // 當資料回傳時，下面語法就會自動觸發

  xhr.onload = function () {
    // 從HTML打撈名為loading的class名稱，並將預設值設定為無法顯示
    // document.querySelector('.loading').style.display = 'none';
    data = JSON.parse(xhr.responseText);
    renderList('高雄市'); // 第3個動作：呈現藥局與口罩資訊('臺北市')為預設值
  };
} // 顯示資料用函式：render可說是present呈現的意思


var _date = new Date(); // 擷取所有時間資訊(Date需大寫)


var _day = _date.getDay(); // 擷取禮拜幾(1~7)資訊


function renderDay() {
  // 變數_thisDay：組字串(month會從0開始算，所以要＋1)
  var _thisDay = _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate(); // 變數_chineseDay會先跑完changeCharacter(day)才執行textContent


  var _chineseDay = changeCharacter(_day); // 從HTML頁擷取h2標籤下的span，並插入變數_chineseDay


  document.querySelector('.jsDate span').textContent = _chineseDay;
  document.querySelector('h3').textContent = _thisDay; // 判斷奇數、偶數，顯示對應值

  if (_day == 1 || _day == 3 || _day == 5) {
    document.querySelector('.odd').style.display = 'block';
  } else if (_day == 2 || _day == 4 || _day == 6) {
    document.querySelector('.even').style.display = 'block';
  }
} // 工具類函式：設定參數(day)是為了在判斷式代入數字


function changeCharacter(day) {
  if (_day == day) {
    return '一';
  } else if (day == _day) {
    return '四';
  } else if (day == _day) {
    return '三';
  } else if (day == _day) {
    return '二';
  } else if (day == _day) {
    return '一';
  } else if (day == _day) {
    return '日';
  } else if (day == _day) {
    return '六';
  }
}

console.log(_day); // 顯示資料用函式：呈現藥局名稱、

function renderList(city) {
  var ary = data.features;
  var str = '';
  var markers = new L.MarkerClusterGroup().addTo(map);

  for (var i = 0; ary.length > i; i++) {
    if (ary[i].properties.county == city) {
      // 建立變數mask，是為了讓口罩數量的判斷式可以抓到顏色資料
      var mask = void 0; // 口罩數量判斷式：當成人口罩的數量等於0時，顯示紅色標記，大於0時，顯示藍色標記

      if (ary[i].properties.mask_adult == 0) {
        mask = redIcon;
      } else {
        mask = blueIcon;
      }

      str += '<div class="pharma_Info">' + '<li>' + '<h2>' + ary[i].properties.name + '</h2>' + '<li>' + '地址：' + ary[i].properties.address + '</li>' + '<li>' + '電話：' + ary[i].properties.phone + '</li>' + '</div>' + '<div class="mask_Info">' + '<li class="mask_adult">' + '成人口罩 ' + ary[i].properties.mask_adult + '</li>' + '<li class="mask_child">' + '兒童口罩 ' + ary[i].properties.mask_child + '</li>';
      '</div>';
      markers.addLayer(L.marker([ary[i].geometry.coordinates[1], ary[i].geometry.coordinates[0]], {
        icon: mask //這一行如果沒寫，會無法顯示標記顏色

      }).bindPopup('<h2>' + ary[i].properties.name + '</h2>' + '<span>' + ary[i].properties.address + '</span>' + '<li>' + '成人口罩：' + ary[i].properties.mask_adult + '</li>' + '<li>' + '兒童口罩：' + ary[i].properties.mask_child + '</li>'));
    }
  }

  document.querySelector('.infoCard').innerHTML = str;
  map.addLayer(markers);
} // 執行用函式：將所有動作放在init函式


function init() {
  renderDay(); // 第1個動作：呈現日期資訊

  getData(); // 第2個動作：擷取藥局與口罩地圖資訊
} // 只要輸入init()就會執行所有動作


init(); // 監聽事件

document.querySelector('.area').addEventListener('change', function (e) {
  renderList(e.target.value);
}, false); // 建立Leaflet地圖，設定經緯度座標，預設縮放值

var map = L.map('map', {
  center: [22.6033664, 120.3044352],
  zoom: 16
}); // Leaflet版的Geolocation：可用來標示使用者目前位置

map.locate({
  setView: true,
  maxZoom: 16
}); // 目前位置：標記成功

function onLocationFound(e) {
  var radius = e.accuracy;
  L.marker(e.latlng).addTo(map).bindPopup("您位於此地" + radius + "公尺內").openPopup();
  L.circle(e.latlng, radius).addTo(map); // console.log(e) // 看看e裡面有什麼資訊
}

map.on('locationfound', onLocationFound); // 目前位置：標記失敗

function onLocationError(e) {
  alert(e.message);
}

map.on('locationerror', onLocationError); // 設定圖資來源

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '阿瀚的口罩地圖©',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  //地圖樣式
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1Ijoia2VudHNoZW4iLCJhIjoiY2tleHg3dmJkMHUyMjMzbjR1cm5kMXlrZCJ9.5mGTDOSBrqxXQqGBu45GlA'
}).addTo(map); // 設定標記(marker)樣式

var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var violetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});