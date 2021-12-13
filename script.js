//////////////////////////////////////////////////
//////////// GESTION DES FENETRES ////////////////
/////////////////////////////////////////////////

// Fonction pour relier boutons du menu a actions de fenetres
$(function() {
	$(".btn").click(function(e){

		// Ajout de l'attribut "active" à la classe window (ajout 60% de height)
		// Depend de l'id du bouton sur lequel on appuie
		if (this.id == "bmap") {
			document.querySelector("#itinerary").classList.toggle("active");
			document.querySelector("#filters").classList.remove("active");
			document.querySelector("#infos").classList.remove("active");
		}	
		if (this.id == "bfilter") {
			document.querySelector("#itinerary").classList.remove("active");
			document.querySelector("#filters").classList.toggle("active");
			document.querySelector("#infos").classList.remove("active");
		}
		if (this.id == "bgroup") {
			document.querySelector("#itinerary").classList.remove("active");
			document.querySelector("#filters").classList.remove("active");
			document.querySelector("#infos").classList.toggle("active");
		}
		if (this.classList.contains("btnx")) {
			document.querySelector("#itinerary").classList.remove("active");
			document.querySelector("#filters").classList.remove("active");
			document.querySelector("#infos").classList.remove("active");
		}

		// Suppression de l'attribut active pour la classe eta-dist
		// Permet d'enelver l'indication de l'ETA + distance si l'utilisateur
		// appuie à nouveau sur un des boutons du menu
		$(".eta-dist").removeClass("active");
		e.preventDefault();
	});
});



//////////////////////////////////////////////////
////////// IMPLEMENTATION DE CARTE ///////////////
//////////////////////////////////////////////////

// Options de carte
let myMap = L.map('map', {
	
	// Gestion des parametres
	center: [46.33, 6.97],
	minZoom: 10,
	maxZoom: 18,
	zoom: 13,
	contextmenu: true,
	contextmenuWidth: 140,
	
	// Ajout de la fonction pour selectionner un point de depart
	contextmenuItems: [{
    	text: 'Define as start point',
    	callback: choseStartPoint
	}]
});

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

// Ajout de la couche pour le load de la page
osmLayer.addTo(myMap);

// Ajout des 4 couches dans une letiables pour le baseMaps controller
const baseMaps = {
  	"OpenStreetMap": osmLayer,
  	"Mapbox": mapboxTiles,
  	"Satellite": googleSat,
  	"Terrain": googleTerrain
};

// Ajout du controller en haut a droite pour changer de couche
const overlays = {};
L.control.layers(baseMaps, overlays).addTo(myMap);

// Ajout de l'échelle à la carte
L.control.scale({
  position: 'bottomleft'
}).addTo(myMap);



//////////////////////////////////////////////////
/////////// GESTION DES MARQUEURS ////////////////
//////////////////////////////////////////////////

// Importation des icones personalisées (defaut = rouge / filtree = jaune)
let iconePerso = L.icon({
  	iconUrl: 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg',
  	iconSize: [28, 41]
});

// Fonction pour afficher les infos de spots lorsque l'on clique dessus
/*
function onEachFeature(feature, layer) {
  	if (feature.properties) {
      	layer.bindPopup("<h1>" + feature.properties.Nom + "</h1>");/* +
       	"<h4>" + feature.properties.Desc +"</h4>"+ "<h2>Type de voies: </h2><h4>" +feature.properties.Type_voies + 
		   "<img src='" + feature.properties.img + "'>"+ "</h4>" +'>Press for more INFO </button>');
    }
}
*/

// Affichage des marqueurs
let lieux_grimpe = new L.geoJson(spots, {
  	onEachFeature: onEachFeature,
  	pointToLayer: function(feature,latlng){	
    	return L.marker(latlng,{icon: iconePerso});
  	}
}).addTo(myMap);


