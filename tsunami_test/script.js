
//＊＊＊背景地図を設定＊＊＊
//地理院地図
var m_Chiriin = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
	attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>" });

//OpenStreetMap
var m_Osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' });

//地図を表示
var map = L.map('map', {
	center: [42.31341, 143.32392],  //中心位置を指定（この例は羊蹄山）
	zoom: 15,                         //デフォルトのズームレベルを指定
	zoomControl:true,　　             //ズームコントロールを表示・非表示
 	layers: [m_Chiriin] });


//背景レイヤの作成
var Map_BaseLayer = {
	"地理院地図　標準": m_Chiriin,
	"OpenStreetMap　標準": m_Osm };

//属性データをコントロールに表示
// control that shows state info on hover
var info = L.control();
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
		};

	info.update = function (props) {
		this._div.innerHTML = '<h4>津波最大高さ</h4>' +  (props ?
		'<b>' + props.max + '</b> m'
		: 'マウスで最大高さ表示');
		};

	info.addTo(map);


// get color depending on population density value
function getColor(d) {
	return d > 30 ? '#d53e4f' :
		d > 20  ? '#f46d43' :
		d > 10  ? '#fdae61' :
		d > 5  ? '#fee08b' :
		d > 3   ? '#e6f598' :
		d > 2   ? '#abdda4' :
		d > 1   ? '#66c2a5' :
			'#3288bd';
}

function style(feature) {
	return {
		weight: 0,         //線の幅
		opacity: 1,        //線の透過度
		color: 'white',    //線色
		dashArray: '1',    //破線
		fillOpacity: 0.7,  //透明度
		fillColor: getColor(feature.properties.max)   //データで塗りつぶし色を選択
	};
}
//マウスオーバーで輪郭線を太い灰色にする
function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 2,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	//ただしIEとOperaは行わない
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);  //カスタムコントロールの更新
}

var geojson;

	function resetHighlight(e) {
		geojson.resetStyle(e.target);  //レイヤスタイルをデフォルトに戻す
		info.update();   //カスタムコントロールの更新
	}

        //クリックされたポリゴンにズームする
	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	//関数を追加
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}


geojson = L.geoJson(tsunamiData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);

//オーバーレイ選択画面
var Map_Over = {
	"津波浸水範囲": geojson,
	};

// レイヤコントロールの表示
L.control.layers(Map_BaseLayer, //地図のレイヤ切り替え
	Map_Over, {          //オーバーレイを表示
	collapsed: false })  //「collapsed」は、コントロールを出したまま（false)にするか、アイコンにしまうか(true)選択
	.addTo(map);

//凡例を作成
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 1, 2, 3, 5, 10, 20, 30],
		labels = [],
		from, to;
		//色のついた四角をループで作成
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];
			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
};

legend.addTo(map);


