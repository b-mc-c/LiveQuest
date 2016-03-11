<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	
	/*Check if ip already associated with player in connections table*/
	if(IpInConnections($ip) === true)
	{
		$message = '{"SIGNEDIN" : "SIGNEDIN"}';
	}
	else
	{
		//the ip does not exist in connections 
		$message = '{"SIGNEDIN" : "NOTSIGNEDIN"}';
	}
	echo $message;
?>