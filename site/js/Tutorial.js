/*Observable objects on this page */
var viewModel = {
	currentPageName : ko.observable("Tutorial"),
	menuOptions : ko.observableArray([{name:"Tutorial",url:"Tutorial.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]), 
	Finish : function(){
		document.location.href = "home.html";
	},
	NewGameNameError: ko.observableArray(),
	NewGameTimeError : ko.observableArray(),
	fishingGold : ko.observable("50"),
	fishingRange : ko.observable("100"),
	hammerGold : ko.observable("50"),
	hammerRange : ko.observable("100"),
	diggerGold : ko.observable("50"),
	diggerRange : ko.observable("100"),
	thievesGold : ko.observable("50"),
	thievesRange : ko.observable("100"),
	bookGold : ko.observable("50"),
	bookRange : ko.observable("100"),
	basketGold : ko.observable("50"),
	basketRange : ko.observable("100"),
	pocketGold : ko.observable("50"),
	pocketRange : ko.observable("100"),
	chainGold : ko.observable("50"),
	chainRange : ko.observable("100"),
	myGold : ko.observable("0"),
	myPickedUpItems :  ko.observableArray(),
	JoinGame: function(dir)
	{
		var image3 = {
	    url: 'img/characters.png',
	    // This marker is 20 pixels wide by 32 pixels high.
	    size: new google.maps.Size(50, 50),
	    // The origin for this image is (0, 0).
	    origin: new google.maps.Point(50 * myIconId, 0),
	    // The anchor for this image is the base of the flagpole at (0, 32).
	    anchor: new google.maps.Point(25, 25)
	 	};
		myPosMarker = new google.maps.Marker({
			position: myLatLng,
			map: map3,
			title: 'Your ass is here.',
			icon : image3
		});
		next();
		/*need to trigger resize or map does not load correctly */
		google.maps.event.trigger(map3, 'resize');
		// Recenter the map now that it's been redrawn               
		map3.setCenter(myLatLng);
		var mapItems = markers;
		placeItemsOnMap(mapItems)
	},
};//end viewmodel

var map;
var map2;
var map3;

var myLatLng;  

var setUpGameTut = 1, playGameTut = 2;

var currentStep = 1;
var currentSubStep = 1;
var currentTutorial = setUpGameTut;
/* Info for markers being placed on map */
var item = {Name : "Purse Chain", ID : 1 , Gold : viewModel.chainGold() , Range : viewModel.chainRange()};//{Name : ,ID :,  Gold : , Range : };
var dropPin = false; // pins can only be placed when dropPin is true 
var image = "img/chainIcon.png";

/* Markers list*/
/* ID : {Item : Chain, Gold : 50, Range : 100, Lng : 5.00, Lat : 5.00}*/
var markers = {};
var itemId = 0; // increments each time an item is added to markers 
var availableMapItems = [];

var myIconId = 0;
var myPosMarker;

/* Function gets called when page loaded */
$(document).ready(function(){

	initMap();


	/*highlight the textinput for step 1*/
	$("#NewGameName").effect( "highlight", {color:"#008000"}, 5000 );
	/*Detect change to textinput for step 1*/
	$('#NewGameName').on('input',function(e){
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 1)
		{
			next();
		}
	});/*end Detect change to textinput for step 1*/
	/*Detect change to textinput for step 2*/
	$('#NewgameEndTime').on('input',function(e){ 
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 2)
		{
			next();	
		}
	});/*end Detect change to textinput for step 2*/
	/*Detect change to textinput for step 3 (a) */
	$('.carousel-control').click(function(e){ 
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 3 && currentSubStep == 1)
		{
			next();	
		}
	});/*end Detect change to textinput for step 3 (a)*/
	
	/*sets up the sliders*/
	 $(function() {
	    $( "#GoldHammer, #GoldFishing, #GoldDigger, #GoldThieves, #GoldBook, #GoldBasket, #GoldPocket, #GoldChain").slider({
	      orientation: "horizontal",
	      range: "min",max: 100, value: 50,slide: refresh,change: refresh
	    });
	    $( "#RangeHammer, #RangeFishing, #RangeDigger , #RangeThieves, #RangeBook, #RangeBasket, #RangePocket,#RangeChain").slider({
	      orientation: "horizontal",
	      range: "min", min: 5, max: 500,value: 100,slide: refresh,change: refresh
	    });
  	});
	/*End sets up the sliders*/
	/*code for dropping hammer pin */
	$("#hammerButton").click(function(){
		if($("#hammerButton").is(":disabled") == false){
			if(currentStep >= 3 && currentSubStep >= 4)
			{
				item = {Name : "Mc Hammer", ID : 3 , Gold : viewModel.hammerGold() , Range : viewModel.hammerRange()};
				dropPin = true;
				image = "img/MCHammerIcon.png";
				$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
			}
		}
	});/*end code for dropping hammer pin */
	/*start tutorial with create new game button disabled */
	$("#CreateNewGame").attr( {disabled: true})

	/*Detect change to textinput for step 3 (a) */
	$('#CreateNewGame').click(function(e){ 
		next();	
		/*need to trigger resize or map does not load correctly */
		google.maps.event.trigger(map2, 'resize');
		// Recenter the map now that it's been redrawn               
		map2.setCenter(myLatLng);


	});/*end Detect change to textinput for step 3 (a)*/

});//end doc ready



