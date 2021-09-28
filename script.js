const width = document.getElementById("map").offsetWidth*0.7,
    margin = {top: 70, right: 20, bottom: 0, left: 120},
    height = 600;


///Création d'une const avec avec les données sur nos diffférents spots de grimpe'///

const spots = [
  ["Drapel", 46.32326378721646, 6.977545629058104],
  ["Yvrone (Le château)",46.339930024925245, 6.949014869239109],
  ["Corbeyrier (La feuille)", 46.35321024972724, 6.953289858538657],
  ["Verschiez (Dalle à Besson)",46.30864100076279, 6.978640113918804],
  ["verschiez (Les Noces)", 46.30713193891389, 6.974397011572421],
  ["St-triphon", 46.29490025429281, 6.977447832828999],
  ["Veyges", 46.33473359297587, 6.97983360713883],


];

// localisation lors du load de la page
const myMap = L.map('map').locate({setView: true, maxZoom: 18, minZoom: 11});
  
myMap.setMaxBounds([[46, 6], [47,7.5]]);

//////////////////////////////
////  COUCHES DE BASE ////////
/////////////////////////////

// création des const avec nos trois couches de bases (mapbox, google sat et google terrain)
const mapboxTiles = L.tileLayer('https://api.mapbox.com/styles/v1/theogerritsen/cktvgvy4d294h18lp92dm804n/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGhlb2dlcnJpdHNlbiIsImEiOiJja3R2Zzkybzkwa25oMm5tcGp1MWY0enh1In0.n_ye_r9ELbLqxyWl-giSlA', {
       attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
       tileSize: 512,
       zoomOffset: -1
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
mapboxTiles.addTo(myMap);

// On ajoute nos markeurs rerpésentant les spots de grimpe sur la carte 
for (var i = 0; i < spots.length; i++) {
  marker = new L.marker([spots[i][1],spots[i][2]])
    .bindPopup(spots[i][0])
    .addTo(myMap);
}

// on insère nos trois couches dans un variable
const baseMaps = {
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

// lorsque l'on trouve la localisation de l'utilisateur
function onLocationFound(e) {
  var radius = e.accuracy;

  // on ajoute un marqueur sur notre carte
  L.marker(e.latlng).addTo(myMap)
  // avec un pop up au dessus du marqueur
      .bindPopup("You are within " + radius + " meters from this point").openPopup();

      //on ajoute un cercle autour du marquer qui correspond à la précision de la géolocalisation
  L.circle(e.latlng, radius).addTo(myMap);
}

// message d'erreur si la localisation de l'utilisateur n'a pas été trouvée
myMap.on('locationfound', onLocationFound);

function onLocationError(e) {
  alert(e.message);
}

myMap.on('locationerror', onLocationError);



