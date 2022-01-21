//////////////////////////////////////////////////
//////////// GESTION DES FENETRES ////////////////
/////////////////////////////////////////////////

// Fonction pour relier boutons du menu a actions de fenetres
$(function() {
	$(".btn").click(function(e){

		document.querySelector("#information-box").classList.remove("active");

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
		$(".eta-dist").removeClass("steps");
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
	zoomSnap: 0.1,
	contextmenu: true,
	contextmenuWidth: 140,
	
	// Ajout de la fonction pour selectionner un point de depart
	contextmenuItems: [{
    	text: 'Définir comme point de départ',
    	callback: choseStartPoint
	}]
});

// Ajout de nos couches de base (layers)

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
  	//"Mapbox": mapboxTiles,
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

	//document.querySelector("#infos").classList.remove("active");
	//if (feature.properties) {
		layer.bindPopup(btnDiv).openPopup();	
  	} //}
	);
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
  	$('#'+fromSelectedPos).val('Position actuelle');
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
  	$('#'+fromSelectedPos).val('Position sélectionnée');
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
	
	// Reinitialisation de la liste des etapes et faire figurer le bouton des etapes
	document.getElementById('step-results').textContent = '';
	$(".step").addClass("active");

	// Point de départ & d'arrivee
	let fromPoint = $('#fromPoint').val();
	let toPoint = $('#toPoint').val();
	
	// fitBounds autours des coordonnées de départ et d'arrivée et fermeture du menu pour voir l'itinéraire

	myMap.fitBounds([
		[parseFloat(fromPoint.split(',')[0]), parseFloat(fromPoint.split(',')[1])],
		[parseFloat(toPoint.split(',')[0]), parseFloat(toPoint.split(',')[1])]
	], {paddingBottomRight: [0, 250], paddingTopLeft: [0,100]});
	$("#itinerary").removeClass("active");
	$("#infos").removeClass("active");
	// Ouverture du menu eta-dist (seulement si currentPos existant)
	if (currentPos != null) {
		document.querySelector(".eta-dist").classList.toggle("active");
	}

	// Heure customisée indiquée par l'utilisateur
	let selectedDateTime = $('#time-select').val();

	// Conversion de la date indiquée
	selectedDateTime = new Date(selectedDateTime);

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

let itin
let steps