let btnEdit = document.createElement('button');
	btnEdit.textContent = 'INFORMATIONS';
    btnEdit.className = 'customPopup';
    //btnEdit.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Information-icon.svg/768px-Information-icon.svg.png";
    btnEdit.onclick = function () {
		document.querySelector("#itinerary").classList.remove("active");
		document.querySelector("#filters").classList.remove("active");
		document.querySelector("#infos").classList.add("active");
		popup.close()
	}

// Fonction pour afficher les infos (contenues dans nos marqueurs) dans le dernier onglet du slidebar
function onEachFeature(feature, layer) {
  layer.on('click', function(e) {
	$(".nome").html(feature.properties.Nom);
	$(".imagem").html(feature.properties.img);
	$(".type").html(feature.properties.Type_voies);
	$(".nbr").html(feature.properties.nbr_voies);
	$(".descricao").html(feature.properties.description);
	$(".diff").html(feature.properties.diff);
	let btnDiv = document.createElement('div');

	// Options de popup
	btnDiv.append(feature.properties.Nom);
	btnDiv.append(btnEdit);
	btnDiv.style.fontSize = "20px";
	btnDiv.style.display = "block";

	document.querySelector("#infos").classList.remove("active");
	if (feature.properties) {
		popup = layer.bindPopup(btnDiv).openPopup();	
  }});
}


//////////////////////////////////////////////////
/////////// OPEN TRIP PLANNER ////////////////////
/////////////////////////////////////////////////

// Ajout du controller de notre position actuelle
lc = L.control.locate().addTo(myMap);

// Définition des lieux de départ et d'arrivée pour notre GPS

// les 'from/to Name' mettront à jour les noms que l'utilisateur voit (from et to)
let fromSelectedPos = 'fromName';
let toSelectedName ='toName';

// les 'from/to Point' mettront à jour les coordonnées pour que OTP puisse calculer l'itineraire
// ces coordonnees sont invisibles pour l'utilisateur
let fromCurrentPos = 'fromPoint';
let toSelectedMarker = 'toPoint';

let popup = L.popup();

// Calcul de notre localisation actuelle pour calculer l'itinéraire depuis notre position
currentPos = null;

