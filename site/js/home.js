var viewModel = {
	currentPageName : ko.observable("Home"),
	menuOptions : ko.observableArray([{name:"Home",url:"home.html",_class:"active"},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	availableGames : ko.observableArray(),
	myHostedGames : ko.observableArray(),
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
		else
		{
			GetGames();
		}
	}
	if(data["LOGGEDOUT"])
	{
		document.location.href = "index.html";
	}
	if(data["GAMESLIST"])
	{
		SetGames(data["GAMESLIST"])
	}
}

function GetGames()
{
	message = {}
	message["GETGAMES"] = "ALL";
	ws.send(JSON.stringify(message));
}
function SetGames(data)
{
	/*Make sure Arrays are empty*/
	viewModel.availableGames.removeAll();
	viewModel.myHostedGames.removeAll();

	var a = data["availableGames"]
	var h = data["myHostedGames"]
	for (i = 0; i < a.length; i++) 
	{
		var temp = {Name:a[i]["name"],end:a[i]["time"],url:"ViewGame.html#" + a[i]["id"], hostName: a[i]["host"]};
		viewModel.availableGames.push(temp);
	}
	for (i = 0; i < h.length; i++) 
	{
		var temp = {Name:h[i]["name"],end:h[i]["time"],url:"ViewGame.html#" + h[i]["id"]};
		viewModel.myHostedGames.push(temp);
	}
}



ko.applyBindings(viewModel);