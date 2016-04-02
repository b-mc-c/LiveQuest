<?php

	include 'functions.php';
	$message = array();												/*message to be returned*/
	$gameId = $_POST['gameId'];										/*the game being played */
	$itemId = $_POST['item'];										/*the item to bwe used */
	$targetId = $_POST['target'];									/*get the target the item is to be used on*/	
	$ip =$_SERVER['REMOTE_ADDR'];									/*ip address of user */
	$userId = GetIdFromConnections($ip);							/*get user id associated with this ip*/
	
																	/*Step 1 verify user is in game*/
	if(IsPlayerInGame($gameId, $userId) == true)
	{
																	/*Step 2 verify item is accoitated with
																		user and has not been used*/
		if(UserHasActiveItem($userId, $itemId, $gameId) == true)
		{
																	/*Step 3 get distance between the user and the target,
																		verify it is less than the range of the item*/
			if(IsTargetInRange($userId, $itemId, $targetId, $gameId)== true)
			{
																	/*Step 4 set the item acitve to 
																		false to indicate it has been used*/
				SetItemActiveToFalse($itemId);
																	/*Step 5 reduce the targets gold*/
				$stealGold = GetItemsTheftAmount($itemId);			/*get items gold theft value*/
				$targetsGold = GetPlayersGold($gameId,$targetId);	/*get the targets gold value*/
				if($targetsGold  > 0)
				{
					$newValue = $targetsGold - $stealGold ;				/*subtract the gold from the targets gold*/
					$offset = 0;
					if($newValue < 0)									/*check not below 0*/
					{
						$offset = $newValue;
						$newValue = 0;
					}
					SetPlayersGold($gameId,$targetId, $newValue); 		/*sets the players new gold in db*/
																		/*Step 6 increase the users gold*/
					$stealGold = GetItemsTheftAmount($itemId);			/*get items gold theft value*/
					$playersGold = GetPlayersGold($gameId,$userId);		/*get the targets gold value*/
					$newValue = $playersGold + $stealGold + $offset ;	/*subtract the gold from the targets gold*/
					SetPlayersGold($gameId,$userId, $newValue); 		/*sets the players new gold in db*/
				}
			}	
		}
		
	}
																	/*Step 7 return to user new gold and list of active items*/
	$playerItems = GetPlayersItems($gameId,$userId);/*get the Players picked up items*/
	while($r = $playerItems->fetch_assoc()) 
	{
		$message['MyItemsList'][] = $r;
	}
	$message['CurrentGold'] = GetPlayersGold($gameId,$userId);		/*get the current players gold*/
	
	echo json_encode($message);										/*return the message as ajson encoded object*/

?>