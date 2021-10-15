function openNav() {
  document.getElementById("myFilter").style.width = "250px";
}

function closeNav() {
  document.getElementById("myFilter").style.width = "0";
}

// localisation lors du load de la page
var myMap = L.map('map', {center: [46.33, 6.97],
  minZoom: 10,
  maxZoom: 18,
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
      layer.bindPopup("<h1>" + feature.properties.Nom + "</h1>" +
       "<h4>" + feature.properties.Desc +"</h4>"+ "<h2>Type de voies: </h2><h4>" +
        feature.properties.Type_voies + "</h4>" +'>Press for more INFO </button>');
      }
  }
var lieux_grimpe = new L.geoJson(spots, {
  onEachFeature: onEachFeature,
  pointToLayer: function(feature,latlng){
    return L.marker(latlng,{icon: iconePerso});
  }
}).addTo(myMap);









lc = L.control.locate().addTo(myMap);

var fromCurrentPos = 'fromPoint'
var toSelectedMarker = 'toPoint';
var toSelectedName ='toName';


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
lieux_grimpe.on('click', function(e){

  // on va chercher les coordonnées lat long du marqueur sur lequel on a cliqué
  var pt = e.latlng;
  //on va chercher le nom du marqueur sur lequel on a cliqué
  var content = e.layer.feature.properties.Nom;
  // puis on ajoute les coordonnées lat long du marqueur dans l'input hidden pour calculer l'itinéraire
  $('#'+toSelectedMarker).val(pt.lat + ',' + pt.lng);
  toSelectedMarker == 'toPoint';

  // on change le text de l'input pour qu'il corresponde au site sur lequel on a cliqué
  $('#'+toSelectedName).val(content);
  toSelectedName == 'toName';
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
      mode: 'WALK',
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

/////////////////////////////////
///  DESSINER ITIN /////////////
//////////////////////////////

// On set notre variable a null pour pouvoir le reset à chaque nouveau calcul
var geojsonLayer = null;
function drawRoute(data){
  if (data.error){
    alert(data.error.msg);
    return;
  }
  // si notre layer est différent de null (donc si notre itin a déjà été dessinée)
  // on enlève la couche en question (geojson)
  if (geojsonLayer != null){
    myMap.removeLayer(geojsonLayer);
  }

  // Show the first itinerary (OTP returns several alternatives)
  // on prend le premier itinéraire qu'OTP nous propose
  var itin = data.plan.itineraries[0];
  for (var i=0; i < itin.legs.length; i++){

    var leg = itin.legs[i].legGeometry.points;
    var geomLeg = polyline.toGeoJSON(leg);
    geojsonLayer = L.geoJSON(geomLeg, {
      style: function(feature){
        return { 
          border: 10,
          color: '#2ca8da',
          opacity: 0.7,
          weight: 10
        };
      }
    }).addTo(myMap);
  }
}


function calculateRouteError(error){
  alert('Error during route calculation.');
  console.log('Routing error', error);
}
