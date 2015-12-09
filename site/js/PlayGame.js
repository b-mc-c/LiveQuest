var viewModel = {
	currentPageName : ko.observable("Set Up Game"),
	menuOptions : ko.observableArray([{name:"Set Up Game",url:"setUpGame.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	ItemInfo: ko.observable(""),
}
var gameId = parseInt(window.location.hash.substring(1));
/* Markers list*/
var markers = [];
var map; //the google map 

$(document).ready(function(){

	initMap();/*Call initialise map when page is loaded*/
	//placeItemsOnMap(1)

});//end document ready

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
	if(data["ITEMSFOUND"])
	{
		placeItemsOnMap(data["ITEMSFOUND"])
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
	map = new google.maps.Map(document.getElementById('map'), {
	zoom: 16,
	center: myLatLng
	});
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Your ass is here.'
		});
	updateItemlocations();
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
function updateItemlocations()
{
	message = {}
	message["ITEMLOCATIONS"] = {"GameId" : gameId};
	ws.send(JSON.stringify(message));
}
function placeItemsOnMap(MapItems)
{
	for (i = 0; i < MapItems.length; i++) 
	{
		var myLatLng = {lat: MapItems[i][6], lng: MapItems[i][7]};
		var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		icon: "img/chestIcon.png",
		title: 'Gold : ' + MapItems[i][4] + ", Pickup range : " + MapItems[i][5] + "m"
		});
		markers.push(marker);

	}
}

ko.applyBindings(viewModel);