const width = document.getElementById("map").offsetWidth*0.7,
    margin = {top: 70, right: 20, bottom: 0, left: 120},
    height = 600;


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




