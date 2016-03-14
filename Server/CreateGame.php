<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = "";/*message to be returned*/
	$gameName = $_POST['GameName'];/*get gameName*/
	$endTime = $_POST['EndTime'];/*get game end time*/
	$items = $_POST['placedItems'];/*get placed items*/
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	if($userId != null)
	{
		/* add new game and set the id of new game as gameId*/
		$gameId = AddNewGame($userId, $gameName, $endTime);
		AddItemsToGame($gameId, $items);
		$message = '{"GAMECREATEDSUCCESS" : '. $gameId .'}';
	}	
	echo $message;/*return the message */
?>