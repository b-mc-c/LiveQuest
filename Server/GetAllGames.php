<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$message = array();/*message to be returned*/
	DeActivateOldGames();/*remove old games*/
	
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	if($userId != null)
	{
		$myGames= GetGamesHostedByUser($userId);
		$allGames = GetAllGames();
		$rows = array();
		while($r = $myGames->fetch_assoc()) 
		{
			$rows['myHostedGames'][] = $r;
		}	
		while($r = $allGames->fetch_assoc()) 
		{
			$rows['availableGames'][] = $r;
		}
		$message['GAMESLIST'] = $rows;
	}	
	echo json_encode($message);/*return the message as ajson encoded object*/
?>