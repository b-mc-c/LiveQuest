var viewModel = {
	currentPageName : ko.observable("SignIn"),
	menuOptions : ko.observableArray([{name:"SignIn",url:"index.html",_class:"active"},]),

}

$(document).ready(function(){
   
$("#SignIn").click(function(){
	var userName = $("#UserName").val();
	var password = $("#Password").val();
	message = {}
	message["SignIn"] = {"userName" : userName, "password": password};
	ws.send(JSON.stringify(message));
});

$("#Join").click(function(){
	$("#existingUser").hide();
	$("#newUser").show();
});

$("#ReturnToSignIn").click(function(){
	$("#newUser").hide();
	$("#existingUser").show();
});

$("#SignUP").click(function(){
	var userName = $("#NewUserName").val();
	var password = $("#NewPassword").val();
	var confPass =  $("#ConfPassword").val();
	var email = $("#NewEmail").val();
	$("#passNotMatch").hide();
	$("#EmailNotMatch").hide();
	var canSend = true;
	if (password != confPass)
	{
		$("#passNotMatch").show();
		canSend = false;
	}
	if(!validateEmail(email))
	{
		$("#EmailNotMatch").show();
		canSend = false;
	}
	if(canSend)
	{
		message = {};
		message["SignUp"] = {"userName" : userName, "password": password, "Email" : email};
		ws.send(JSON.stringify(message));
	}
	
		
	
});



});//end document ready

function Receive(data)
{
	console.log(data);
	if (data["SignIn"])
	{
		console.log("revieved message");
		console.log(data["SignIn"]);
	}
}
function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

ko.applyBindings(viewModel);