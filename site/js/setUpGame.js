/*Observable objects on this page */
var viewModel = {
	currentPageName : ko.observable("Set Up Game"),
	menuOptions : ko.observableArray([{name:"Set Up Game",url:"setUpGame.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
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
}

/* Info for markers being placed on map */
var item = {Name : "Purse Chain", ID : 1 , Gold : viewModel.chainGold() , Range : viewModel.chainRange()};//{Name : ,ID :,  Gold : , Range : };
var dropPin = false; // pins can only be placed when dropPin is true 
var image = "img/chainIcon.png";

/* Markers list*/
/* ID : {Item : Chain, Gold : 50, Range : 100, Lng : 5.00, Lat : 5.00}*/
var markers = {};
var itemId = 0; // increments each time an item is added to markers 

/* Function gets called when page loaded */
$(document).ready(function(){

	initMap();/*Call initialise map when page is loaded*/
	/* Create new game button click*/
	$("#CreateNewGame").click(function(){
		if(validateNewGame())
		{
			message = {}
			message["CREATENEWGAME"] = {"GameName" : $("#NewGameName").val(), "EndTime": $("#NewgameEndTime").val(), placedItems : markers};
			ws.send(JSON.stringify(message));
		}
	});/*End Create new game button click*/
	/*Click events for placing items */
	$("#chainButton").click(function(){
		item = {Name : "Purse Chain", ID : 1 , Gold : viewModel.chainGold() , Range : viewModel.chainRange()};
		dropPin = true;
		image = "img/chainIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#pocketButton").click(function(){
		item = {Name : "Fake Pocket", ID : 2 , Gold : viewModel.pocketGold() , Range : viewModel.pocketRange()};
		dropPin = true;
		image = "img/pocketIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#hammerButton").click(function(){
		item = {Name : "Mc Hammer", ID : 3 , Gold : viewModel.hammerGold() , Range : viewModel.hammerRange()};
		dropPin = true;
		image = "img/MCHammerIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#rodButton").click(function(){
		item = {Name : "Fishing rod", ID : 4 , Gold : viewModel.fishingGold() , Range : viewModel.fishingRange()};
		dropPin = true;
		image = "img/fishing-rodIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#diggerButton").click(function(){
		item = {Name : "Gold Digger", ID : 5 , Gold : viewModel.diggerGold() , Range : viewModel.diggerRange()};
		dropPin = true;
		image = "img/gold_diggerIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#aliButton").click(function(){
		item = {Name : "40 Thieves", ID : 6 , Gold : viewModel.thievesGold() , Range : viewModel.thievesRange()};
		dropPin = true;
		image = "img/thievesIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#bookButton").click(function(){
		item = {Name : "Oldest trick in the book ", ID : 7 , Gold : viewModel.bookGold() , Range : viewModel.bookRange()};
	
		dropPin = true;
		image = "img/bookIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	$("#basketButton").click(function(){
		item = {Name : "Baby in a Basket ", ID : 8 , Gold : viewModel.basketGold() , Range : viewModel.basketRange()};
		dropPin = true;
		image = "img/basketIcon.png";
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');
	});
	/*End Click events for placing items */
	/*sets up the sliders*/
	 $(function() {
	    $( "#GoldHammer, #GoldFishing, #GoldDigger, #GoldThieves, #GoldBook, #GoldBasket, #GoldPocket, #GoldChain").slider({
	      orientation: "horizontal",
	      range: "min",
	      max: 100,
	      value: 50,
	      slide: refresh,
	      change: refresh
	    });
	    $( "#RangeHammer, #RangeFishing, #RangeDigger , #RangeThieves, #RangeBook, #RangeBasket, #RangePocket,#RangeChain").slider({
	      orientation: "horizontal",
	      range: "min",
	      min: 5,
	      max: 200,
	      value: 100,
	      slide: refresh,
	      change: refresh
	    });
  	});
	/*End sets up the sliders*/
});//end document ready
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
  }//end refresh
/* Handles recieved messages from server for this screen  */
function Receive(data)
{
	console.log(data);
	if(data["SIGNEDIN"])
	{
		if(data["SIGNEDIN"].localeCompare("NOTSIGNEDIN")==0)
		{
			document.location.href = "index.html";
		}
	}
	if(data["LOGGEDOUT"])
	{
		document.location.href = "index.html";
	}
	if(data["GAMECREATEDSUCCESS"])
	{
		document.location.href = "addplayers.html#" +data["GAMECREATEDSUCCESS"] ;
	}
	if(data["ERROR"])
	{
		HandleErrors(data["ERROR"])
	}
}//end recieve
/* validate the manually entered data is ok before sending to server*/


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

}


function validateNewGame()
{
	//clear the error list 
	viewModel["NewGameTimeError"].removeAll();
	viewModel["NewGameNameError"].removeAll();
	//get data from input 
	var Name = $("#NewGameName").val();
	var dt = $("#NewgameEndTime").val();
	//bool if true message passes all  validation
	var canSend = true;
	if (Name == "" || Name == null) //validae that username is not empty
	{
		viewModel["NewGameNameError"].push("Please enter a Game Name");
		canSend = false;
	}
	if (dt == "" || dt == null) //validae that username is not empty
	{
		viewModel["NewGameTimeError"].push("Please enter an end date and time");
		canSend = false;
	}
	if (Name.indexOf(";") > -1 || Name.indexOf("'") > -1 || Name.indexOf('"') > -1) //validae that username does not contain ; ' or " characters 
	{
		viewModel["NewGameNameError"].push("Invalid, Games Names cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	return canSend;
}//end validateNewGame()


function HandleErrors(data)
{
	ClearAllErrors();
	if(data.localeCompare("INVALIDCHARSNEWGAME") == 0)
	{
		viewModel["NewGameNameError"].push("Invalid, Games Names cannot contain the following characters ' ; \" ");
	}
}
/*Clears all error messages */
function ClearAllErrors()
{
	viewModel["NewGameNameError"].removeAll();
	viewModel["NewGameTimeError"].removeAll();
	
}
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
	var myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
	var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 16,
	center: myLatLng
	});
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Your ass is here.'
		});
	google.maps.event.addListener(map, 'click', function( event ){
 	//alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+ event.latLng.lng() ); 
	 	if(dropPin)
	 	{
			var myLatLng = {lat: event.latLng.lat(), lng: event.latLng.lng()};
		 	var marker = new google.maps.Marker({
				position: myLatLng,
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


ko.applyBindings(viewModel);