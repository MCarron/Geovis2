
# Geovis2

Ce projet prend place dans le cadre du cours de "Géovisualisation 2" donné par le Porfesseur Mr.  Christian Kaiser à l'Université de Lausanne. L'idée de ce projet était de réaliser une application de cartographie interactive dont la thématique se porte sur les différents lieux de grimpe que nous pouvons rencontrer dans le Chablaise Suisse. Cette dernière permet ainsi à l'utilisateur de repérer les différents lieux de grimpe présents dans cette région.

## 1. Objectif de l'application



## 2. Application réalisée

### 2.1 Descrition générale

### 2.2 Système GPS

#### Open Trip Planner (OTP)

[Open Trip Planner](http://docs.opentripplanner.org/en/latest/) est un planificateur multi-modal de trajet. Il s'agit d'un projet open source qui a commencé en 2009 à l'issue d'un work shop à Portland (Oregon). David Emory, Brian Ferris et Brandon Martin-Anderson en sont les trois principaux fondateurs. Le projet a connu un développement rapide et de un nombre d'utilisateurs croissant. Une deuxième version (OpenTripPlanner 2) a vu le jour en 2020. La communauté est encore active aujourd'hui et continue de développer le projet.

OTP est un programme Java et nécessite plusieurs fichiers externes afin de fonctionner, à savoir :
* Trois fichiers JSON qui définissent les paramètres du serveur monté
* Un fichier [GTFS](https://opentransportdata.swiss/fr/cookbook/gtfs/) contenant les horaires des transports publics (ici pour la Suisse)
* Un fichier [PBF](https://download.geofabrik.de/europe/switzerland.html) de la Suisse contenant toutes les informations mises à disposition par OSM pour le territoire voulu
* Un fichier [JAR](https://repo1.maven.org/maven2/org/opentripplanner/otp/2.0.0/) contenant le programme en Java d'OTP
* Deux fichiers `.obj` qui représentent le réseau de transport calculé grâce aux fichier GTFS, PBF par le biai du programme OTP (le fichier `.jar`). Ces fichiers `.obj` peuvent être sauvegardé afin de monter plus rapidement le serveur par la suite.

#### Problèmes rencontrés lors de l'implémentation d'OTP

* 1. Installer la bonne version de Java
    * Après plusieurs essais, il s'est avéré préférable d'utiliser la version 11 de Java et non une plus récente

* 2. Monter le serveur OTP
    * Fichier PBF: il a fallu d'abord utiliser un fichier PBF qui concernait notre zone d'étude. Ces fichiers contiennent énormément d'informations et sont donc très volumineux. Plus le fichier est volumineux, plus le programme demande une performance croissante de la machine (surtout par rapport à la mémoire vive). Puisque nous ne possédons pas de machine assez puissante, nous avons dû restreindre notre zone d'étude au Chablais avec [Osmium](https://osmcode.org/osmium-tool/manual.html#creating-geographic-extracts).
    * Fichier GTFS : les fichiers GTFS mis à disposition par OpenTransportData.swiss ont dû être modifié car le type de route n°1700 n'était pas reconnu par OTP. Il a été manuellement remplacé par le n°1300 afin qu'OTP le prenne en compte. Ce problème a déjà été indiqué à la communauté OTP [ici](https://github.com/opentripplanner/OpenTripPlanner/issues/2654).

    Pour les données 2022, les fichiers d'OpenTransportData ne fonctionnaient plus car un type d'agence dans le fichier `agency.txt` manquait. Nous avons donc utiliser un fichier GTFS mise à disposition par [geOps](https://gtfs.geops.ch/).

#### Utilisation d'OTP

Afin d'utiliser notre application, il est nécessaire de monter un serveur OTP en local. Toutes les étapes nécessaires sont decrites ici :

* Assurez vous d'avoir la [version 11 de Java](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html). Vous pouvez vérifier votre version de Java en tapant `java -version` dans un terminal.

* [Téléchargez](https://drive.google.com/drive/folders/1F7Za8H5Ypwcle5aLj8_TLj5-Om-KLPgT?usp=sharing) le dossier compressé contenant l'ensemble des fichiers nécessaires à monter le serveur OTP.

* Extrayez l'ensemble des fichiers à l'emplacement de votre choix.

* Ouvrez un terminal sur votre machine

* Changez le répertoire pour le dossier que vous avez téléchargé précedemment

* Une fois dans le dossier, écrivez simplement :

`java -Xmx8G -jar otp_shaded.jar --load .`

`java` indique que vous allez utiliser un programme écrit dans le langage\
`-Xmx8G` indique la quantité de mémoire vive que vous souhaitez allouer au programme (ici 8Go)\
`-jar` indique le type de fichier qui va être lu\
`otp_shaded.jar` correspond au programme OTP qui sera lu et executé\
`--load` charge les fichiers `.obj` préalablement créés\
`.` indique que tout cela se passe dans le fichier actuel (d'où le changement du chemin relatif plus haut)

Après quelques secondes (ou minutes selon votre machine), la dernière ligne de commande devrait indiquer : `Grizzly server running`. Cela veut dire que votre serveur est près à l'emploi et que vous pouvez utiliser notre application.

### 2.3 Système de filtre




### 2.4 Informations sur les sites de grimpe

Plusieurs sources ont été utilisées pour obtenir les différentes informations relatives aux spots de grimpe que nous pouvons rencontrer dans le Chablais vaudois. En effet, il existe de nombreux manuels de grimpe spécialisés sur les différents secteurs que l'on trouve dans cette région. Ces derniers fournissent généralement des informations importantes sur le type de voies que l'on peut rencontrer sur un secteur (longue voie, couenne, bloc), sur l'accessibilité liée à ces derniers ainsi que de nombreuses informations relatives au niveau de difficulté des voies présentent sur les parois. Nous pouvons noter que dans le cadre de ce travail, nous nous sommes principalement inspiré des informations fournies dans le [topo](https://sportescalade.com/topo/) de grimpe écrit par Claude et Yves Rémy, deux figurent phare de la grimpe en Suisse.

#### Création du GeoJSON
Dès lors que nous avons pu trier et choisir les informations auxquelles nous souhaitions avoir accès, nous avons regroupé ces dernières au sein d'un fichier GeoJSON que nous avons pu réaliser à partir d'un système d'informations géographiques (SIG). Dans notre cas nous avons utilisé le programme QGIS. 
GeoJSON est un format ouvert d’échange de données géospatiales utilisant la norme JSON représentant des entités géographiques simples et leurs attributs non spatiaux. Ce format permet d’encoder diverses structures de données géographiques du fait qu'il utilise un système de référentiel de coordonnées géographiques [ArcGIS](https://doc.arcgis.com/fr/arcgis-online/reference/geojson.htm). Ainsi, une fois que notre fichier GeoJSON a été créer, nous avons pu utiliser ce dernier pour afficher les informations souhaitées sur notre carte interactive.

#### Extrait du fichier GeoJSON
L'extrait présenté ci-dessous montre à quoi ressemble notre fichier GeoJSON. Nous pouvons noter que chacun des spots de grimpe est associé à des coordonnées géographiques précises. De plus, nous pouvons également voir que chacun des spots est associé à un certain nombre d'entités qui ont été définient par nous-même. A savoir: `Nom`, `Type de voies`, `nombre de voies`, `description`, `image` ainsi que `difficulté`.
![GeoJSON](https://user-images.githubusercontent.com/81638170/150301406-d27a0cc1-783c-481a-9167-3bba693392d4.png)

#### Accès aux informations
L'accès aux informations au travers de notre application peut ce faire de deux façons.
* 1. Lorsque l'utilisateur click sur un des marqueurs présent sur la carte, une pop-up s'ouvre affichant le nom du secteur auquel le marqueur fait référence. De plus, en dessous de ce nom figure un bouton permettant d'afficher des informations supplémentaires ainsi qu'une image relatives au secteur sélectionné.
* 2. L'utilisateur peut également choisir de directement afficher les informations (complètes) liées à un secteur de grimpe en sélectionnant le bouton d'information présent dans le bas côté droit de l'application. Dès lors une page contenant les informations détaillées du secteur s'ouvre. L'utilisateur peut dès lors cliquer sur n'importe quel secteur pour obtenir les informations qu'il souhaite.



## 3. Points forts et faiblesses

### 3.1 Points forts

* Possibilité de choisir sa localisation actuelle ou une localisation personalisée
* Possibilité de changer de moyen de transport grâce à la fonction multimodale d'OTP
* Possibilité de calculer des itinéraires avec des transports en commun et des horaires précis
* UI intuitive
* Complétion automatique des lieux de destination
* Visualisation des emplacements de chacun des secteurs de grimpe
* Accès rapide a des informations pour chacun de ces secteurs


### 3.2 Faiblesses (à améliorer)

* Certains spots de grimpe ne sont pas accessible via OTP car ne se trouvent pas à côté d'une route praticable. Une solution possible aurait été d'indiquer le parking le plus proche pour qu'OTP puisse calculer l'itinéraire.
* Certains points de départ sont invalides : on ne peut pas choisir le milieu d'une autoroute comme point de départ pour un trajet en transport en commun. Impossibilité de calculer un itinéraire si l'utilisateur se trouve dans un corps d'eau. Une solution aurait été de calculer le plus cours chemin (à vol d'oiseau) de l'utilisateur au premier point valide pour OTP et calculer l'itinéraire à partir de là.
* Pas de système de GPS avec une vue aérienne oblique
* Nécessité de monter un serveur en local pour faire tourner OTP (possibilité d'un hébergement en ligne par la suite)
* *Distance totale* incorrecte pour le mode TRANSIT : OTP n'indique que la distance pour les trajets à pieds
* Le flyTo après le calcul d'itinéraire est codé en dur alors qu'il serait possible de prendre les coordonnées du points de départ et d'arrivée, de faire la moyenne des deux et ainsi définir le point moyen pour un flyTo plus cohérent.
* Il serait intéressant de pouvoir ajouter des informations propres à chacune de voies que l'on peut rencontrer sur un secteur de grimpe. En effet l'application permet d'avoir des informations générales sur un secteur mais n'apporte pas d'informations directes sur les voies de grimpe (localisation des voies sur les parois de grimpes, difficultés de chacune des voies, etc.)
* Il est toujours possible d'apporter des informations générales en plus liées à chaque secteurs (exposition, fréquentation, confort, équipement, etc.)

## 4. Tests utilisateurs

## 5. Screenshots

#### Accès aux informations
- Au travers des marqueurs

![info](https://user-images.githubusercontent.com/81638170/150320251-f84143fd-2a53-4994-89b5-398c421f83ca.png)

- Au travers du boutton d'information présent sur le bas côté droite de l'application

![info2](https://user-images.githubusercontent.com/81638170/150320289-217d2eb4-aaae-4525-84b3-61b51652a6dc.png)



## 6. Source