/*initialises the google maps api*/
function initMap()  {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else 
    { 
        alert( "Geolocation is not supported by this browser.");
        var myLatLng = {lat: -25.363, lng: 131.044};
		var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: myLatLng
		});
	}
}
/*If geo location is supported loads map cented at the users location and places marker saying you are here */
function showPosition(position) {//initiate the google maps centred on my position
	myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
	 map = new google.maps.Map(document.getElementById('map'), {
	zoom: 16,
	center: myLatLng
	});
	// Add the circle for this city to the map.
    var cityCircle = new google.maps.Circle({
      strokeColor: '#00FF00',
      strokeOpacity: 0.35,
      strokeWeight: 0.35,
      fillColor: '#00FF00',
      fillOpacity: 0.35,
      map: map,
      center: myLatLng,
      radius: 500,
      clickable: false 
    });
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Your ass is here.'
		});

	 map2 = new google.maps.Map(document.getElementById('map2'), {
	zoom: 16,
	center: myLatLng
	});
	var image2 = {
    url: 'img/characters.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(50, 50),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(50 * myIconId, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(25, 25)
 	};
	myPosMarker = new google.maps.Marker({
		position: myLatLng,
		map: map2,
		title: 'Your ass is here.',
		icon : image2
	});
	 map3 = new google.maps.Map(document.getElementById('map3'), {
	zoom: 16,
	center: myLatLng
	});
	



	google.maps.event.addListener(map, 'click', function( event ){
 	//alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+ event.latLng.lng() ); 
 	if (currentStep == 3 && currentSubStep == 4)/*make sure pin being dropped meets conditions from instructions*/
 	{
 		if(getdistBetween(event.latLng.lat(), event.latLng.lng() , myLatLng["lat"] , myLatLng["lng"]) < 500) 
 		{
 			if(dropPin)
 			{
 				next();
 			}
 		}
 		else
 		{
 			dropPin = false;
 		}


 	}
 	else if (currentStep == 3 && currentSubStep == 5)/*make sure pin being dropped meets conditions from instructions*/
 	{
 		if(getdistBetween(event.latLng.lat(), event.latLng.lng() , myLatLng["lat"] , myLatLng["lng"]) > 500) 
 		{
 			if(dropPin)
 			{
	 			next();
	 			/*disable buton so cant drop anymore items */
	 			$("#hammerButton").attr("disabled", true);
	 			$("#CreateNewGame").attr( {disabled: false})
 			}
 			
 			
 		}
 		else
 		{
 			dropPin = false;
 		}
 	}
 		 if(dropPin)
	 	{
			var LatLng = {lat: event.latLng.lat(), lng: event.latLng.lng()};
		 	var marker = new google.maps.Marker({
				position: LatLng,
				map: map,
				title: item.Name +", Gold :" + item.Gold + ", Range : " + item.Range + "m",
				icon: image
				});

		 	markers[itemId] = {Item : item.ID, Name :item.Name, Gold : parseInt(item.Gold), Range: parseInt(item.Range), Lat: event.latLng.lat(), Lng : event.latLng.lng()};
		 	/* ID : {Item : Chain, Gold : 50, Range : 100, Lng : 5.00, Lat : 5.00}*/
		 	itemId +=1;
		 	dropPin = false;
	 	}
	});
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
           alert("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            alert( "Location information is unavailable.")
            break;
        case error.TIMEOUT:
            alert( "The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            alert( "An unknown error occurred.")
            break;
    }
}