myMap.on('locationfound', function (evt) {

  	// lat/long de la position actuelle de l'utilisateur
  	currentPos = evt.latlng;

  	// Reformatage du résulat et renvoi à notre boite de dialogue
  	// correspond au input invisible
  	$('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);
  	fromCurrentPos == 'fromPoint';

  	// Correspond à l'input visible
  	$('#'+fromSelectedPos).val('Current position');
  	fromSelectedPos == 'fromName';
	
  	// On rend actif le filtre de distance
  	$('#slider1').removeClass("notactive");
});

let origin = null

// Definition du starting point si autre que position actuelle
function choseStartPoint (e) {
  	currentPos = e.latlng;
  	if (origin != null){
    	myMap.removeLayer(origin);
  	}

  // Desactivaction 'locate control' pour qu'il update pas si on choisit selectedPos
  // (sinon il remplace la position selectionnee par la position actuelle)
  	lc._deactivate()

  // Ajout d'un marqueur pour indiquer la position selectionnee
  	origin = L.circleMarker(
    	[currentPos.lat, currentPos.lng],
    	{
      		color: '#FFFFFF',
      		fillOpacity: 1,
      		fillColor: '#ff2828'
    	}
  	).addTo(myMap);

	// Reformatage du résulat et renvoi à notre boite de dialogue
  	// correspond au input invisible
  	$('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);
  	fromCurrentPos == 'fromPoint';

	// Correspond à l'input visible
  	$('#'+fromSelectedPos).val('Selected position');
  	fromSelectedPos == 'fromName';

	// Affichage du popup
  	origin.bindPopup("Selected start point");

	// Activation du filtre de distance
	$('#slider1').removeClass("notactive");
}


// Fonction lors de clic sur lieu de destination
lieux_grimpe.on('click', function(e){

	// Enlever eventuels highlights de marqueurs
	for (layer in lieux_grimpe._layers) {

		// Retablissement du style de base pour tous les marqueurs
		if (lieux_grimpe._layers[layer]._icon.src == "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge_h.svg"){
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg";
		}
		if (lieux_grimpe._layers[layer]._icon.src == "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune_h.svg"){
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg";
		}
	}

	// Highlight du marqueur
	switch (e.layer._icon.src) {
  
		case 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg':
			e.layer._icon.src = 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge_h.svg';
			break;
		case 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge_h.svg':
			e.layer._icon.src =  'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg';
			break;
		case 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg':
			e.layer._icon.src =  'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune_h.svg';
			break;
		case 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune_h.svg':
			e.layer._icon.src =  'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg';
			break;
  		}


  	// Coordonnées lat long du marqueur sur lequel on a cliqué
  	let pt = e.latlng;

  	// Nom du marqueur sur lequel on a cliqué (lieu de grimpe)
  	let content = e.layer.feature.properties.Nom;

  	// Ajout des coordonnées lat long du marqueur dans l'input hidden pour calculer l'itinéraire
  	$('#'+toSelectedMarker).val(pt.lat + ',' + pt.lng);
  	toSelectedMarker == 'toPoint';

  	// Changement du texte de l'input pour qu'il corresponde au site sur lequel on a cliqué
  	$('#'+toSelectedName).val(content);
  	toSelectedName == 'toName';
});

/*
 * Changement de la valeur de date & heure sélectionnee pour la date et heure actuelle.
 * Le format de date js n'inclut pas les 0 devant chiffres seuls, donc problème pour mettre à jour l'input
 * -> Rajouter un 0 devant les sections concernées (mois, jour, heure, min, sec)
 * -> Puis avec slice(-2), garder uniquement les 2 derniers caractères de notre string
 *    - si 8 secondes  -> 08
 *    - si 18 secondes -> 018 -0 (puisqu'on garde uniquement les 2 derniers caractères) -> 18
 */
function setCurrentTime() {
	let d = new Date();
	$('#time-select').val(d.getFullYear()+"-"+
		('0'+ (d.getMonth() + 1)).slice(-2)+"-"+
		('0'+ d.getDate()).slice(-2)+
		"T"+ ('0'+d.getHours()).slice(-2)+
		":"+ ('0'+d.getMinutes()).slice(-2)+
		":"+ ('0'+d.getSeconds()).slice(-2));
}

/*
 * 1. Calcul de la route (starting point to ending point)
 * 2. Rcupération des paramètres voulus pour OTP (makeRoutingQuery)
 */
function calculateRoute(){
	
	// Dé-zoom et fermeture du menu pour voir l'itinéraire
	myMap.setView([46.33, 6.79], 10);
	$("#itinerary").removeClass("active");
	// Ouverture du menu eta-dist (seulement si currentPos existant)
	if (currentPos != null) {
		eta_dist.classList.toggle("active");
	}

  	// Point de départ & d'arrivee
  	let fromPoint = $('#fromPoint').val();
  	let toPoint = $('#toPoint').val();

	// Heure customisée indiquée par l'utilisateur
	let selectedDateTime = $('#time-select').val();

	// Conversion de la date indiquée
	selectedDateTime = new Date(selectedDateTime);
	console.log(selectedDateTime);

	// Recupération de la date et heure indiquée dans un format convenable pour OTP
	let selectedDate = selectedDateTime.getFullYear() + '-' + (selectedDateTime.getMonth()+1) + '-' + selectedDateTime.getDate();
	let selectedTime = selectedDateTime.getHours() + ":" + selectedDateTime.getMinutes() + ":"  + selectedDateTime.getSeconds();

   	// Query de notre route
   	makeRoutingQuery({
    	fromPlace: fromPoint,
    	toPlace: toPoint,
    	time: selectedTime,
    	date: selectedDate,
    	mode: chosenMode
  	});
}

/**
 * AUTOCOMPLETE DE LA DESTINATION
 */
 var options = [{
	"label": "46.308767920299452, 6.978613659578678",
	"value": "Verschiez (Dalle à Besson)"
},
{
	"label": " 46.306903847814702, 6.976375793764475",
	"value": "Versciez (Les Noces)"
},
{
	"label": "46.308629544862868, 6.972804361990741",
	"value": "Aigle"
},
{
	"label": "46.321872864773226, 6.978318141740336",
	"value": "Drapel"
},
{
	"label": "46.329283379218218, 6.97922262741458",
	"value": "Roc des Veyges"
},
{
	"label": "46.33108581757196, 6.978411650326897",
	"value": "Jardin suspendu"
},
{
	"label": "46.34140823995979, 6.95448726592305",
	"value": "Vers-Cor"
}
];

$("#toName").autocomplete({
	lookup: options,
	onSelect: function (suggestion) {
		$('#toPoint').val(suggestion.label);
	}
});

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

	// Activer legendes d'infos
	let infosLegends = document.querySelectorAll(".unactive");
		infosLegends.forEach(infosLegend => {	
			infosLegend.classList.remove("unactive");
		});
});

