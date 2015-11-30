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

$(document).ready(function(){

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

ko.applyBindings(viewModel);