function next()
{
	//move the substep forward
	currentSubStep += 1;
	if(currentTutorial == setUpGameTut)
	{
		if(currentStep == 1)
		{
			currentStep +=1; 
			currentSubStep = 1;
			/*highlight the textinput for step 2*/
			$("#NewgameEndTime").effect( "highlight", {color:"#008000"}, 5000 );
		}
		else if(currentStep == 3)
		{
			if(currentSubStep >= 6)
			{//the step is complete move to next step and reset sub step
				currentStep +=1; 
				currentSubStep = 1;
			}
		}
		else if (currentStep == 4)
		{
			currentTutorial = playGameTut;
			currentStep = 1;
			currentSubStep = 1;
			$("#SetUpGameTut").hide();
			$("#PlayGameTut").show();
		}
		else
		{
			currentStep +=1; 
			currentSubStep = 1;
		}
	}
	else if(currentTutorial == playGameTut)
	{
		if(currentStep == 1)
		{
			if(currentSubStep >= 3)
			{//the step is complete move to next step and reset sub step
				currentStep +=1; 
				currentSubStep = 1;
				$("#playgameScreen").show();
			}
		}
		else if (currentStep == 2)
		{
			if(currentSubStep >= 7)
			{//the step is complete move to next step and reset sub step
				currentStep +=1; 
				currentSubStep = 1;
			}
		}
	}
	//hide all 
	for (var i = 0 ; i < 6; i++ )
	{
		$(".step" + i).hide();
		$(".substep" + i).hide();
	}
	//show the current step 
	$(".step" + currentStep).show();
	$(".substep" + currentSubStep).show();
	
}

/* mehod gets called every time a slide is moved to set the observable value to its corrisponding slider value */
function refresh() {
    viewModel.fishingGold( $("#GoldFishing").slider( "value" ));
    viewModel.fishingRange( $("#RangeFishing").slider( "value" ));
    viewModel.hammerGold( $("#GoldHammer").slider( "value" ));
    viewModel.hammerRange( $("#RangeHammer").slider( "value" ));
    viewModel.diggerGold( $("#GoldDigger").slider( "value" ));
    viewModel.diggerRange( $("#RangeDigger").slider( "value" ));
    viewModel.thievesGold( $("#GoldThieves").slider( "value" ));
    viewModel.thievesRange( $("#RangeThieves").slider( "value" ));
    viewModel.bookGold( $("#GoldBook").slider( "value" ));
    viewModel.bookRange( $("#RangeBook").slider( "value" ));
    viewModel.basketGold( $("#GoldBasket").slider( "value" ));
    viewModel.basketRange( $("#RangeBasket").slider( "value" ));
	viewModel.chainGold( $("#GoldChain").slider( "value" ));
	viewModel.chainRange( $("#RangeChain").slider( "value" ));
	viewModel.pocketGold( $("#GoldPocket").slider( "value" ));
	viewModel.pocketRange( $("#RangePocket").slider( "value" ));
	/*for step 3 (b)*/
	if (currentStep == 3 && currentSubStep == 2)
	{
		if($("#RangeHammer").slider( "value" ) == 500)
			{
				next();	
				/*lock slider so cannot be changed */
				$("#RangeHammer").slider( {disabled: true})
			}
	}
	/*for step 3 (c)*/
	if (currentStep == 3 && currentSubStep == 3)
	{
		if($("#GoldHammer").slider( "value" ) == 100)
			{
				next();	
				/*lock slider so cannot be changed */
				$("#GoldHammer").slider( {disabled: true})
			}
	}

  }//end refresh
