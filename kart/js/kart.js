var gothashloc = false;
var hashloc = window.location.hash.substring(1).split(",")

if (hashloc.length == 3) {
    gothashloc = true;
    console.log(hashloc)
}
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

function dist(p1, p2) {
    var lat1 = p1[0],
        lat2 = p2[0],
        lon1 = p1[1],
        lon2 = p2[1],
        R = 6371, // km
        dLat = (lat2 - lat1).toRad(),
        dLon = (lon2 - lon1).toRad(),
        a,
        c,
        d;
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    d = R * c;
    return d;
}

var loc = [60.3713, 5.3380];
var resizeWindow = function () {
    var height = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName("body")[0].clientHeight
    document.getElementById("map").style.height = height + "px";
}
resizeWindow();
window.onresize = resizeWindow

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

function findMaxMinCoords(coords){
  var minLat=10000,
      minLon=10000,
      maxLat=0,
      maxLon=0;
  for(var i=0;i<coords.length;i++){
    var coord=coords[i];
    if(coord[0]<minLat) minLat=coord[0]
    if(coord[0]>maxLat) maxLat=coord[0]
    if(coord[1]<minLon) minLon=coord[1]
    if(coord[1]>maxLon) maxLon=coord[1]
  }
  return [[minLon,minLat],[maxLon,maxLat]]
}
function findBoundsForGeoJSON(geoJsonObj){
      var minLat=10000,
        minLon=10000,
        maxLat=0,
        maxLon=0;
    for(var i=0;i<geoJsonObj.features.length;i++){
        var featureCoords=geoJsonObj.features[i].geometry.coordinates,
            featureBounds;
        featureBounds=findMaxMinCoords(featureCoords);
        if(featureBounds[0][0]<minLon) minLon = featureBounds[0][0];
        if(featureBounds[1][0]>maxLon) maxLon = featureBounds[1][0];
        if(featureBounds[0][1]<minLat) minLat = featureBounds[0][1];
        if(featureBounds[1][1]>maxLat) maxLat = featureBounds[1][1];
    }
    return [[minLon,minLat],[maxLon,maxLat]]
}

var osm = L.tileLayer('//b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
var google = L.tileLayer("//mt{s}.google.com/vt?x={x}&y={y}&z={z}&lyrs=s", { name: "googlem", alt: "Google aerial", attribution: "Google", subdomains: "0123", tileSize: 256, minZoom: 0, maxZoom: 18 });
var kartverket = L.tileLayer('//opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}', {
    "minZoom": 0, "maxZoom": 17, "tileSize": 256,
    "attribution": "Kartgrunnlag: Statens kartverk (<a href='http://creativecommons.org/licenses/by-sa/3.0/no/'>cc-by-sa-3.0</a>)"
});

var bikemap = L.tileLayer("//geo-elzapp.rhcloud.com/tiles/bikemap/{z}/{x}/{y}.png", { attribution: "Map data © 2011 OpenStreetMap contributors", "minZoom": 11, "maxZoom": 17, "tileSize": 256 })
var route=L.geoJson();
var map = L.map('map', { "center": loc, "zoom": 15, "layers": [kartverket,route] })

           var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                  var geoJsonObj=toGeoJSON["gpx"]((new DOMParser()).parseFromString(xhttp.responseText, 'text/xml'));
                  bounds=findBoundsForGeoJSON(geoJsonObj)
                  map.fitBounds(bounds);
                  route.addData(geoJsonObj)
                }

            };
            L.control.layers({"Statens Kartverk": kartverket, "Google": google, "openStreetMap": osm }, {"Rute":route}).addTo(map);
            xhttp.open("GET", "routes/jd.gpx", true);
  xhttp.send();




var timeout = null;
var findMe = function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {

            var l = new L.LatLng(position.coords.latitude, position.coords.longitude);
            if (dist(loc, [position.coords.latitude, position.coords.longitude]) < 20) map.setView(l, 16, false);
            console.log(dist(loc, [position.coords.latitude, position.coords.longitude]))
            if (position.coords.accuracy < 500) {
                L.circle([position.coords.latitude, position.coords.longitude], position.coords.accuracy).addTo(map);
            }
        });
    }
}

if (!gothashloc) {
    //findMe();
} else {
    var l = new L.LatLng(hashloc[1], hashloc[2]);
    map.setView(l, hashloc[0], false);
}

map.on('moveend', function (e) {
    var lat,lon,zoom;
    console.log(map.getCenter())
    lat = map.getCenter().lat
    lon = map.getCenter().lng
    zoom = map.getZoom()
    window.location.hash = "#" + zoom + "," + lat + "," + lon;
});
