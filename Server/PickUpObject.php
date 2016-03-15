<?php
	include 'functions.php';
	$message = array();						/*message to be returned*/
	$ip =$_SERVER['REMOTE_ADDR'];			/*ip address of user */
	$gameId = $_POST['gameId'];				/*get game id*/ 
	$userId = GetIdFromConnections($ip);	/*get user id associated with this ip*/
	$player_Pos = $_POST['latLng'];			/*get the players current lat, lng*/ 
	$itemId = $_POST['item'];				/*get the itemId to be picked up*/
	$message['ITEMSFOUND'] = null;
	$message['MyItemsList'] = null;
	/*validate ip is associated with a user*/
	if($userId != null)
	{
		/*Verify the user is part of this game*/
		if(IsPlayerInGame($gameId, $userId) == true)
		{
			UpdatePlayerLocation($gameId,$userId,$player_Pos["lat"],$player_Pos["lng"]);/*set players location*/
			/*Verify that user is in range of item to be picked up*/
			if(UserInRangeOfItem($gameId,$userId,$itemId) == true)
			{
				AsignItemToPlayer($gameId,$userId,$itemId);/*asign the item to the player*/
				$activeItems = GetActiveItems($gameId);/*get the items in game*/
				while($r = $activeItems->fetch_assoc()) 
				{
					$message['ITEMSFOUND'][] = $r;
				}
				$playerItems = GetPlayersItems($gameId,$userId);/*get the Players picked up items*/
				while($r = $playerItems->fetch_assoc()) 
				{
					$message['MyItemsList'][] = $r;
				}
				$message['CurrentGold'] = GetPlayersGold($gameId,$userId);//*get the current players gold*/
			}
		}	
	}	
	echo json_encode($message);/*return the message as ajson encoded object*/
?>