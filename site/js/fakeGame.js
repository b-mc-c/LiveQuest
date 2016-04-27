var viewModel = {
	currentPageName : ko.observable("Play Game"),
	menuOptions : ko.observableArray([{name:"PlayGame",url:"#"+window.location.hash.substring(1),_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	ItemInfo: ko.observable(""),
	myPickedUpItems: ko.observableArray(),
	myGold : ko.observable("0"), 
	ShowItemDescitpion :function(item, event)/**/ 
	{
		$(event.target).parent().parent().parent().show().find(".BottomInfo").toggle() 
	}/*end ShowItemDescitpion*/,
	UseItem : function(item, event)/**/ 
	{
		useItem = true;
		selectedItem = item;
		$('html,body').animate({scrollTop: $("#map").offset().top},'slow');/*for centreing phone screen on the map*/
	},
}
var gameId = parseInt(window.location.hash.substring(1));
/* Markers list*/
var itemInfo =  
	{
		1 : {Identifier : 1, 	Useable : false, 	EffectRange : 0, 	TheftAmount: 100,	Name: "Purse Chain", 				Image: "img/chain.png", 		Description: "Prevents your purse from being stolen but snaps after one use."},
		2 : {Identifier : 2, 	Useable : false, 	EffectRange : 0, 	TheftAmount: 100,	Name: "Fake Pocket", 				Image: "img/pocket.png", 		Description: "A fake pocket sewn into you jacket fools potential thieves attempting to relieve you of your gold."},
		3 : {Identifier : 3, 	Useable : true, 	EffectRange : 100, 	TheftAmount: 100,	Name: "Mc Hammer", 					Image: "img/MCHammer.png", 		Description: "Mc Hammer parachute pants his way to a player breaks their piggy bank and steals their gold."},
		4 : {Identifier : 4, 	Useable : true, 	EffectRange : 100, 	TheftAmount: 100,	Name: "Fishing rod", 				Image: "img/fishing-rod.png", 	Description: "The fishing rod allows you to fish out another players coin purse."},
		5 : {Identifier : 5, 	Useable : true, 	EffectRange : 100, 	TheftAmount: 100,	Name: "Gold Digger", 				Image: "img/gold_digger.png", 	Description: "So you think she's a gold digger, Release the gold digger on another player to relieve them of some of their gold."},
		6 : {Identifier : 6, 	Useable : true, 	EffectRange : 100, 	TheftAmount: 100,	Name: "40 Thieves", 				Image: "img/thieves.png", 		Description: "Dispatch Ali Baba's 40 thieves to steal gold from players in range."},
		7 : {Identifier : 7, 	Useable : true, 	EffectRange : 100, 	TheftAmount: 100,	Name: "Oldest trick in the book", 	Image: "img/book.png", 			Description: "Distract a player by shouting ''Look over there'' while they look away help yourself to their gold."},
		8 : {Identifier : 8, 	Useable : false, 	EffectRange : 0,  	TheftAmount: 100,	Name: "Baby in a Basket", 			Image: "img/basket.png", 		Description: "When a player attempts to steal from you A baby in basket appears and with a booming voice shouts ''Thou shalt not steal!!'' scaring off any thief."},
		9 : {Identifier : 9, 	Useable : false, 	EffectRange : 0,  	TheftAmount: 0,		Name: "Key", 						Image: "img/Key.png", 			Description: "Unlocks Chest associated Type : ."},
	};
var markers = [];
var PlayerMarkers = [];
var myPosMarker;
var myIconId = 0;
var map; //the google map 
var infowindow = null;
var availableMapItems = [];
var myLatLng = {};

var useItem = false;
var selectedItem = 0;

$(document).ready(function(){

	//initMap();/*Call initialise map when page is loaded*/
	//placeItemsOnMap(1)

});//end document ready

/*Set up SoundManager*/


soundManager.setup({
  url: 'external/swf/',
  flashVersion: 9, // optional: shiny features (default = 8)
  // optional: ignore Flash where possible, use 100% HTML5 mode
  // preferFlash: false,
});/*end soundmanager.setup*/
soundManager.onready(function() {
    soundManager.createSound({
        id: 'no',
        url: 'sounds/no.mp3'
    });
});/*end soundmanager.onready*/

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
	if(data["gameOver"])
	{
		document.location.href = "ViewResults.html#" + gameId;
	}
	if(data["NOKEY"])
	{
		alert("You don't have the approiate key.")
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
	google.maps.event.addListener(map, 'click', function( event ){
 	//alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+ event.latLng.lng() ); 
		myLatLng = {lat: event.latLng.lat(), lng: event.latLng.lng()};
		myPosMarker.setPosition(myLatLng);
	});



	myPosMarker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		title: 'Your ass is here.',
		icon : myimage,
		});
	updateItemlocations();
	setInterval(updateItemlocations, 5000);/*calls method recursively every 15 seconds to get updates from server*/
//	setInterval(UpdateMyPosition, 5000);/*calls method recursively every 15 seconds to update my position*/
	
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
		if(parseInt(MapItems[i].locked) == 1)
		{
			contentString = "<div><button class = 'btn btn-success' onclick='PickUpObject("+ i +")';> Pick Up </button><br><span>Locked needs Key " + MapItems[i].ItemIdInGame +"</span></div>"
		}
		var LatLng = {lat: parseFloat(MapItems[i].Lat), lng: parseFloat(MapItems[i].Lng)};
		var itemIcon = "img/chestIcon.png"
		if(parseInt(MapItems[i].ItemIdentifier) == 9)
		{
			var itemIcon = "img/keyIcon2.png"
		}
		var marker = new google.maps.Marker({
		position: LatLng,
		map: map,
		icon: itemIcon,
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
		playerId : parseInt(MapItems[i].PlayerId)
		});
		google.maps.event.addListener(marker,'click',function() {/*click event for when a player icon is clicked */
 			if(useItem)
 			{
 				if(getdistBetween(this.getPosition().lat(),this.getPosition().lng() , myLatLng.lat , myLatLng.lng) <= selectedItem.EffectRange) /*Check if player is in range*/
 				{
 					/*if player in range call to database to confirm action */
 					$.ajax({
	        			url: '../Server/UseItem.php',
	        			type: 'POST',
	        			data: 
	        			{
	            			gameId: gameId,
	            			item: selectedItem.Id,
	            			target : this.playerId,
	        			},
	       				success: function(data) {
	       					viewModel.myPickedUpItems.removeAll();
							data = JSON.parse(data);
							Receive(data);
						},
					});	/*end ajax*/
 				}/*End if(getdistBetween(lat1, lon1 , lat2 , lon2) <= selectedItem.EffectRange)*/
 				else/*if not in range, play dud sound*/
 				{
 					//playSound('no')
 					playSound("no")
 				}
 			}/*end if (useitem)*/
 			useItem = false;
 		});/*end google.maps.event.addListener*/
		PlayerMarkers.push(marker);	
	}
}
function playSound(sound)
{
	soundManager.play(sound);
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
		var item = itemInfo[parseInt(pickedUpitems[i].itemIdentifier)];
		item["Id"] = parseInt(pickedUpitems[i].id);
		if(parseInt(pickedUpitems[i].itemIdentifier) == 9)/*if the item is a key */
		{
			item["Name"] = "Key : " +  pickedUpitems[i].KeyUnlocks ;
			item["Description"] = "Unlocks Chest No : " + pickedUpitems[i].KeyUnlocks ;
		}
		viewModel.myPickedUpItems.push(item);
	}
}
function SetMyGold(gold)
{

	viewModel.myGold(parseInt(gold));
}
ko.applyBindings(viewModel);