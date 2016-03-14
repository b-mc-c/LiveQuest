var viewModel = {
	currentPageName : ko.observable("Play Game"),
	menuOptions : ko.observableArray([{name:"ViewGame",url:"#"+window.location.hash.substring(1),_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	ItemInfo: ko.observable(""),
	JoinGame : function(){
		$.ajax({
		        url: '../Server/AddPlayerToGame.php',
		        type: 'POST',
		        data: 
		        {
		            gameId: gameId,
		            playerIconId: myIconId,
		        },
		       success: function(data) {
				    if(data == true)
				    {
				    	document.location.href = "PlayGame.html#"+gameId ;
				    }
				},
	    	});		
	},
	showChangeCharcter : ko.observable(true),
}
var gameId = parseInt(window.location.hash.substring(1));
/* Markers list*/
var markers = [];
var myPosMarker;
var map; //the google map 
var infowindow = null;
var availableMapItems = [];
var myIconId = 0;
var myLatLng = {};


$(document).ready(function(){

	if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.


	} else {
	    // Sorry! No Web Storage support..
	}

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
		placeItemsOnMap(data["ITEMSFOUND"]);
	}
	if (data["PLAYERICON"])
	{
		UpdatePlayerIcon(parseInt(data["PLAYERICON"]));
		viewModel.showChangeCharcter(false);
	};
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

	map = new google.maps.Map(document.getElementById('map'), {
	zoom: 16,
	center: myLatLng
	});
	var image = {
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
		map: map,
		title: 'Your ass is here.',
		icon : image
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
	//alert("update item locations called ")
	$.ajax({
        url: '../Server/GetViewGameInfo.php',
        type: 'POST',
        data: 
        {
            gameId: gameId,
        },
       success: function(data) {
			data = JSON.parse(data);
			Receive(data);
		},
	});	
}
function placeItemsOnMap(MapItems)
{

	/* now inside your initialise function */
	infowindow = new google.maps.InfoWindow({
	content: "holding..."
	});
	availableMapItems = MapItems;
	for (i = 0; i < MapItems.length; i++) 
	{
		var myLatLng = {lat: parseFloat(MapItems[i].Lat), lng: parseFloat(MapItems[i].Lng)};
		var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		icon: "img/chestIcon.png",
		title: 'Gold : ' + parseFloat(MapItems[i].Gold) + ", Pickup range : " + parseFloat(MapItems[i].PickUpRange) + "m",
		});	
		markers.push(marker);	
	}

}
function UpdateMyIcon(num)
{
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


ko.applyBindings(viewModel);