<?php

	include 'functions.php';
	/*End of functions */
	$userName = $_POST['name'];/*get the users userName*/
	$passWord = $_POST['password'];/*get the users password*/

	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	
	/*Check if userName exists*/
	if (UsernameAvailable($userName)  === false)
	{
		//the name is not already in associated with user in db 
		if(ConfirmPassword($userName,$passWord)=== true)
		{
			/*User password confirmed */ 
			/*add user to connections table*/
			$userId = GetUserid($userName);
			AddUserToConnections($userId,$ip);
			$message = '{"SIGNINSUCCEED" : true}';
		}
		else
		{
			$message = '{"ERROR" : "INVALIDPASSWORD"}';
		}
	}
	else
	{
		//the username does not exist in db 
		$message = '{"ERROR" : "INVALIDUSERNAME"}';
	}
	echo $message;

?>