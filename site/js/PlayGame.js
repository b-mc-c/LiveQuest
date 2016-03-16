var viewModel = {
	currentPageName : ko.observable("Play Game"),
	menuOptions : ko.observableArray([{name:"PlayGame",url:"#"+window.location.hash.substring(1),_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	ItemInfo: ko.observable(""),
	myPickedUpItems: ko.observableArray(),
	myGold : ko.observable("0"), 
}
var gameId = parseInt(window.location.hash.substring(1));
/* Markers list*/

var images = ["","img/chain.png","img/pocket.png","img/MCHammer.png","img/fishing-rod.png","img/gold_digger.png","img/thieves.png","img/book.png","img/basket.png"];

var markers = [];
var PlayerMarkers = [];
var myPosMarker;
var myIconId = 0;
var map; //the google map 
var infowindow = null;
var availableMapItems = [];
var myLatLng = {};


$(document).ready(function(){

	//initMap();/*Call initialise map when page is loaded*/
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
		else
		{
			initMap();/*Call initialise map when page is loaded*/
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
	if (data["PLAYERICON"])
	{
		UpdatePlayerIcon(data["PLAYERICON"])
	}
	if(data["MyItemsList"])
	{
		SetMyItems(data["MyItemsList"])
		//alert(data["MyItemsList"])
	}
	if(data["CurrentGold"])
	{
		SetMyGold(data["CurrentGold"]);
	}
	if(data["PlayersInGame"])
	{
		placePlayersOnMap(data["PlayersInGame"])
	}
}//end recieve
/* validate the manually entered data is ok before sending to server*/

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

	var myimage = {
    url: 'img/characters.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(50, 50),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(50 * myIconId, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(25, 25)
 	 };

	map = new google.maps.Map(document.getElementById('map'), {
	zoom: 16,
	center: myLatLng
	});
	myPosMarker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Your ass is here.',
		icon : myimage,
		});
	updateItemlocations();
	setInterval(updateItemlocations, 15000);/*calls method recursively every 15 seconds to get updates from server*/
	setInterval(UpdateMyPosition, 15000);/*calls method recursively every 15 seconds to update my position*/
	
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
/*calls to server to get updates*/
function updateItemlocations()
{
	$.ajax({
        url: '../Server/UpdateGameState.php',
        type: 'POST',
        data: 
        {
            gameId: gameId,
            lat: myLatLng["lat"],
            lng: myLatLng["lng"],
        },
       success: function(data) {
       		viewModel.myPickedUpItems.removeAll();
			for (i = 0; i < markers.length; i++) 
			{
				markers[i].setMap(null);
			}
			data = JSON.parse(data);
			Receive(data);
		},
	});	/*end ajax*/
}
function placeItemsOnMap(MapItems)
{

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
	for (i = 0; i < MapItems.length; i++) 
	{
		var contentString = "<div><button class = 'btn btn-success' onclick='PickUpObject("+ i +")';> Pick Up </button></div>"
		var LatLng = {lat: parseFloat(MapItems[i].Lat), lng: parseFloat(MapItems[i].Lng)};
		var marker = new google.maps.Marker({
		position: LatLng,
		map: map,
		icon: "img/chestIcon.png",
		title: 'Gold : ' + parseFloat(MapItems[i].Gold) + ", Pickup range : " + parseFloat(MapItems[i].PickUpRange) + "m",
		html: contentString,
		});
		
		markers.push(marker);	
	}
	for (i = 0; i < MapItems.length; i++) 
	{
		var marker = markers[i];
		google.maps.event.addListener(marker, 'click', function () {
		// where I have added .html to the marker object.
		infowindow.setContent(this.html);
		infowindow.open(map, this);
		});
	}
}
function placePlayersOnMap(MapItems)
{
	for (i = 0; i < PlayerMarkers.length; i++) 
	{
		PlayerMarkers[i].setMap(null);
	}
	//clear the marker array 
	PlayerMarkers = [];
	for (i = 0; i < MapItems.length; i++) 
	{
		var IconId = parseInt(MapItems[i].PlayerIcon)
		var image = {
	    url: 'img/characters.png',
	    // This marker is 20 pixels wide by 32 pixels high.
	    size: new google.maps.Size(50, 50),
	    // The origin for this image is (0, 0).
	    origin: new google.maps.Point(50 * IconId, 0),
	    // The anchor for this image is the base of the flagpole at (0, 32).
	    anchor: new google.maps.Point(25, 25)
	 	 };
		var LatLng = {lat: parseFloat(MapItems[i].Lat), lng: parseFloat(MapItems[i].Lng)};
		var marker = new google.maps.Marker({
		position: LatLng,
		map: map,
		icon: image,
		});
		
		PlayerMarkers.push(marker);	
	}

}


function PickUpObject(i)
{
	message = {}
	var mapitem = availableMapItems[i];
	if(getdistBetween(parseFloat(mapitem.Lat), parseFloat(mapitem.Lng), myLatLng["lat"] , myLatLng["lng"]) <= parseInt(mapitem.PickUpRange))
	{
		$.ajax({
	        url: '../Server/PickUpObject.php',
	        type: 'POST',
	        data: 
	        {
	            gameId: gameId,
	            item: parseInt(mapitem.id),
	            latLng: myLatLng,
	        },
	       success: function(data) {
	       		for (i = 0; i < markers.length; i++) 
				{
					markers[i].setMap(null);
				}
				data = JSON.parse(data);
				Receive(data);
				
			},
		});	/*end ajax*/
	}
	else
	{
		alert("Not in range");
	}

}
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
function UpdateMyPosition()
{
		/*Get current longLat*/
 	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(UpdatePosition, showError);
    } else 
    { 
        alert( "Geolocation is not supported by this browser.");
	}

//	ws.send(JSON.stringify(message));
}

function UpdatePosition(position) {//initiate the google maps centred on my position
	myLatLng = {lat: position.coords.latitude, lng: position.coords.longitude};
	myPosMarker.setPosition(myLatLng);
}
function UpdatePlayerIcon(dt)
{
	myIconId = dt;
	var image = {
    url: 'img/characters.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(50, 50),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(50 * myIconId, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(25, 25)
 	 };
	myPosMarker.setIcon(image);	
}
function SetMyItems(pickedUpitems)
{
	viewModel.myPickedUpItems.removeAll();
	for (var i = 0; i < pickedUpitems.length ;i++)
	{
		
		viewModel.myPickedUpItems.push({"Name" : pickedUpitems[i].Name , "Image" : images[parseInt(pickedUpitems[i].itemIdentifier)] })
	}
}
function SetMyGold(gold)
{

	viewModel.myGold(parseInt(gold));
}
ko.applyBindings(viewModel);