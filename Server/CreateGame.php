<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	$GameName = $_POST['GameName'];/*get gameName*/
	$EndTime = $_POST['EndTime'];/*get game end time*/
	$placedItems = $_POST['placedItems'];/*get placed items*/
	$message  = printf("name: %s , endTime : %s , items : %s",$GameName,$EndTime,json_encode($placedItems));
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	if($userId != null)
	{
		
	}	
	echo $message;/*return the message */
?>