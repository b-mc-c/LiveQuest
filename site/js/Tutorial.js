/*Observable objects on this page */
var viewModel = {
	currentPageName : ko.observable("Tutorial"),
	menuOptions : ko.observableArray([{name:"Tutorial",url:"Tutorial.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
}

var myLatLng;  




/* Function gets called when page loaded */
$(document).ready(function(){

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






/*apply viewmodel knockout js*/
ko.applyBindings(viewModel);