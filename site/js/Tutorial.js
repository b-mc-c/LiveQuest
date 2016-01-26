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
};

var myLatLng;  

var setUpGameTut = 1, playGameTut = 2;


var currentStep = 1;
var currentSubStep = 1;
var currentTutorial = setUpGameTut;

/* Function gets called when page loaded */
$(document).ready(function(){

	/*highlight the textinput for step 1*/
	$("#NewGameName").effect( "highlight", {color:"#008000"}, 5000 );
	/*Detect change to textinput for step 1*/
	$('#NewGameName').on('input',function(e){
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 1)
		{
			next();
		}
	});
	/*Detect change to textinput for step 2*/
	$('#NewgameEndTime').on('input',function(e){ 
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 2)
		{
			next();	
		}
	});
	/*Detect change to textinput for step 3*/
	$('.carousel-control').click(function(e){ 
		/*Only call next when there is change to name and current step is 1*/
		if (currentStep == 3 && currentSubStep == 1)
		{
			next();	
		}
	});
	

});//end doc ready


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
}//end recieve


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
	var map = new google.maps.Map(document.getElementById('map'), {
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
      radius: 500
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





/*apply viewmodel knockout js*/
ko.applyBindings(viewModel);