<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$gameId = $_POST['gameId'];/*get game id*/ 
	$iconId = $_POST['playerIconId'];/*get players icon id*/ 
	$message = array();/*message to be returned*/	
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	if($userId != null)
	{
		AddPlayerToGame($gameId, $userId, $iconId);
	}	
	echo true;/*return the message as ajson encoded object*/
?>