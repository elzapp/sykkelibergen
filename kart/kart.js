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
    var lat1 = p1[0];
    var lat2 = p2[0];
    var lon1 = p1[1];
    var lon2 = p2[1];
    var R = 6371; // km
    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
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
var cloudMade = L.tileLayer('http://b.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
    maxZoom: 18
})
var osm = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
});
var google = L.tileLayer("http://mt{s}.google.com/vt?x={x}&y={y}&z={z}&lyrs=s", { name: "googlem", alt: "Google aerial", attribution: "Google", subdomains: "0123", tileSize: 256, minZoom: 0, maxZoom: 18 });
var kartverket = L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}', {
    "minZoom": 0, "maxZoom": 17, "tileSize": 256
});

var bikemap = L.tileLayer("http://geo-elzapp.rhcloud.com/tiles/bikemap/{z}/{x}/{y}.png", { attribution: "Map data © 2011 OpenStreetMap contributors", "minZoom": 11, "maxZoom": 17, "tileSize": 256 })
var map = L.map('map', { "center": loc, "zoom": 15, "layers": [kartverket] })

//.setView([60.3713, 5.3380], 15);
L.control.layers({"Statens Kartverk": kartverket, "Google": google, "cloudmade": cloudMade, "openStreetMap": osm }).addTo(map);


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
    findMe();
} else {
    var l = new L.LatLng(hashloc[1], hashloc[2]);
    map.setView(l, hashloc[0], false);
}

map.on('moveend', function (e) {
    console.log(map.getCenter())
    var lat = map.getCenter().lat
    var lon = map.getCenter().lng
    var zoom = map.getZoom()
    window.location.hash = "#" + zoom + "," + lat + "," + lon;
});