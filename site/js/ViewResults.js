var viewModel = {
	currentPageName : ko.observable("ViewResults Game"),
	menuOptions : ko.observableArray([{name:"ViewResults",url:"#"+window.location.hash.substring(1),_class:"active"},
									{name:"Home",url:"home.html",_class:""},
									{name:"LogOut",url:"LogOut.html",_class:""},]),
	results : ko.observableArray(),
	
}
var gameId = parseInt(window.location.hash.substring(1));

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
			$.ajax({
		        url: '../Server/Getresults.php',
		        type: 'POST',
		        data: 
		        {
		            gameId: gameId,
		        },
		       success: function(data) {
					data = JSON.parse(data);
					Receive(data);
				},
			});	/*end ajax*/
		}
	}
	if(data["LOGGEDOUT"])
	{
		document.location.href = "index.html";
	}
	if(data["Results"])
	{
		viewModel.results.removeAll();
		var results = data["Results"];
		for (i = 0; i < results.length; i++) 
		{
			viewModel.results.push(results[i]);	
		}
	}
}//end recieve

ko.applyBindings(viewModel);