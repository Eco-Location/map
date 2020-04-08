let OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let Hydda_Full = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 17,
	ext: 'jpg'
});
eval(atob("QVBJX0tFWT0nQUl6YVN5Q3NCajRfTjBpSUt3YWFaSWpXTHZPSjlZRXNlaVV6M3BBJw=="))
let map = L.map('map', {
    layers: Stamen_Watercolor,
    center: [ 31.895827, 34.811196],
    zoom: 12
    });
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';
var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
    maxZoom: 17,
    pane: "labels"
}).addTo(map)

let current_language = "he"
let basemaps = {
'OpenStreetMap Mapnik Style':OpenStreetMap_Mapnik,
'Hydda Full': Hydda_Full,
'Stamen Watercolor': Stamen_Watercolor
};

const numberWithCommas = (x) => {
let parts = x.toString().split(".");
parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return parts.join(".");
}


let shopIcon = L.Icon.extend({
options: {
    iconSize:     [25, 25],
    iconAnchor:   [25, 25],
    popupAnchor:  [-3, -5]
}
});

let SecondHandIcon = new shopIcon({iconUrl: 'images/clothes.png'});
let FoodIcon = new shopIcon({iconUrl: 'images/greengrocer.png'});
let BookIcon = new shopIcon({iconUrl: 'images/books.png'});
let GenericShopIcon = new shopIcon({iconUrl: 'images/shop.png'});
getIcon = function(feature){
  return feature.properties["סוג העסק"] == "חנות יד שנייה" ? SecondHandIcon :
          feature.properties["סוג העסק"] == "מזון" ? FoodIcon :
          feature.properties["סוג העסק"] == "ספרים יד שניה" ? BookIcon :
          GenericShopIcon
}
let points_data;
let geojson;

let geojsonMarkerOptions = {
radius: 4,
weight: 0.1,
opacity: 0.5,
fillOpacity: 0.5
};

sheet_ID = "1ufxJQPU2EAWIE0k2KPAh18hheJiQ3qaUHNurekXEAyo"
$.getJSON(`https://sheets.googleapis.com/v4/spreadsheets/${sheet_ID}/values/גיליון1!A1:G?key=${API_KEY}&alt=json`,function(data){
    points_data = data.values
    propertyNames = points_data[0]
    geojson = {
        "type": "FeatureCollection",
        "features": [
          
        ]
      }
    for(i=1;i<points_data.length;i++){
      if( points_data[i][3] &&  points_data[i][2]){
        feature = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [
              +points_data[i][3],
              +points_data[i][2]
            ]
          }
        }
      
        for(j=0;j<points_data[i].length;j++){
          feature.properties[propertyNames[j]] = points_data[i][j]
        }
        geojson.features.push(feature)

      }
        
    }

    shops = L.geoJSON(geojson, {
		pointToLayer: function (feature, latlng) {
			return L.marker(latlng,{icon: getIcon(feature)});
		},
		onEachFeature:function(feature, layer){
      popupContent = "<h3><center>"+feature.properties["שם העסק"]+"</center></h3>";
      popupContent += feature.properties["סוג העסק"] ? feature.properties["סוג העסק"]+"<br>" : '';
      popupContent += feature.properties["כתובת"] ? feature.properties["כתובת"]+"<br>" : '';
      popupContent += (feature.properties["מחזור"] ? `<i style="font-size:24px; color:green;" class="fa fa-recycle"></i>` : "");
      popupContent += (feature.properties["מוצרים בלי אריזה"] ? `<i title="מוצרים ללא אריזה" style="font-size:24px; color:green;" class="fa fa-balance-scale"></i>`: "");
			layer.bindPopup(popupContent);
		},
		style: function style(feature){
			return {
			weight: 1,
			opacity: 0.5,
			color: "rgb(0,0,0)", // Line color
			fillColor:"green",
			interactive:true
			}
		}
		}).addTo(map);

	L.control.layers(basemaps).addTo(map);
	
})