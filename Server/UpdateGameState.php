<?php
	include 'functions.php';
	$ip =$_SERVER['REMOTE_ADDR'];/*ip address of user */
	$gameId = $_POST['gameId'];/*get game id*/ 
	$message = array();/*message to be returned*/
	$userId = GetIdFromConnections($ip);/*get user id associated with this ip*/
	$player_Lat = $_POST['lat'];/*get the players current lat*/ 
	$player_Lng = $_POST['lng'];/*get the players current lng*/
	/*validate ip is associated with a user*/
	$message['ITEMSFOUND'] = null;
	$message['PlayersInGame'] = null;
	$message['MyItemsList'] = null;
	if($userId != null)
	{
		/*Verify the user is part of this game*/
		if(IsPlayerInGame($gameId, $userId) == true)
		{
			UpdatePlayerLocation($gameId,$userId,$player_Lat,$player_Lng);/*set players location*/
			$activeItems = GetActiveItems($gameId);/*get the items in game*/
			while($r = $activeItems->fetch_assoc()) 
			{
				$message['ITEMSFOUND'][] = $r;
			}
			$message['PLAYERICON'] = GetPlayerIcon($gameId,$userId);/*Get the players icon*/
			$playerItems = GetPlayersItems($gameId,$userId);/*get the Players picked up items*/
			while($r = $playerItems->fetch_assoc()) 
			{
				$message['MyItemsList'][] = $r;
			}
			$message['CurrentGold'] = GetPlayersGold($gameId,$userId);//*get the current players gold*/
			$otherPlayers = GetPlayersInGame($gameId,$userId);/*get all other player in the game*/
			while($r = $otherPlayers->fetch_assoc()) 
			{
				$message['PlayersInGame'][] = $r;
			}
			$message['gameOver'] = checkGameOver($gameId);
		}
		
	}	
	echo json_encode($message);/*return the message as ajson encoded object*/
?>