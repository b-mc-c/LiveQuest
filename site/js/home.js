var viewModel = {
	currentPageName : ko.observable("Home"),
	menuOptions : ko.observableArray([{name:"Home",url:"home.html",_class:"active"},
									{name:"Tutorial",url:"Tutorial.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""}]),
	availableGames : ko.observableArray(),
	myHostedGames : ko.observableArray(),
	inactiveGames : ko.observableArray(),
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
	$.ajax(
	{
		url: '../Server/GetAllGames.php',
		type: 'Get',
		success: function(data) 
		{
			data = JSON.parse(data);
			Receive(data);
		}
	});
}
function SetGames(data)
{
	/*Make sure Arrays are empty*/
	viewModel.availableGames.removeAll();
	viewModel.myHostedGames.removeAll();

	var a = data["availableGames"]
	var h = data["myHostedGames"]
	var n = data["myInactiveGames"]
	if(a != null)
	{
		for (i = 0; i < a.length; i++) 
		{
			var temp = {Name:a[i]["GameName"],end:a[i]["GameEndTime"],url:"ViewGame.html#" + a[i]["id"], hostName: a[i]["HostId"],
			 leaderName :  a[i]["highestPlayer"]["name"] , leaderGold :  a[i]["highestPlayer"]["Gold"]};
			viewModel.availableGames.push(temp);
		}
	}
	if(h != null)
	{
		for (i = 0; i < h.length; i++) 
		{
			var temp = {Name:h[i]["GameName"],end:h[i]["GameEndTime"],url:"ViewGame.html#" + h[i]["id"],
			leaderName :  h[i]["highestPlayer"]["name"] , leaderGold :  h[i]["highestPlayer"]["Gold"]};
			viewModel.myHostedGames.push(temp);
		}
	}
	if(n != null)
	{
		for (i = 0; i < n.length; i++) 
		{
			var temp = {Name:n[i]["GameName"],url:"ViewResults.html#" + n[i]["id"],
			myRank :  n[i]["Rank"]};
			viewModel.inactiveGames.push(temp);
		}
	}
}



ko.applyBindings(viewModel);