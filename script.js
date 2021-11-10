function openNav() {
  document.getElementById("myFilter").style.height = "250px";
}

function closeNav() {
  document.getElementById("myFilter").style.height = "0";
}

/**
* Implémentation de la carte 
*/
let myMap = L.map('map', {center: [46.33, 6.97],
	minZoom: 10,
	maxZoom: 18,
	zoom: 13,
	contextmenu: true,
	contextmenuWidth: 140,
	contextmenuItems: [{
    	text: 'Define as start point',
    	callback: choseStartPoint
	}]
});

//////////////////////////////
////  COUCHES DE BASE ////////
/////////////////////////////

// Ajout de nos couches de base (layers)
const mapboxTiles = L.tileLayer('https://api.mapbox.com/styles/v1/theogerritsen/cktvgvy4d294h18lp92dm804n/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGhlb2dlcnJpdHNlbiIsImEiOiJja3R2Zzkybzkwa25oMm5tcGp1MWY0enh1In0.n_ye_r9ELbLqxyWl-giSlA', {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a>',
    tileSize: 512,
       oomOffset: -1
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

//Ajout de la couche pour le load de la page

osmLayer.addTo(myMap);

/**
 * Ajout des 4 couches dans une letiables pour
 * le baseMaps controler
 */
const baseMaps = {
  	"OpenStreetMap": osmLayer,
  	"Mapbox": mapboxTiles,
  	"Satellite": googleSat,
  	"Terrain": googleTerrain
};

const overlays = {};

// Ajout du controleur en haut a droite pour changer de couche
L.control.layers(baseMaps, overlays).addTo(myMap);

// Ajout de l'échelle à la carte

L.control.scale({
  position: 'bottomleft'
}).addTo(myMap);


///Création de nos icon///

/**
 * Importation de l'icone personalisée
 */
let iconePerso = L.icon({
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

let lieux_grimpe = new L.geoJson(spots, {
  	onEachFeature: onEachFeature,
  	pointToLayer: function(feature,latlng){
    	return L.marker(latlng,{icon: iconePerso});
  	}
}).addTo(myMap);

//////////////////////////////////////////////////
/////////// OPEN TRIP PLANNER ////////////////////
/////////////////////////////////////////////////

// Ajout du controleur de notre position actuelle
lc = L.control.locate().addTo(myMap);

// Définition des liezux de départ et d'arrivée pour notre GPS
// les 'from/to Name' mettront à jour les noms que l'utilisateurs voit (from et to)
let fromSelectedPos = 'fromName';
let toSelectedName ='toName';

// les 'from/to Point' mettront à jour les coordonnées pour que OTP puisse calculer l'itinéraire
// ces coordonnées sont invisibles pour l'utilisateur
let fromCurrentPos = 'fromPoint'
let toSelectedMarker = 'toPoint';

let popup = L.popup();

/**
 * Calcul de notre localisation actuelle pour calculer l'itinéraire depuis notre position
 */
myMap.on('locationfound', function (evt) {

  	// lat / long de la position actuelle de l'utilisateur
  	let currentPos = evt.latlng;

  	// On reformate le résulat et on le lie à notre boite de dialogue
  	// correspond au input invisible
  	$('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);

  	fromCurrentPos == 'fromPoint';

  	// Correspond à l'input visible
  	$('#'+fromSelectedPos).val('Current position');
  	fromSelectedPos == 'fromName'
});

let origin = null

/**
 * Définition du starting point si autre que position actuelle
 */
function choseStartPoint (e) {
  	let currentPos = e.latlng;
  	if (origin != null){
    	myMap.removeLayer(origin);
  	}

  // On désactive locate control pour qu'il update pas si on choisit selectedPos
  // sinon il remplace la position sélectionnée par notre pos actuelle

  	lc._deactivate()

  // Ajout un marqueur pour indiquer la position qu'on a choisi
  	origin = L.circleMarker(
    	[currentPos.lat, currentPos.lng],
    	{
      		color: '#FFFFFF',
      		fillOpacity: 1,
      		fillColor: '#ff2828'
    	}
  	).addTo(myMap);

  	$('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);
  	fromCurrentPos == 'fromPoint';

  	$('#'+fromSelectedPos).val('Selected position');
  	fromSelectedPos == 'fromName'

  	origin.bindPopup("Selected start point");
}

/**
 * Lieu de destination (uniquement marqueur sélectionnable)
 */
lieux_grimpe.on('click', function(e){

  	// Coordonnées lat long du marqueur sur lequel on a cliqué
  	let pt = e.latlng;
  	//Nom du marqueur sur lequel on a cliqué (lieu de grimpe)
  	let content = e.layer.feature.properties.Nom;
  	// Ajout des coordonnées lat long du marqueur dans l'input hidden pour calculer l'itinéraire
  	$('#'+toSelectedMarker).val(pt.lat + ',' + pt.lng);
  
  	toSelectedMarker == 'toPoint';

  	// Changement du texte de l'input pour qu'il corresponde au site sur lequel on a cliqué
  	$('#'+toSelectedName).val(content);
  	toSelectedName == 'toName';
});

/**
 * Calcule de la route (starting point to ending point)
 * et récupération des paramètres voulus pour OTP (makeRoutingQuery)
 */
function calculateRoute(){
  	// Point de départ
  	let fromPoint = $('#fromPoint').val();
  	// Point d'arrivée
  	let toPoint = $('#toPoint').val();

  	// Mode de transport choisi par l'utilisateur
  	let chosenMode = $('#mode-select').val();

	// Date et heure actuelle
	let today = new Date();
	let currentDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
	let currentTime = today.getHours() + ":" + today.getMinutes() + ":"  +today.getSeconds();

   	// Query de notre route
   	makeRoutingQuery({
    	fromPlace: fromPoint,
    	toPlace: toPoint,
    	time: currentTime,
    	date: currentDate,
    	mode: chosenMode
  	});
}

/**
 * Indication du chemin pour OTP
 */
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

/////////////////////////////////////////////
//////////  DESSINER ITINERAIRE /////////////
/////////////////////////////////////////////

/**
 * letiable contenant l'ensemble de nos polylines (groupées dans une couche)
 */
let polylineGroup = L.layerGroup().addTo(myMap);

function drawRoute(data){
  	if (data.error){
    	alert("Couldn't calculate itinerary, try to change the time");
    	return;
  	}

  	// on enlève notre polylinegroup pour que les itinéraires
  	// se redessine à chaque fois qu'on les recalcule
  	polylineGroup.clearLayers();
  
    // problème avec OTP 2 qui renvoie comme premier itinéraire pour TRANSIT,WALK
    // uniquement le chemin à pied
    // il faut donc aller chercher le deuxième itinéraire si TRANSIT,WALK est choisi
    // et le premier itinéraire si les autres modes sont choisis

    // on va chercher le mode de transport choisi
    let transp_mode = data.requestParameters.mode

    // puis on applique la fonction choseItin qui switch entre 1 (deuxième itin si
    // TRANSIT,WALK est choisi) et 0 (tous les autres moyens de transports)
    let itin = data.plan.itineraries[choseItin(transp_mode)]
    

    console.log('data', data)
    console.log('itin', itin)
    for (let i=0; i < itin.legs.length; i++){
    	// on va chercher chaque point géométrique que OTP nous propose
      	let leg = itin.legs[i];

      	// on va chercher le mode de transport pour chaque leg (pour icone surement)
      	let leg_mode = leg.mode
      	console.log(leg_mode)
      	let steps = leg.steps;
        for (let f = 0; f < steps.length; f++){
          	let step = steps[f];
          	//console.log(step)
        }
        // on c$onvertit chaque point en geojson
        let geomLeg = polyline.toGeoJSON(leg.legGeometry.points);

        // Style de notre polyline
      	let geojsonLayer = L.geoJSON(geomLeg, {
        	style: {
            	//border: 10,
            	"color": setColor(leg_mode),
            	"opacity": 0.9,
            	"weight": 8,
            	"dashArray": setDash(leg_mode)
        	}
        // on ajoute chaque polyline à notre layergroup
      	}).addTo(polylineGroup);
      	//console.log(geojsonLayer)
    }

  	// Durée en minutes du trajet
  	let duree = itin.duration/60
  	// Distance en km du trajet
  	let dist = itin.walkDistance/1000
  	console.log(duree)
  	console.log(dist)
}

/**
 * Fonction switch pour TRANSIT,WALk et tous les autres modes
 * @param {*} mode Mode de transport choisi par l'utilisateur
 * @returns deuxième itin pour TRANSIT,WALK, premier itin pour tous les autres
 */
function choseItin(mode) {
  	switch (mode) {

    	case 'TRANSIT,WALK':
      		return 1;

    	default:
      		return 0;
  	}
}

/**
 * Définition de la couleur des polylines selon le mode de transport
 * @param {*} mode Mode de transport du leg
 * @returns Couleur selon le mode de transport
 */
function setColor(mode) {
  	switch (mode) {

    	case 'CAR':
      		return '#3f9cff';
    
    	case 'BICYCLE':
      		return '#73ff3f';
    
    	case 'WALK':
      		return '#3f9cff';
    
    	case 'RAIL':
      		return ' #ff3f3f';

    	case 'BUS':
      		return '#ffb33f';

    	case 'GONDOLA':
      		return '#82ff3f';

    	case 'SUBWAY':
      		return '#ecff08';

    	default:
      		return 'white';

  	}	
}

/**
 * Traitillé pour mode de transport = WALK
 * @param {*} mode Mode de transport choisi
 * @returns Traitillé si mode = WALK, null si autre moyen de transport
 */
function setDash(mode) {
  	switch(mode) {

    	case 'WALK':
      		return '1, 15';

    	default:
      		return 'null';
  	}
}

function calculateRouteError(error){
  	alert('Error during route calculation.');
  	console.log('Routing error', error);
}