/*get distance between two latlngs*/
function getdistBetween(lat1, lon1 , lat2 , lon2) 
{
	/** Converts numeric degrees to radians */
	if (typeof(Number.prototype.toRadians) === "undefined") {
	  Number.prototype.toRadians = function() {
	    return this * Math.PI / 180;
	  }
	}
	/*formula source http://www.movable-type.co.uk/scripts/latlong.html*/ 
	var R = 6371000; // metres
	var lt1 = lat1.toRadians();
	var lt2 = lat2.toRadians();
	var dt = (lat2-lat1).toRadians();
	var dp = (lon2-lon1).toRadians();
	var a = Math.sin(dt/2) * Math.sin(dt/2) +
	        Math.cos(lt1) * Math.cos(lt2) *
	        Math.sin(dp/2) * Math.sin(dp/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	return d; // returns distance in meters

}/*end get distance between two latlngs*/


function UpdateMyIcon(num)
{
	if (currentStep == 1 && currentSubStep == 1)
	{
		next();	
	}
	myIconId += num;
	if(myIconId < 0)
	{
		myIconId = 53;
	}
	if(myIconId > 53)
	{
		myIconId = 0;
	}
	UpdatePlayerIcon(myIconId)
}
function UpdatePlayerIcon(dt)
{

	myIconId = dt;
	var image2 = {
    url: 'img/characters.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(50, 50),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(50 * myIconId, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(25, 25)
 	 };
	myPosMarker.setIcon(image2);	
}

function placeItemsOnMap(MapItems)
{
	//{Item : item.ID, Name :item.Name, Gold : parseInt(item.Gold), Range: parseInt(item.Range), Lat: event.latLng.lat(), Lng : event.latLng.lng()};
	/* now inside your initialise function */
	infowindow = new google.maps.InfoWindow({
	content: "holding..."
	});
	//remove markers from google maps 
	for (i = 0; i < markers.length; i++) 
	{
		markers[i].setMap(null);
	}
	//clear the marker array 
	markers = [];
	availableMapItems = MapItems;
	for (var item in MapItems) 
	{
		var contentString = "<div><button class = 'btn btn-success' onclick='PickUpObject("+ item +")';> Pick Up </button></div>"
		var LatLng = {lat: MapItems[item].Lat, lng: MapItems[item].Lng};
		var marker = new google.maps.Marker({
		position: LatLng,
		map: map3,
		icon: "img/chestIcon.png",
		title: 'Gold : ' + MapItems[item].Gold + ", Pickup range : " + MapItems[item].Range + "m",
		html: contentString,
		});
		markers.push(marker);	
	}
	for (var i = 0; i < markers.length; i++)  
	{
		var marker = markers[i];
		google.maps.event.addListener(marker, 'click', function () {
		// where I have added .html to the marker object.
		infowindow.setContent(this.html);
		infowindow.open(map3, this);
		next();

		});
	}
}

function PickUpObject(i)
{
	
	var mapitem = availableMapItems[i];
	if(getdistBetween(mapitem.Lat, mapitem.Lng , myLatLng["lat"] , myLatLng["lng"]) <= mapitem.Range)
	{
		//alert("in range");
		viewModel.myPickedUpItems.removeAll();
		viewModel.myPickedUpItems.push({"Name" : "MC Hammer" , "Image" : "img/MCHammer.png" })
		delete(availableMapItems[i])
		placeItemsOnMap(availableMapItems)
		
	}
	next();
}

/*apply viewmodel knockout js*/
ko.applyBindings(viewModel);