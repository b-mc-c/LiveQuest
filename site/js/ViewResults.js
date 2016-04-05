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
		        url: '../Server/GetResults.php',
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
	}
}//end recieve

ko.applyBindings(viewModel);