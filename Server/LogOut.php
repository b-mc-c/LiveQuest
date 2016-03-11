<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	
	/*Check if ip already associated with player in connections table*/
	RemoveIp($ip);
	$message = '{"LOGGEDOUT" : true}';
	echo $message;
?>