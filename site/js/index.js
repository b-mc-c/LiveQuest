var viewModel = {
	currentPageName : ko.observable("SignIn"),
	menuOptions : ko.observableArray([{name:"SignIn",url:"index.html",_class:"active"},
										{name:"Tutorial",url:"Tutorial.html",_class:""},]),
	SignInUserNameError: ko.observableArray(),
	SignInPassError : ko.observableArray(),
	SignUpUserNameError : ko.observableArray(),
	SignUpPassError : ko.observableArray(),
	SignUpConfPassError: ko.observableArray(),
	SignUpEmailError : ko.observableArray(),
}

$(document).ready(function(){
   
$("#SignIn").click(function(){
	if(validateSignIn())
	{
		message = {}
		message["SignIn"] = {"userName" : $("#UserName").val(), "password": $("#Password").val()};
		ws.send(JSON.stringify(message));
	}
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
	
	if(validateSignUp())
	{
		message = {};
		message["SignUp"] = {"userName" : $("#NewUserName").val(), "password": $("#NewPassword").val(), "Email" : $("#NewEmail").val()};
		ws.send(JSON.stringify(message));
	}
});



});//end document ready

function Receive(data)
{
	console.log(data);
	if(data["SIGNINSUCCEED"])
	{
		document.location.href = "home.html";
	}
	if(data["SIGNEDIN"])
	{
		if(data["SIGNEDIN"].localeCompare("SIGNEDIN")==0)
		{
			document.location.href = "home.html";
		}
	}
	if(data["ERROR"])
	{
		HandleErrors(data["ERROR"])
	}

}
function validateSignIn() 
{
	//clear the error list 
	viewModel["SignInUserNameError"].removeAll();
	viewModel["SignInPassError"].removeAll();
	//get data from input 
	var userName = $("#UserName").val();
	var password = $("#Password").val();
	//bool if true message passes all  validation
	var canSend = true;
	if (userName == "" || userName == null) //validae that username is not empty
	{
		viewModel["SignInUserNameError"].push("Please enter a UserName");
		canSend = false;
	}
	if (password == "" || password == null) //validae that username is not empty
	{
		viewModel["SignInPassError"].push("Please enter a password");
		canSend = false;
	}
	if (userName.indexOf(";") > -1 || userName.indexOf("'") > -1 || userName.indexOf('"') > -1) //validae that username does not contain ; ' or " characters 
	{
		viewModel["SignInUserNameError"].push("Invalid, Usernames cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	if (password.indexOf(";") > -1 || password.indexOf("'") > -1 || password.indexOf('"') > -1)//validae that username does not contain ; ' or " characters 
	{
		viewModel["SignInPassError"].push("Invalid,, Passwords cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	return canSend;
}
function validateSignUp() 
{
	//clear the error list 
	viewModel["SignUpUserNameError"].removeAll();
	viewModel["SignUpPassError"].removeAll();
	viewModel["SignUpConfPassError"].removeAll();
	viewModel["SignUpEmailError"].removeAll();
	//get data from input 
	var userName = $("#NewUserName").val();
	var password = $("#NewPassword").val();
	var confPass =  $("#ConfPassword").val();
	var email = $("#NewEmail").val();
	//bool if true message passes all  validation
	var canSend = true;
	//validate the data 
	if (userName == "" || userName == null) //validae that username is not empty
	{
		viewModel["SignUpUserNameError"].push("Please enter a UserName");
		canSend = false;
	}
	if (password == "" || password == null) //validae that username is not empty
	{
		viewModel["SignUpPassError"].push("Please enter a password");
		canSend = false;
	}
	if (userName.indexOf(";") > -1 || userName.indexOf("'") > -1 || userName.indexOf('"') > -1) //validae that username does not contain ; ' or " characters 
	{
		viewModel["SignUpUserNameError"].push("UserName cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	if (password.indexOf(";") > -1 || password.indexOf("'") > -1 || password.indexOf('"') > -1)//validae that username does not contain ; ' or " characters 
	{
		viewModel["SignUpPassError"].push("Passwords cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	if (email.indexOf(";") > -1 || email.indexOf("'") > -1 || email.indexOf('"') > -1)//validae that username does not contain ; ' or " characters 
	{
		viewModel["SignUpEmailError"].push("Passwords cannot contain the following characters ' ; \" ");
		canSend = false;
	}
	if (password != confPass)//validate passwords match 
	{
		viewModel["SignUpConfPassError"].push("Passwords do not match");
		canSend = false;
	}
	if(!validateEmail(email))//validate email is in correct format
	{
		viewModel["SignUpEmailError"].push("Email is not vaild exmp test@mail.com");
		canSend = false;
	}
	return canSend;
}
function validateEmail(email) //validate email is in correct format
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
function HandleErrors(data)
{
	ClearAllErrors();
	console.log("revieved Error");
	if(data.localeCompare("INVALIDUSERNAME") == 0)
	{
		viewModel["SignInUserNameError"].push("Incorrect UserName");
	}
	else if(data.localeCompare("INVALIDPASSWORD") == 0)
	{
		viewModel["SignInPassError"].push("Incorrect Password");
	}
	else if(data.localeCompare("INVALIDCHARSSIGNIN") == 0)
	{
		viewModel["SignInUserNameError"].push("UserName and passwords cannot contain the following characters ' ; \"");
	}
	else if(data.localeCompare("INVALIDCHARSSIGNUP") == 0)
	{
		viewModel["SignUpUserNameError"].push("UserName, passwords & Emails cannot contain the following characters ' ; \"");
	}
	else if(data.localeCompare("INVALIDUSERNAMETAKEN") == 0)
	{
		viewModel["SignUpUserNameError"].push("UserName already exists");
	}
}

function ClearAllErrors()
{
	viewModel["SignInUserNameError"].removeAll();
	viewModel["SignInPassError"].removeAll();
	viewModel["SignUpUserNameError"].removeAll();
	viewModel["SignUpPassError"].removeAll();
	viewModel["SignUpConfPassError"].removeAll();
	viewModel["SignUpEmailError"].removeAll();
}
ko.applyBindings(viewModel);