// Indication du chemin pour OTP
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

// Letiable contenant l'ensemble de nos polylines (groupées dans une couche)
let polylineGroup = L.layerGroup().addTo(myMap);

// Fonction pour dessiner la route
function drawRoute(data){
  	if (data.error){
    	alert("Couldn't calculate itinerary, try to change the time");
    	return;
  	}

  	// Retrait de notre polylinegroup pour redessiner nouvel itineraire
  	polylineGroup.clearLayers();
  
    // Problème OTP 2 : renvoie comme 1er itinéraire pour TRANSIT,WALK uniquement le chemin à pied
    // -> il faut donc aller chercher le 2e itinéraire si TRANSIT,WALK est choisi
    // -> et le 1er itinéraire si les autres modes sont choisis

    // Obtention du mode de transport choisi
    let transp_mode = data.requestParameters.mode;

    // Application de la fonction choseItin qui switch entre
	// -> 1 (2e itineraire si TRANSIT,WALK est choisi) et
	// -> 0 (1er itineraire si autres moyens de transports)
    let itin = data.plan.itineraries[choseItin(transp_mode)]
    
	// Verification dans le code
    console.log('data', data)
    console.log('itin', itin)

	// Boucle d'iteration parmi les differents points geometrique
    for (let i=0; i < itin.legs.length; i++){

    	// Recherche de chaque point géométrique propose par OTP
      	let leg = itin.legs[i];

      	// Obtention du mode de transport pour chaque leg (pour icone surement)
      	let leg_mode = leg.mode
      	console.log(leg_mode)
      	let steps = leg.steps;
        for (let f = 0; f < steps.length; f++){
          	let step = steps[f];
          	console.log(step)
        }

        // Conversion chaque point en GeoJson
        let geomLeg = polyline.toGeoJSON(leg.legGeometry.points);

        // Style de polyline
      	let geojsonLayer = L.geoJSON(geomLeg, {
        	style: {
            	//"border": 10,
            	"color": setColor(leg_mode),
            	"opacity": 0.9,
            	"weight": 8,
            	"dashArray": setDash(leg_mode)
        	}
        
		// Ajout de chaque polyline à notre layergroup
      	}).addTo(polylineGroup);
    }

	// Durée en minutes du trajet
	let duree = Math.round(itin.duration/60)

	// Heure d'arrivée
	let eta = new Date(itin.endTime);
	let etaTime = ('0'+ eta.getHours()).slice(-2) + 
	":" + ('0' + eta.getMinutes()).slice(-2);
	$('#eta').html('Arriving at '+etaTime+', duration : '+duree+' minutes');

  	// Distance en km du trajet
  	let dist = Math.round((itin.walkDistance/1000)*100) / 100
	$('#dist').html('Total distance : ' + dist + ' km')
}

