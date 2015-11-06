var viewModel = {
	currentPageName : ko.observable("Home"),
	menuOptions : ko.observableArray([{name:"Home",url:"home.html",_class:"active"},]),
}

$(document).ready(function(){

$("#LogOutBtn").click(function(){
	message = {}
	message["LOGOUT"] = "LogOut";
	ws.send(JSON.stringify(message));
});

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




ko.applyBindings(viewModel);