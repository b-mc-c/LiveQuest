var viewModel = {
	currentPageName : ko.observable("Set Up Game"),
	menuOptions : ko.observableArray([{name:"Set Up Game",url:"setUpGame.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},]),
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
	chainGold : ko.observable("50"),
}

var item = "Name : , Gold : , Range : ";
var dropPin = false;
var image = "img/chainIcon.png";


$(document).ready(function(){

	initMap();
	$("#LogOutBtn").click(function(){
		message = {}
		message["LOGOUT"] = "LogOut";
		ws.send(JSON.stringify(message));
	});
	$("#CreateNewGame").click(function(){
		if(validateNewGame())
		{
			message = {}
			message["CREATENEWGAME"] = {"GameName" : $("#NewGameName").val(), "EndTime": $("#NewgameEndTime").val()};
			ws.send(JSON.stringify(message));
		}
	});
	/*Click events for placing items */
	$("#chainButton").click(function(){
		item = "Name : Purse Chain , Gold : " + viewModel.chainGold();
		dropPin = true;
		image = "img/chainIcon.png";
	});
	$("#pocketButton").click(function(){
		item = "Name : Fake Pocket , Gold : " + viewModel.pocketGold();
		dropPin = true;
		image = "img/pocketIcon.png";
	});
	$("#hammerButton").click(function(){
		item = "Name : Mc Hammer , Gold : " + viewModel.hammerGold() + ", Range : " + viewModel.hammerRange() + "m";
		dropPin = true;
		image = "img/MCHammerIcon.png";
	});
	$("#rodButton").click(function(){
		item = "Name : Fishing rod , Gold : " + viewModel.fishingGold() + ", Range : " + viewModel.fishingRange() + "m";
		dropPin = true;
		image = "img/fishing-rodIcon.png";
	});
	$("#diggerButton").click(function(){
		item = "Name : Gold Digger , Gold : " + viewModel.diggerGold() + ", Range : " + viewModel.diggerRange() + "m";
		dropPin = true;
		image = "img/gold_diggerIcon.png";
	});
	$("#aliButton").click(function(){
		item = "Name : 40 Thieves , Gold : " + viewModel.thievesGold() + ", Range : " + viewModel.thievesRange() + "m";
		dropPin = true;
		image = "img/thievesIcon.png";
	});
	$("#bookButton").click(function(){
		item = "Name : Oldest trick in the book , Gold : " + viewModel.bookGold() + ", Range : " + viewModel.bookRange() + "m";
		dropPin = true;
		image = "img/bookIcon.png";
	});
	$("#basketButton").click(function(){
		item = "Name : Baby in a Basket , Gold : " + viewModel.basketGold() + ", Range : " + viewModel.basketRange() + "m";
		dropPin = true;
		image = "img/basketIcon.png";
	});
	 $(function() {
    $( "#GoldHammer, #GoldFishing, #GoldDigger, #GoldThieves, #GoldBook, #GoldBasket, #GoldPocket, #GoldChain").slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 50,
      slide: refresh,
      change: refresh
    });
    $( "#RangeHammer, #RangeFishing, #RangeDigger , #RangeThieves, #RangeBook, #RangeBasket").slider({
      orientation: "horizontal",
      range: "min",
      max: 200,
      value: 100,
      slide: refresh,
      change: refresh
    });
  });

});//end document ready

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
	viewModel.pocketGold( $("#GoldPocket").slider( "value" ));
  }

function mapClicked(e)
{
	alert("map clicked");
}


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
}
function HandleErrors(data)
{
	ClearAllErrors();
	if(data.localeCompare("INVALIDCHARSNEWGAME") == 0)
	{
		viewModel["NewGameNameError"].push("Invalid, Games Names cannot contain the following characters ' ; \" ");
	}
}
function ClearAllErrors()
{
	viewModel["NewGameNameError"].removeAll();
	viewModel["NewGameTimeError"].removeAll();
	
}

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
				title: item,
				icon: image
				});
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