// Fonction pour dessiner la route
function drawRoute(data){
  	if (data.error){
    	alert("Calcul d'itinéraire impossible.");
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
    itin = data.plan.itineraries[choseItin(transp_mode)]

	// Boucle d'iteration parmi les differents points geometrique
    for (let i=0; i < itin.legs.length; i++){

    	// Recherche de chaque point géométrique propose par OTP
      	let leg = itin.legs[i];

      	// Obtention du mode de transport pour chaque leg (pour icone surement)
      	let leg_mode = leg.mode

      	steps = leg.steps;

		// Etapes de l'itinéraire pour future fonction GPS
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
	$('#eta').html('Arrivée à '+etaTime);

	$('#dur').html('Durée du trajet : '+duree+' minutes');

  	// Distance en km du trajet
  	let dist = Math.round((itin.walkDistance/1000)*100) / 100
	$('#dist').html('Distance totale : ' + dist + ' km')
}

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

function showSteps(){

	console.log("initialisation de la fonction");
	
	// Retirer affichage du bouton
	$(".step").removeClass("active");
	$(".eta-dist-content").removeClass("active");
	
	// Reinitialisation de la liste des etapes
	document.getElementById('step-results').textContent = '';

	// Changer style de la fenetre
	$(".eta-dist").addClass("steps");

	// Etapes de l'itinéraire pour future fonction GPS
	for (let i = 0; i < steps.length; i++){
		let step = steps[i];
		console.log(step)

		// Creer div pour contenir l'etape et definir le style
		let stepDiv = document.createElement('div');
		stepDiv.style.display = "inline-block";
		stepDiv.style.verticalAlign = "middle";
		stepDiv.classList.add("step_result");

		// Creer div pour contenir l'index de l'etape et definir le style
		let indexDiv = document.createElement('div');
		indexDiv.append(i+1);
		indexDiv.style.backgroundColor = "rgb(41, 92, 151)";
		indexDiv.style.fontSize = "20px";
		indexDiv.style.width = "30px";
		indexDiv.style.height = "30px";
		indexDiv.style.borderRadius = "12px";
		indexDiv.style.textAlign = "middle";
		indexDiv.style.verticalAlign = "middle";
		indexDiv.style.lineHeight = "normal";



		// Convertir la distance de l'etape
		let distance
		if (step.distance < 100) {
			distance = Math.round(step.distance);
			distance = distance + ' m'
		}
		if ((step.distance >= 100) && (step.distance <= 1000)) {
			distance = Math.round(step.distance/10)*10;
			distance = distance + ' m'
		}
		if (step.distance >= 1000) {
			distance = Math.round(step.distance/100)/10;
			distance = distance + ' km'
		}

		// Convertir la direction relative de l'etape
		let relativedirection
		
		switch (step.relativeDirection) {
			case "SLIGHTLY_LEFT":
				relativedirection = "légèrement à gauche"
			case "SLIGHTLY_RIGHT":
				relativedirection = "légèrement à droite"
			case "LEFT":
				relativedirection = "à gauche"
			case "RIGHT":
				relativedirection = "à droite"
			// Voir si necessite de distinguer les cas "HARD"
			case "HARD_LEFT":
				relativedirection = "à gauche"
			case "HARD_RIGHT":
				relativedirection = "à droite"
			case "CIRCLE_CLOCKWISE":
				relativedirection = "légèrement à gauche"
			case "CIRCLE_COUNTERCLOCKWISE":
				relativedirection = "légèrement à gauche"
			}

		// Convertir la direction absolue de l'etape
		let absolutedirection
		
		switch (step.absoluteDirection) {
  
			case "NORTH":
				absolutedirection = "nord"
			case "NORTHEAST":
				absolutedirection = "nord-est"
			case "EAST":
				absolutedirection = "est"
			case "SOUTHEAST":
				absolutedirection = "sud-est"
			case "SOUTH":
				absolutedirection = "sud"
			case "SOUTHWEST":
				absolutedirection = "sud-ouest"
			case "WEST":
				absolutedirection = "est"
			case "NORTHWEST":
				absolutedirection = "sud-est"	
			}

		// Creer div pour contenir le nom du site et definir le style
		let textDiv = document.createElement('div');
		textDiv.style.float = "right";
		textDiv.style.width = "85%";


		if ((step.relativeDirection != "DEPART") && (step.relativeDirection != "CONTINUE")) {
			
			textDiv.append("Après ");
			textDiv.append(distance);
			
			textDiv.append(", tourner ");
			textDiv.append(relativedirection);
			
			if (step.streetName != "route sans nom") {
			textDiv.append(" sur ");
			textDiv.append(step.streetName);
			}
		}

		if (step.relativeDirection == "CONTINUE") {
			textDiv.append("Continuer");
			
			if (step.streetName != "route sans nom") {
			textDiv.append(" sur ");
			textDiv.append(step.streetName);
			}
			textDiv.append(" pendant ");
			textDiv.append(distance);
		}

		if (step.relativeDirection == "DEPART") {
			textDiv.append("Prendre ");
			textDiv.append(step.streetName);
			textDiv.append(" direction ");
			textDiv.append(absolutedirection);
		}
		textDiv.append(".");

		textDiv.style.fontSize = "14px";
		textDiv.style.textAlign = "left";

			// Integrer les 2 div au div principal et definir le style
			stepDiv.appendChild(textDiv);
			stepDiv.appendChild(indexDiv);

			// Extraction des attributs du site concerne
			let name1 = step.relativeDirection

			// Generation d'event sur div du site
			stepDiv.addEventListener('click', event => {
				console.log("UUU");
				myMap.setView([step.lat-0.001,step.lon], 17);
			});

		document.getElementById("step-results").appendChild(stepDiv);
	}
};

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
		let filter_types = document.querySelectorAll(".type_filters");
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

// Valeurs de difficulte pour conversion de la valeur numerique du filtre en valeur de difficulte
let difficulte = ["1a","1b","1c",
				  "2a","2b","2c",
				  "3a","3b","3c",
				  "4a","4b","4c",
				  "5a","5b","5c",
				  "6a","6b","6c",
				  "7a","7b","7c",
				  "8a","8b","8c",
				  "9a","9b","9c"
				]

$('#slider4').noUiSlider({
    start: [0, 26], 
    range: {
        'min': [0],
        'max': [26],
    },
	step: 1,
	connect: true
}).on('slide', function() {
	console.log($(this).val())
	let valueF = [difficulte[parseInt($(this).val()[0])],difficulte[parseInt($(this).val()[1])]];
	output4.html(valueF.join(' - '));});



// Initialisation de la liste contenant les types de voie actuellement selectionnes par le filtre
let filter_type_val = ["Couennes", "Longues voies", "Salle"];

// Fonction d'application des filtres aux marqueurs
function applyFilters(){

	// Fermeture de la fenetre de filtres
	// $("#filters").removeClass("active");
	
	// Reinitialisation div contenant sites precedemment trouves
	document.getElementById('filter-results').textContent = '';
	document.getElementById("filter-nval").textContent = '';

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
		t_voies = t_voies.split(" et ");
		console.log(t_voies.filter(Set.prototype.has, new Set(filter_type_val)).length)

		
		// Extraction de la difficulte
		let diff_level = lieux_grimpe._layers[layer].feature.properties.diff;
		diff_level = diff_level.slice(3).split(" au ");
		diff_level[0] = difficulte.indexOf(diff_level[0]);
		diff_level[1] = difficulte.indexOf(diff_level[1]);

		// Identification des sites respectant les différentes conditions de filtre
		
		// Conditions de distance : si currentPos n'est pas identifie, la distance n'a aucune incidence
		if ((distance >= $('#slider1').val()[0] && distance <= $('#slider1').val()[1]
		|| currentPos == null)

		// Condition du nombre de voies
		&& n_voies >= $('#slider2').val()[0] && n_voies <= $('#slider2').val()[1]
		
		// Condition du type de voies
		&& t_voies.filter(Set.prototype.has, new Set(filter_type_val)).length != 0
		&& (!(diff_level[0] <= $('#slider4').val()[0] && diff_level[1] <= $('#slider4').val()[1]
		|| diff_level[0] >= $('#slider4').val()[0] && diff_level[1] >= $('#slider4').val()[1])
		|| diff_level[0] < 0)
		){
			// Mise en evidence des icones correspondantes
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg";

			// Stockage des infos de longitude-latitude pour ajuster par la suite la carte aux icones concernees
			latfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lat));
			lngfiltered.push(Number(lieux_grimpe._layers[layer]._latlng.lng));

			// Creer div pour contenir le site et definir le style
			let siteDiv = document.createElement('div');
				siteDiv.style.display = "inline-block";
	
			// Creer div pour contenir l'image du site
			let imageDiv = document.createElement('div');
			
			// Creer img pour extraire l'image du site
			let imageImg = document.createElement('img');
			
			// Extraire la source de l'image et l'annexer à l'element img
			let imageFiltered = lieux_grimpe._layers[layer].feature.properties.img;
				imageFiltered = imageFiltered.match(/'([^']+)'/)[1]
				imageImg.setAttribute("src", imageFiltered);

			// Integrer l'element img au div et definir le style
			imageDiv.appendChild(imageImg);
			imageDiv.classList.add("clipped_img");

			// Creer div pour contenir le nom du site et definir le style
			let textDiv = document.createElement('div');
				textDiv.append(lieux_grimpe._layers[layer].feature.properties.Nom);
				textDiv.style.fontSize = "18px";
				textDiv.style.textAlign = "right";

			// Integrer les 2 div au div principal et definir le style
			siteDiv.appendChild(imageDiv);
			siteDiv.appendChild(textDiv);
			siteDiv.classList.add("filter_result");

			// Extraction des attributs du site concerne
			let name1 = lieux_grimpe._layers[layer].feature.properties.Nom
			let name2 = lieux_grimpe._layers[layer].feature.properties.img
			let name3 = lieux_grimpe._layers[layer].feature.properties.Type_voies
			let name4 = lieux_grimpe._layers[layer].feature.properties.nbr_voies
			let name5 = lieux_grimpe._layers[layer].feature.properties.description
			let name6 = lieux_grimpe._layers[layer].feature.properties.diff
			let name7 = lieux_grimpe._layers[layer]._latlng.lat
			let name8 = lieux_grimpe._layers[layer]._latlng.lng

			// Generation d'event sur div du site
			siteDiv.addEventListener('click', event => {
				
				// Changement des fenetres
				document.querySelector("#filters").classList.toggle("active");
				document.querySelector("#infos").classList.toggle("active");
				
				// Changement des infos
				$(".nome").html(name1);
				$(".imagem").html(name2);
				$(".type").html(name3);
				$(".nbr").html(name4);
				$(".descricao").html(name5);
				$(".diff").html(name6);

				// Changement de position de la carte
				myMap.setView([name7-0.045, name8], 12);
				
				// Changement de highlight
				for (layer in lieux_grimpe._layers) {
					if (lieux_grimpe._layers[layer]._icon.src == "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune_h.svg") {
						lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune.svg"
					};
					if (lieux_grimpe._layers[layer].feature.properties.Nom == $(".nome").html()) {
						lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_jaune_h.svg"
					};
				};

  				// Ajout des coordonnées lat long du marqueur dans l'input hidden pour calculer l'itinéraire
  				$('#'+toSelectedMarker).val(name7 + ',' + name8);
  				toSelectedMarker == 'toPoint';

  				// Changement du texte de l'input pour qu'il corresponde au site sur lequel on a cliqué
  				$('#'+toSelectedName).val(name1);
  				toSelectedName == 'toName';
				});

			document.getElementById("filter-results").appendChild(siteDiv);
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

	if (latfiltered.length != 0) {

		// Indication du nombre de sites identifie
		if (latfiltered.length > 1) {
			document.getElementById("filter-nval").append(latfiltered.length + " sites ont été trouvés :");
		}
		if (latfiltered.length == 1) {
			document.getElementById("filter-nval").append(latfiltered.length + " site a été trouvé :");
		}	
		document.getElementById("filter-nval").classList.add("filter_nval")

		// Changement de position de la carte
		myMap.setView([latcenter, lngcenter], 11);
		
		// Scroll au sommet de la fenetre
		$(".window").animate({ scrollTop: 0 }, "slow");
	}

	else alert("No location matches these conditions.");
};

