<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$gameId = $_POST['gameId'];/*get game id*/ 
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	$message = array();/*message to be returned*/
	$message['ITEMSFOUND'] = null;
	if($userId != null)
	{

		$items = GetActiveItems($gameId);
		
		while($r = $items->fetch_assoc()) 
		{
			$message['ITEMSFOUND'][] = $r;
		}	
		if(IsPlayerInGame($gameId, $userId) === true)
		{
			$message['PLAYERICON'] = GetPlayerIcon($gameId,$userId);
		}
	}	
	echo json_encode($message);/*return the message as ajson encoded object*/
?>