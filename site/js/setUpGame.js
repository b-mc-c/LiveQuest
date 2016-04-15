/*Observable objects on this page */
var viewModel = {
	currentPageName : ko.observable("Set Up Game"),
	menuOptions : ko.observableArray([{name:"Set Up Game",url:"setUpGame.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	NewGameNameError: ko.observableArray(),
	NewGameTimeError : ko.observableArray(),
	fishingGold : ko.observable(50),
	fishingRange : ko.observable(100),
	hammerGold : ko.observable(50),
	hammerRange : ko.observable(100),
	diggerGold : ko.observable(50),
	diggerRange : ko.observable(100),
	thievesGold : ko.observable(50),
	thievesRange : ko.observable(100),
	bookGold : ko.observable(50),
	bookRange : ko.observable(100),
	basketGold : ko.observable(50),
	basketRange : ko.observable(100),
	pocketGold : ko.observable(50),
	pocketRange : ko.observable(100),
	chainGold : ko.observable(50),
	chainRange : ko.observable(100),
	keyRange: ko.observable(100),
	markers: ko.observableArray(),
	associateKey : ko.observable(false), /*set to true when user places key and needs to associate a key with an item*/
	CreateNewGame : function()/* Create new game button click*/
	{
		if(validateNewGame())
		{
			$.ajax({
		        url: '../Server/CreateGame.php',
		        type: 'POST',
		        async: false,
		        data: 
		        {
		            GameName: $("#NewGameName").val(),
		            EndTime: $("#NewgameEndTime").val(),
		            placedItems : this.markers(),
		        },
		       success: function(data) {
			    data = JSON.parse(data);
				Receive(data);
			    }
	    	});/*end ajax*/
		}
	}/*End Create new game button click*/,
	Place : function(value)
	{
		
		if(!viewModel.associateKey())
		{
			dropPin = true;
			switch(value) {
	   			case "CHAIN":
					item = {Name : "Purse Chain", ID : 1 , Gold : viewModel.chainGold() , Range : viewModel.chainRange()};
					image = "img/chainIcon.png";
					break;
				case "POCKET":
					item = {Name : "Fake Pocket", ID : 2 , Gold : viewModel.pocketGold() , Range : viewModel.pocketRange()};
					image = "img/pocketIcon.png";
					break;
				case "HAMMER":
					item = {Name : "Mc Hammer", ID : 3 , Gold : viewModel.hammerGold() , Range : viewModel.hammerRange()};
					image = "img/MCHammerIcon.png";
					break;
				case "ROD":
					item = {Name : "Fishing rod", ID : 4 , Gold : viewModel.fishingGold() , Range : viewModel.fishingRange()};
					image = "img/fishing-rodIcon.png";
					break;
				case "DIGGER":
					item = {Name : "Gold Digger", ID : 5 , Gold : viewModel.diggerGold() , Range : viewModel.diggerRange()};
					image = "img/gold_diggerIcon.png";
					break;
				case "ALI":
					item = {Name : "40 Thieves", ID : 6 , Gold : viewModel.thievesGold() , Range : viewModel.thievesRange()};
					image = "img/thievesIcon.png";
					break;
				case "BOOK":
					item = {Name : "Oldest trick in the book ", ID : 7 , Gold : viewModel.bookGold() , Range : viewModel.bookRange()};
					image = "img/bookIcon.png";
					break;
				case "BASKET":
					item = {Name : "Baby in a Basket ", ID : 8 , Gold : viewModel.basketGold() , Range : viewModel.basketRange()};
					image = "img/basketIcon.png";
					break;
				case "KEY":
					if(Object.keys(viewModel.markers()).length == 0)
					{
						
						dropPin = false;
					}
					else 
					{
						item = {Name : "Key ", ID : 9 , Gold : 0 , Range : viewModel.keyRange()};
						image = "img/keyIcon.png";
					}
					break;
			}//end switch
			$('html,body').animate({scrollTop: $("#map").offset().top},'slow');	
		}//end if
	},


}
var FIREFOX = /Firefox/i.test(navigator.userAgent);
/* Info for markers being placed on map */
var item = {Name : "Purse Chain", ID : 1 , Gold : viewModel.chainGold() , Range : viewModel.chainRange()};//{Name : ,ID :,  Gold : , Range : };
var dropPin = false; // pins can only be placed when dropPin is true 
var image = "img/chainIcon.png";

/* Markers list*/
/* ID : {Item : Chain, Gold : 50, Range : 100, Lng : 5.00, Lat : 5.00}*/
var itemId = 0; // increments each time an item is added to markers 
var key = ""
/* Function gets called when page loaded */
$(document).ready(function(){

	if (FIREFOX) {
		viewModel["NewGameTimeError"].push("Enter DateTime format yyyy-mm-ddThh:mm exmp '2015-01-01T00:00'")
	}
	initMap();/*Call initialise map when page is loaded*/
});//end document ready


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
		document.location.href = "ViewGame.html#" +data["GAMECREATEDSUCCESS"] ;
	}
	if(data["ERROR"])
	{
		HandleErrors(data["ERROR"])
	}
}//end recieve
/* validate the manually entered data is ok before sending to server*/
function validateNewGame()
{
	//clear the error list 
	viewModel["NewGameTimeError"].removeAll();
	viewModel["NewGameNameError"].removeAll();
	//get data from input 
	var Name = $("#NewGameName").val();
	var dt = $("#NewgameEndTime").val();
	var now = new Date();
	//bool if true message passes all  validation
	var canSend = true;
	if (FIREFOX) {
		viewModel["NewGameTimeError"].push("Enter DateTime format yyyy-mm-ddThh:mm exmp '2015-01-01T00:00'")
	}
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
	if(Object.keys(viewModel.markers()).length == 0)
	{
		canSend = false;
		viewModel["NewGameNameError"].push("Invalid, No Items have been placed ' ; \" ");
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
				icon: image,
				itemId : itemId
				});
		 	viewModel.markers()[itemId] = {InGameId : itemId ,Item : item.ID, Name :item.Name, Gold : parseInt(item.Gold), Range: parseInt(item.Range), Lat: event.latLng.lat(), Lng : event.latLng.lng(),Locked : 0 , Unlocks : 0};
		 	/* ID : {Item : Chain, Gold : 50, Range : 100, Lng : 5.00, Lat : 5.00}*/
		 	if(item.ID == 9)
		 	{
		 		key = viewModel.markers()[itemId]
		 		viewModel.associateKey(true);
		 	}
		 	else
		 	{
		 		google.maps.event.addListener(marker,'click',function() 
		 		{
		 			if(viewModel.associateKey())
		 			{
		 				key["Unlocks"] = this.itemId;
		 				viewModel.markers()[this.itemId].Locked = 1
		 				viewModel.associateKey(false);
		 			}
		 		});
		 	}
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

/*apply viewmodel knockout js*/
ko.applyBindings(viewModel);