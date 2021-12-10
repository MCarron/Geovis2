let windows = document.querySelectorAll(".window");
let eta_dist = document.querySelector(".eta-dist");

$(function() {
	$(".btn").click(function(e){
		// Ajout l'attribut active à la classe window
		// On ajoute 60% de height à cette classe, donc visible si on appuie sur un des menus
		
		windows.forEach(window => {
			console.log(window)
	  		if (window.classList.contains("active")) {
        		window.classList.remove("active");
      		};
		});

		if (this.id == "bmap") {
			document.querySelector("#itinerary").classList.add("active");
		}
		
		if (this.id == "bfilter") {
			document.querySelector("#filters").classList.add("active");
		}

		if (this.id == "bgroup") {
			document.querySelector("#infos").classList.add("active");
		}

		// Suppression de l'attribut active pour la classe eta-dist
		// Permet d'enelver l'indication de l'ETA + distance si l'utilisateur
		// appuie à nouveau sur un des boutons du menu
		$(".eta-dist").removeClass("active");
		e.preventDefault();
	});
});

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
									//////////////////////////
									///Création de nos icon///
									//////////////////////////


///Importation de l'icone personalisée///
 
let iconePerso = L.icon({
  	iconUrl: 'https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.png',
  	iconSize: [28, 41]
});

/// ajout des markers ///
// dans un premier temps on créer une fonction qui permet nous permettra de voir quel est le nom de chaque spots lorsque l'on clique dessus
// on ajoute ensuite nos marker en utilisant ceux qu'on a créer nous-même)

/*function onEachFeature(feature, layer) {
  	if (feature.properties) {
      	layer.bindPopup("<h1>" + feature.properties.Nom + "</h1>");/* +
       	"<h4>" + feature.properties.Desc +"</h4>"+ "<h2>Type de voies: </h2><h4>" +feature.properties.Type_voies + 
		   "<img src='" + feature.properties.img + "'>"+ "</h4>" +'>Press for more INFO </button>');
    }
}*/

///Affichages des marqueurs/// 

 
let lieux_grimpe = new L.geoJson(spots, {
  	onEachFeature: onEachFeature,
  	pointToLayer: function(feature,latlng){	
    	return L.marker(latlng,{icon: iconePerso});
  	}
}).addTo(myMap);

///On créer une function qui nous permet d'afficher les info (contenues dans nos marqueurs), dans les derniers onglets du slidebar

function onEachFeature(feature, layer) {
  layer.on('click', function(e) {
	$(".nome").html(feature.properties.Nom);
	$(".imagem").html(feature.properties.img);
	$(".descricao").html(feature.properties.type);
  });
}
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

currentPos = null

myMap.on('locationfound', function (evt) {

  	// lat / long de la position actuelle de l'utilisateur
  	currentPos = evt.latlng;

  	// On reformate le résulat et on le lie à notre boite de dialogue
  	// correspond au input invisible
  	$('#'+fromCurrentPos).val(currentPos.lat + ',' + currentPos.lng);

  	fromCurrentPos == 'fromPoint';

  	// Correspond à l'input visible
  	$('#'+fromSelectedPos).val('Current position');
  	fromSelectedPos == 'fromName'
	
  	// On rend actif le filtre de distance
  	$('#slider1').removeClass("notactive")
	
});

let origin = null

/**
 * Définition du starting point si autre que position actuelle
 */
function choseStartPoint (e) {
  	currentPos = e.latlng;
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

	// On rend actif le filtre de distance
	$('#slider1').removeClass("notactive")
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
  
// On va changer la valeur de la date et l'heure sélectionnée
// pour la date et heure actuelle
// Le format de date js n'inclus pas les 0 devant les chiffres seuls, ce qui pose problème pour mettre à jour
// l'input
// nous devons donc rajouter un 0 devant les sections concernées (mois, jour, heure, min sec)
// Puis avec slice(-2) nous choisissons de garder uniquement les deux derniers caractères de notre string
// donc si nous étions à 8 secondes, ça donnera 08
// si nous sommes à 18 sec, ça donnera 018 (-0 puisqu'on garde uniquement les deux derniers caractères)
// donc 18

function setCurrentTime() {
	let d = new Date();
	$('#time-select').val(d.getFullYear()+"-"+
		('0'+ (d.getMonth() + 1)).slice(-2)+"-"+
		('0'+ d.getDate()).slice(-2)+
		"T"+ ('0'+d.getHours()).slice(-2)+
		":"+ ('0'+d.getMinutes()).slice(-2)+
		":"+ ('0'+d.getSeconds()).slice(-2));
}
/**
 * Calcule de la route (starting point to ending point)
 * et récupération des paramètres voulus pour OTP (makeRoutingQuery)
 */
function calculateRoute(){
	// Dé-zoom et fermeture du menu pour voir l'itinéraire
	myMap.setView([46.33, 6.79], 10);
	$("#itinerary").removeClass("active");
	eta_dist.classList.toggle("active");

  	// Point de départ
  	let fromPoint = $('#fromPoint').val();
  	// Point d'arrivée
  	let toPoint = $('#toPoint').val();

  	// Mode de transport choisi par l'utilisateur
  	let chosenMode = $('#mode-select').val();

	// Heure customisée indiquée par l'utilisateur
	let selectedDateTime = $('#time-select').val();

	// Conversion de la date indiquée
	selectedDateTime = new Date(selectedDateTime)
	console.log(selectedDateTime)
	// Recupération de la date et heure indiquée dans un format convenable pour OTP
	let selectedDate = selectedDateTime.getFullYear() + '-' + (selectedDateTime.getMonth()+1) + '-' + selectedDateTime.getDate();
	let selectedTime = selectedDateTime.getHours() + ":" + selectedDateTime.getMinutes() + ":"  + selectedDateTime.getSeconds();

	// Date et heure actuelle

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
});

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
          	console.log(step)
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