// Fonction de reinitialisation des filtres
function resetFilters(){
	
	// Scroll au sommet de la fenetre
	$(".window").animate({ scrollTop: 0 }, "slow");

	// Reinitialisation div contenant sites precedemment trouves
	document.getElementById('filter-results').textContent = '';
	document.getElementById("filter-nval").textContent = '';

	// Retablissement des valeurs par defaut des differents filtres
	$("#slider1").val([ "0", "300" ]);
	output1.html("0 - 300 km");
	$("#slider2").val([ "0", "250" ]);
	output2.html("0 - 250");
	$("#slider3").val([ "0", "3000" ]);
	output3.html("0 - 3000 m");
	$("#slider4").val([ "0", "26" ]);
	output4.html("1a - 9c");

	// Redefinition du style de base pour tous les marqueurs
	for (layer in lieux_grimpe._layers) {
		lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge.svg"
		if (lieux_grimpe._layers[layer].feature.properties.Nom == $(".nome").html()) {
			lieux_grimpe._layers[layer]._icon.src = "https://raw.githubusercontent.com/ssuter6/Geovis2/main/figs/icone_rouge_h.svg"
		};
	};
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
	"value": "Jardin perdu"
},
{
	"label": "46.34140823995979, 6.95448726592305",
	"value": "Vers-Cor"
},
{
	"label": "46.33781478008316, 6.95357800961455",
	"value": "Yvorne"
},
{
	"label": "46.3521078473799, 6.950908026304785",
	"value": "Falaise de la Feuille"
},
{
	"label": "46.35953647191191, 6.937594005887904",
	"value": "Roche"
},
{
	"label": "46.362774728207526, 6.963040989571881",
	"value": "Scex des Nombrieux"
},
{
	"label": "46.3971939585448, 6.93489308365926",
	"value": "Scex du Châtelard"
},
{
	"label": "46.32456338463541, 7.00416970487557",
	"value": "Ponty"
},
{
	"label": "46.29520105919199, 6.977676035232792",
	"value": "St-Triphon"
},
{
	"label": "46.386063703253264, 6.930554634109375",
	"value": "Grimper.ch"
},
{
	"label": "46.342680713627985, 6.999526297136597",
	"value": "Carrière des Chamois"
},
{
	"label": "46.3508986718375, 7.012762636048781",
	"value": "Planpraz"
},

{
	"label": "46.36582457532338, 7.007721819314087",
	"value": "Leysin"
},
{
	"label": "46.27781301846096, 7.143120710173434",
	"value": "Miroir d'Argentine"
}
];

$("#toName").autocomplete({
	lookup: options,
	onSelect: function (suggestion) {
		$('#toPoint').val(suggestion.label);
	}
});