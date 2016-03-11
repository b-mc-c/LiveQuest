<?php

	include 'functions.php';
	$userName = $_POST['name'];/*new users userName*/
	/*hash the new users password*/
	$passWord = password_hash($_POST['password'], PASSWORD_DEFAULT);
	$email = $_POST['email'];/*new users email address*/
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	
	/*Check if userName is available*/
	if (UsernameAvailable($userName)  === true)
	{
		//the name is not already in associated with user in db 
		if(AddNewUser($userName,$passWord,$email)=== true)
		{
			// User added to db 
			$message = '{"SIGNINSUCCEED" : true}';
			/*add user to connections table*/
			$userId = GetUserid($userName);
			AddUserToConnections($userId,$ip);
		}
		
	}
	else
	{
		//the name is already in associated with user in db 
		$message = '{"ERROR" : "INVALIDUSERNAMETAKEN"}';
	}
	echo $message;

?>