// function setCurrentTime() {
// 	let d = new Date();
// 	$('#time-select').val(d.getFullYear()+"-"+
// 		('0'+ (d.getMonth() + 1)).slice(-2)+"-"+
// 		('0'+ d.getDate()).slice(-2)+
// 		"T"+ ('0'+d.getHours()).slice(-2)+
// 		":"+ ('0'+d.getMinutes()).slice(-2)+
// 		":"+ ('0'+d.getSeconds()).slice(-2));
// }
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




/**
 * FILTRES
 * on definit 
 */

// valeur des filtres coulissants
var output1 = $('#output1'); // distance
var output2 = $('#output2'); // nombre de voies
var output3 = $('#output3'); // altitude

// filtre des distances
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
		alert("Chose a location on the map or activate your location to use this filter.")
	}
	else {
		output1.html($(this).val().join(' - ')  + " m");
	}
});

// filtre du nombre de voies
$('#slider2').noUiSlider({
    start: [0, 250], 
    range: {
        'min': [0],
        'max': [250],
    },
	step: 1,
	connect: true
}).on('slide', function() {
    output2.html($(this).val().join(' - '));
});

// filtre de l'altitude
$('#slider3').noUiSlider({
    start: [0, 3000], 
    range: {
        'min': [0],
        'max': [3000],
    },
	step: 1,
	connect: true
}).on('slide', function() {
    output3.html($(this).val().join(' - ')  + " km");
});

// valeur du filtre a choix multiple
let filter_type_val = ["Couennes", "Longues voies", "Salle"]

// valeur du filtre a choix multiple
$(".filter_type").click(function(e){
	console.log($(this).val())
	$(this).toggleClass("active")
	console.log($(this).attr("class"))
	
	// redefinir la liste des filtres actives
	filter_type_val = []
	let filter_types = document.querySelectorAll(".filter_type");
	filter_types.forEach(filtertype => {
		console.log(filtertype)
		  if (filtertype.classList.contains("active")) {
			filter_type_val.push(filtertype.value);
			console.log(filter_type_val)
		  };
	});
});

/**
 * Application des filtres aux différents marqueurs
 */
function applyFilters(){

	// fermeture de la fenetre de filtres
	$("#filters").removeClass("active");

	// preparation des vecteurs pour accueillir les valeurs de longitude et latitude
	let latfiltered = []
	let lngfiltered = []

	// fonction de filtre pou
	for (layer in lieux_grimpe._layers) {

		// retablir style de base pour toutes les icones
		lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.png"

		// definir la distance entre le point de depart
		let distance = -1 // initialisation d'une distance "absurde", utile pour les conditions de filtre
		if (currentPos != null) {
			// calcul des distances horizontales et verticales au point de depart
			vdist = (lieux_grimpe._layers[layer]._latlng.lat - currentPos.lat)*110.574
			hdist = (lieux_grimpe._layers[layer]._latlng.lng - currentPos.lng)*111.320*Math.cos((lieux_grimpe._layers[layer]._latlng.lat)* (Math.PI/180))
		
			// calcul de la distance complete au point de depart
			distance = Math.sqrt(Math.pow(vdist, 2) + Math.pow(hdist, 2))
		}
		
		// extraction du nombre de voies
		let n_voies = lieux_grimpe._layers[layer].feature.properties.nbr_voies

		// extraction du type de voies
		let t_voies = lieux_grimpe._layers[layer].feature.properties.Type_voies
		console.log(t_voies)
		
		// identifier les sites respectant les différentes conditions de filtre
		if ((distance >= $('#slider1').val()[0] && distance <= $('#slider1').val()[1] || currentPos == null)
		&& n_voies >= $('#slider2').val()[0] && n_voies <= $('#slider2').val()[1]
		//&& filter_type_val.includes(t_voies)
		){
			// mettre en evidence les icones correspondantes
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.png"

			// stocker les infos de longitude-latitude pour ajuster le zoom sur les icones concernees
			latfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lat))
			lngfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lng))
		}
	}

	// calcul du centre de la carte (coordonnees horizontale et verticale)
	let latcenter = (Math.min.apply(Math,latfiltered) + Math.max.apply(Math,latfiltered))/2
	let lngcenter = (Math.min.apply(Math,lngfiltered) + Math.max.apply(Math,lngfiltered))/2

	// calcul du niveau de zoom de la carte (coordonnees horizontale et verticale)
	let latextent = (Math.max.apply(Math,latfiltered) - Math.min.apply(Math,latfiltered))*110.574
	let lngextent = (Math.max.apply(Math,lngfiltered) - Math.min.apply(Math,lngfiltered))*111.320*Math.cos(latcenter * (Math.PI/180))
	let maxextent = Math.min(latextent,lngextent)
	console.log(maxextent)

	// changement de zoom sur la carte
	myMap.setView([latcenter, lngcenter], 12);
};

function resetFilters(){
	
	// retablir les valeurs par defaut des differents filtres
	$("#slider1").val([ "0", "300" ]);
	output1.html($("#slider1").val().join(' - ') + " km");
	$("#slider2").val([ "0", "250" ]);
	output2.html($("#slider2").val().join(' - '));
	$("#slider3").val([ "0", "3000" ]);
	output3.html($("#slider3").val().join(' - ') + " m");

	// mettre en evidence les icones correspondantes
	for (layer in lieux_grimpe._layers) {
		lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.png"
	}
}