/*
// Fonction pour definir le temps actuel
function setCurrentTime() {
 	let d = new Date();
 	$('#time-select').val(d.getFullYear()+"-"+
 		('0'+ (d.getMonth() + 1)).slice(-2)+"-"+
 		('0'+ d.getDate()).slice(-2)+
 		"T"+ ('0'+d.getHours()).slice(-2)+
 		":"+ ('0'+d.getMinutes()).slice(-2)+
 		":"+ ('0'+d.getSeconds()).slice(-2));
}
*/

/**
 * Fonction switch pour TRANSIT,WALK et tous les autres modes
 * @param {*} mode Mode de transport choisi par l'utilisateur
 * @returns 2e itin pour TRANSIT,WALK, 1er itin pour tous les autres
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



//////////////////////////////////////////////////
//////////// GESTION DES FILTRES /////////////////
/////////////////////////////////////////////////

// Initialisation du type de transport
let chosenMode = "CAR";

// Filtre des modes de transport et des types de voies
$(".buttons_type").click(function(e){
	
	// Filtre des modes de transport
	if ($(this).hasClass("transp_filters")) {
		// Desactiver tous les filtres
		let filtertransports = document.querySelectorAll(".transp_filters");
		filtertransports.forEach(filtertransport => {	
			filtertransport.classList.remove("active");
		});
		// Activer filtre selectionne
		$(this).addClass("active");

		// Actualisation du mode de transport
		chosenMode = $(this).val();
	};

	// Filtre des types de voies
	if ($(this).hasClass("type_filters")) {
		// Changer etat du filtre selectionne
		$(this).toggleClass("active");
	
		// Actualisation de la liste des filtres actives
		filter_type_val = [];
		let filter_types = document.querySelectorAll(".buttons_type");
		filter_types.forEach(filtertype => {	
			if (filtertype.classList.contains("active")) {
				filter_type_val.push(filtertype.value);
			};
		});
	};
});

// Valeur des filtres coulissants
var output1 = $('#output1'); // distance
var output2 = $('#output2'); // nombre de voies
var output3 = $('#output3'); // altitude
var output4 = $('#output4'); // difficulte

// Filtre des distances
$('#slider1').noUiSlider({
    start: [0, 300], 
    range: {
        'min': [0],
        'max': [300],
    },
	step: 1,
	connect: true
}).on('slide', function() {
    if ($(this).hasClass("notactive")) {
		$("#slider1").val([ "0.00", "300.00" ]);
		alert("Chose a location on the map or activate your location to use this filter.");
	}
	else {
		let valueF = [parseInt($(this).val()[0]),parseInt($(this).val()[1])];
		output1.html(valueF.join(' - ')  + " km");
	}
});

// Filtre du nombre de voies
$('#slider2').noUiSlider({
    start: [0, 250], 
    range: {
        'min': [0],
        'max': [250],
    },
	step: 1,
	connect: true
}).on('slide', function() {
	let valueF = [parseInt($(this).val()[0]),parseInt($(this).val()[1])];
	output2.html(valueF.join(' - '));
});

// Filtre de l'altitude
$('#slider3').noUiSlider({
    start: [0, 3000], 
    range: {
        'min': [0],
        'max': [3000],
    },
	step: 1,
	connect: true
}).on('slide', function() {
	let valueF = [parseInt($(this).val()[0]),parseInt($(this).val()[1])];
	output3.html(valueF.join(' - ')  + " m");});

// Filtre de la difficulté
$('#slider4').noUiSlider({
    start: [0, 26], 
    range: {
        'min': [0],
        'max': [26],
    },
	step: 1,
	connect: true
}).on('slide', function() {
	let valueF = [parseInt($(this).val()[0]),parseInt($(this).val()[1])];
	output4.html(valueF.join(' - '));});

// Initialisation de la liste contenant les types de voie actuellement selectionnes par le filtre
let filter_type_val = ["Couennes", "Longues voies", "Salle"];

// Fonction d'application des filtres aux marqueurs
function applyFilters(){

	// Fermeture de la fenetre de filtres
	$("#filters").removeClass("active");

	// Preparation des vecteurs pour accueillir les valeurs de longitude et latitude
	let latfiltered = [];
	let lngfiltered = [];

	// Boucle d'iteration a travers les marqueurs
	for (layer in lieux_grimpe._layers) {

		// Retablissement du style de base pour tous les marqueurs
		lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg";

		// Definition de distance entre le point de depart et chaque filtre
		let distance = -1; // Initialisation d'une distance "absurde", utile pour les conditions de filtre
		if (currentPos != null) {

			// Calcul des distances horizontales et verticales au point de depart
			vdist = (lieux_grimpe._layers[layer]._latlng.lat - currentPos.lat)*110.574;
			hdist = (lieux_grimpe._layers[layer]._latlng.lng - currentPos.lng)*111.320*Math.cos((lieux_grimpe._layers[layer]._latlng.lat)* (Math.PI/180));
		
			// Calcul de la distance au point de depart
			distance = Math.sqrt(Math.pow(vdist, 2) + Math.pow(hdist, 2));
		}
		
		// Extraction du nombre de voies
		let n_voies = lieux_grimpe._layers[layer].feature.properties.nbr_voies;

		// Extraction du type de voies
		let t_voies = lieux_grimpe._layers[layer].feature.properties.Type_voies;
		
		// Identification des sites respectant les différentes conditions de filtre
		
		// Conditions de distance : si currentPos n'est pas identifie, la distance n'a aucune incidence
		if ((distance >= $('#slider1').val()[0] && distance <= $('#slider1').val()[1]
		|| currentPos == null)

		// Condition du nombre de voies
		&& n_voies >= $('#slider2').val()[0] && n_voies <= $('#slider2').val()[1]
		
		// Condition du type de voies
		//&& filter_type_val.includes(t_voies)
		){
			// Mise en evidence des icones correspondantes
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg";

			// Stockage des infos de longitude-latitude pour ajuster par la suite la carte aux icones concernees
			latfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lat));
			lngfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lng));
		}
	}

	// Calcul du centre de la carte (coordonnees horizontale et verticale)
	let latcenter = (Math.min.apply(Math,latfiltered) + Math.max.apply(Math,latfiltered))/2;
	let lngcenter = (Math.min.apply(Math,lngfiltered) + Math.max.apply(Math,lngfiltered))/2;

	// Calcul de l'extent de la carte = largeur & hauteur (coordonnees horizontale et verticale)
	let latextent = (Math.max.apply(Math,latfiltered) - Math.min.apply(Math,latfiltered))*110.574;
	let lngextent = (Math.max.apply(Math,lngfiltered) - Math.min.apply(Math,lngfiltered))*111.320*Math.cos(latcenter * (Math.PI/180));

	// Obtention de la largeur & hauteur de l'ecran du device
	let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	let height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

	// Calcul du ratio le plus critique entre largeur & hauteur
	let wRatio = width/latextent;
	let hRatio = height/lngextent;
	let maxRatio = Math.min(wRatio,hRatio);

	// Determination du nombre de pixels recouvert par niveau de zoom

	



	// metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);

	let maxextent = Math.min(latextent,lngextent);

	// Changement de zoom sur la carte en fonction des parametres calcules
	if (latfiltered.length != 0) {
		myMap.setView([latcenter, lngcenter], 11);
	}
	else alert("No location matches these conditions.");
};

// Fonction de reinitialisation des filtres
function resetFilters(){
	
	// Retablissement des valeurs par defaut des differents filtres
	$("#slider1").val([ "0", "300" ]);
	output1.html("0 - 300 km");
	$("#slider2").val([ "0", "250" ]);
	output2.html("0 - 250");
	$("#slider3").val([ "0", "3000" ]);
	output3.html("0 - 3000 m");
	$("#slider4").val([ "0", "26" ]);
	output3.html("1a - 9c");

	// Redefinition du style de base pour tous les marqueurs
	for (layer in lieux_grimpe._layers) {
		lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg"
		if (lieux_grimpe._layers[layer].feature.properties.Nom == $(".nome").html()) {
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge_h.svg"
		};
	};
}