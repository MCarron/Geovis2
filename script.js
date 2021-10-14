function openNav() {
  document.getElementById("myFilter").style.width = "250px";
}

function closeNav() {
  document.getElementById("myFilter").style.width = "0";
}

// localisation lors du load de la page
var myMap = L.map('map', {center: [46.33, 6.97],
  minZoom: 3,
  maxZoom: 30,
  zoom: 13});



//////////////////////////////
////  COUCHES DE BASE ////////
/////////////////////////////

// création des const avec nos trois couches de bases (mapbox, google sat et google terrain)
const mapboxTiles = L.tileLayer('https://api.mapbox.com/styles/v1/theogerritsen/cktvgvy4d294h18lp92dm804n/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGhlb2dlcnJpdHNlbiIsImEiOiJja3R2Zzkybzkwa25oMm5tcGp1MWY0enh1In0.n_ye_r9ELbLqxyWl-giSlA', {
       attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a>',
       tileSize: 512,
       zoomOffset: -1
});

const osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  tileSize: 256,
  subdomains:['mt0','mt1','mt2','mt3']
});

const googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
tileSize: 256,
  subdomains:['mt0','mt1','mt2','mt3']
});

// on ajoute la couche qui s'affichera lors du load de la page
osmLayer.addTo(myMap);

/* var current_position, current_accuracy;

function onLocationFound(e){
  if (current_position) {
    myMap.removeLayer(current_position);
    myMap.removeLayer(current_accuracy);
  }

  var radius = e.accuracy/2;

  current_position = L.marker(e.latlng).addTo(myMap)
  .bindPopup(radius).openPopup();

  current_accuracy = L.circle(e.latlng, radius).addTo(myMap);
}

function onLocationError(e) {
  alert(e.message);
}

myMap.on('locationfound', onLocationFound);
myMap.on('locationerror', onLocationError);

function locate() {
  myMap.locate();
}

setInterval(locate, 3000); */
// bouton qui permet d'ajouter notre localisation sur la carte

lc = L.control.locate().addTo(myMap);

var fromCurrentPos = 'fromPoint'
var toSelectedMarker = 'toPoint';


// on va chercher notre localisation actuelle pour calculer l'itinéraire depuis notre position
myMap.on('locationfound', function (evt) {

  //on va chercher lat et long de notre position actuelle
  var currentPos = evt.latlng;

  // on reformate le résulat et on le lie à notre boite de dialogue
  $('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);
  fromCurrentPos == 'fromPoint';
  // notre position va être recaluclé toutes les 5 secondes
});

// on va chercher notre lieu de destination
myMap.on('click', function(e){

  var pt = e.latlng;

  $('#'+toSelectedMarker).val(pt.lat + ',' + pt.lng);

  toSelectedMarker == 'toPoint';

  console.log(toSelectedMarker)
});

// calculer l'itinéraire
function calculateRoute(){

  // on prend le point de départ
  var fromPoint = $('#fromPoint').val();
  // et le point d'arrivée
  var toPoint = $('#toPoint').val();


  // on fait le Query de notre route avec cpomme moyen de transport par défaut la voiture
  makeRoutingQuery({
      fromPlace: fromPoint,
      toPlace: toPoint,
      mode: 'CAR',
  });
}

// s'il est possible de faire la route, on la dessine avec la fonction drawRoute
function makeRoutingQuery(data){
  $.ajax({
    url: 'http://localhost:8080/otp/routers/ch/plan',
    type: 'GET',
    dataType: 'json',
    data: data,
    success: drawRoute,
    error: calculateRouteError,
    beforeSend: setHeader
  });
}

function setHeader(xhr){
  xhr.setRequestHeader('Accept', 'application/json');
}

// dessiner l'itinéraire
function drawRoute(data){
  console.log('drawRoute', data);

  if (data.error){
    alert(data.error.msg);
    return;
  }

  // Show the first itinerary (OTP returns several alternatives)
  // on prend le premier itinéraire qu'OTP nous propose
  var itin = data.plan.itineraries[0];
  for (var i=0; i < itin.legs.length; i++){
    var leg = itin.legs[i].legGeometry.points;
    var geomLeg = polyline.toGeoJSON(leg);
    window.GEOM = geomLeg;
    document.getElementById('geojson').innerText = JSON.stringify(geomLeg);
    L.geoJSON(geomLeg, {
      style: function(feature){
        return { 
          color: '#0000ff',
          opacity: 0.7
        };
      }
    }).addTo(myMap);
  }

  // Show origin and destination

  var origin = L.circleMarker(
    [data.plan.from.lat, data.plan.from.lon],
    {
      color: '#000000',
      fillOpacity: 0.5,
      fillColor: '#ff0000'
    }
  ).addTo(myMap);
  
  var destination = L.circleMarker(
    [data.plan.to.lat, data.plan.to.lon],
    {
      color: '#000000',
      fillOpacity: 0.5,
      fillColor: '#0000ff'
    }
  ).addTo(myMap);

}

function calculateRouteError(error){
  alert('Error during route calculation.');
  console.log('Routing error', error);
}


// on insère nos trois couches dans un variable
const baseMaps = {
  "OpenStreetMap": osmLayer,
  "Mapbox": mapboxTiles,
  "Satellite": googleSat,
  "Terrain": googleTerrain
};

const overlays = {};

// on ajoute le controleur en haut a droite pour changer de couche à notre guise
L.control.layers(baseMaps, overlays).addTo(myMap);

// ajout de l'échelle à la carte

L.control.scale({
  position: 'bottomleft'
}).addTo(myMap);


///Création de nos icon///
// dans un premier temps on importe notre icone personnel

var iconePerso = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.png',
  iconSize: [28, 41]
});

// ajout des markers: 
  // dans un premier temps on créer une fonction qui permet nous permettra de voir quel est le nom de chaque spots lorsque l'on clique dessus
  // on ajoute ensuite nos marker en utilisant ceux qu'on a créer nous-même)
function onEachFeature(feature, layer) {
  if (feature.properties) { 
      layer.bindPopup("<h1>" + feature.properties.Nom + "</h1>" + "<h2>" + feature.properties.Type_voies + "</h2>");
      }
  }
var lieux_grimpe = new L.geoJson(spots, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature,latlng){
    return L.marker(latlng,{icon: iconePerso});
  }
}).addTo(myMap);