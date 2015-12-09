var viewModel = {
	currentPageName : ko.observable("Add Player"),
	menuOptions : ko.observableArray([{name:"Set Up Game",url:"setUpGame.html",_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	gameID : ko.observable(window.location.hash.substring(1)),

}

$(document).ready(function(){

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
}


function HandleErrors(data)
{
	ClearAllErrors();
}
function ClearAllErrors()
{	
}

ko.applyBindings(viewModel);