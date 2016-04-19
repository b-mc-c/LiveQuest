var viewModel = {
	playersInfo : ko.observableArray(),
	results : ko.observableArray(),
}

var map;
var markers = [];
var players = [];
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


$(document).ready(function(){

	initMap();/*Call initialise map when page is loaded*/

});//end document ready


function initMap()  {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else 
    { 
        alert( "Geolocation is not supported by this browser.");
        var myLatLng = {lat: -25.363, lng: 131.044};
		 map = new google.maps.Map(document.getElementById('map'), {
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
	getGamedata();
	setInterval(getGamedata, 5000);/*calls method recursively every 5 seconds to get updates from server*/
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
function getGamedata()
{
	var gameId = parseInt(window.location.hash.substring(1));
	$.ajax({
        url: '../Server/GetMonitorInfo.php',
        type: 'POST',
        data: 
        {
            gameId: gameId,
        },
       success: function(data) {  
			data = JSON.parse(data);

			placeitems(data.AllItems)
			placePlayers(data.AllPlayerMarkers)
			setPlayersItems(data.AllPlayersInfo)
		},
	});	/*end ajax*/
	$.ajax({
		        url: '../Server/GetResults.php',
		        type: 'POST',
		        data: 
		        {
		            gameId: gameId,
		        },
		       success: function(data) {
					data = JSON.parse(data);
					viewModel.results.removeAll();
					var results = data["Results"];
					for (i = 0; i < results.length; i++) 
					{
						
						if(i+1 == 1)
						{
							results[i]["Position"] = "1st";
						}
						else if(i+1 == 2)
						{
							results[i]["Position"] = "2nd";
						}
						else if(i+1 == 3)
						{
							results[i]["Position"] = "3rd";
						}
						else 
						{
							results[i]["Position"] = (i+1) + "th";
						}
						viewModel.results.push(results[i]);	
					}
				},
			});	/*end ajax*/


}

function placeitems(mapItems)
{
	if(mapItems != null)
	{
		for (i = 0; i < markers.length; i++) 
		{
			markers[i].setMap(null);
		}
		//clear the marker array 
		markers = [];
		for (i = 0; i < mapItems.length; i++) 
		{	
			var LatLng = {lat: parseFloat(mapItems[i].Lat), lng: parseFloat(mapItems[i].Lng)};
			var itemIcon = "img/chestIcon.png"
			if(parseInt(mapItems[i].ItemIdentifier) == 9)
			{
				var itemIcon = "img/keyIcon2.png"
			}
			var marker = new google.maps.Marker({
			position: LatLng,
			map: map,
			icon: itemIcon,
			title: 'Gold : ' + parseFloat(mapItems[i].Gold) + ", Pickup range : " + parseFloat(mapItems[i].PickUpRange) + "m",
			});
			
			markers.push(marker);	
		}
	}
}
function placePlayers(data)
{
	if(data != null)
	{
		for (i = 0; i < players.length; i++) 
		{
			players[i].setMap(null);
		}
		//clear the marker array 
		players = [];
		for (i = 0; i < data.length; i++) 
		{
			var IconId = parseInt(data[i].PlayerIcon)
			var image = {
		    url: 'img/characters.png',
		    // This marker is 20 pixels wide by 32 pixels high.
		    size: new google.maps.Size(50, 50),
		    // The origin for this image is (0, 0).
		    origin: new google.maps.Point(50 * IconId, 0),
		    // The anchor for this image is the base of the flagpole at (0, 32).
		    anchor: new google.maps.Point(25, 25)
		 	 };
			var LatLng = {lat: parseFloat(data[i].Lat), lng: parseFloat(data[i].Lng)};
			var marker = new google.maps.Marker({
			position: LatLng,
			map: map,
			icon: image,
			playerId : parseInt(data[i].PlayerId)
			});
			players.push(marker);	
		}
	}
}
function setPlayersItems(data)
{
	if(data != null)
	{
		viewModel.playersInfo.removeAll();
		for(var d = 0 ; d < data.length ; d++)
		{
			
			var player = {};
			player["Gold"] = data[d].gold;
			player["Items"] = [];
			if (data[d].items != null)
			{
				var pickedUpitems = data[d].items;
				for (var i = 0; i < pickedUpitems.length ;i++)
				{
					var item = itemInfo[parseInt(pickedUpitems[i].itemIdentifier)];
					item["Id"] = parseInt(pickedUpitems[i].id);
					if(parseInt(pickedUpitems[i].itemIdentifier) == 9)/*if the item is a key */
					{
						item["Name"] = "Key : " +  pickedUpitems[i].KeyUnlocks ;
						item["Description"] = "Unlocks Chest No : " + pickedUpitems[i].KeyUnlocks ;
					}
					player["Items"].push(item);
				}
			}

			viewModel.playersInfo.push(player);
		}
	}
}

ko.applyBindings(viewModel);