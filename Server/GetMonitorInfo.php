<?php
	include 'functions.php';
	$gameId = $_POST['gameId'];/*get game id*/ 
	$message = array();/*message to be returned*/
	/*validate ip is associated with a user*/
	$message['AllPlayersInfo'] = null;
	$message['AllPlayerMarkers'] = null;
	$message['AllItems'] = null;
	
	/*Verify the game exists*/
	if(IsGameInDb($gameId) == true)
	{	
		$activeItems = GetActiveItems($gameId);/*get the items in game*/
		while($r = $activeItems->fetch_assoc()) 
		{
			$message['AllItems'][] = $r;
		}
		$Players = getPlayers($gameId);/*get all players in the game*/
		while($r = $Players->fetch_assoc()) 
		{
			$message['AllPlayerMarkers'][] = $r;
			$items =  GetPlayersItems($gameId,$r["PlayerId"]);/*get the Players picked up items*/
			$itemArray = array();
			$itemArray["items"] = null;
			while($row = $items->fetch_assoc()) 
			{
				$itemArray["items"][] = $row;
			}
			$itemArray["gold"] = GetPlayersGold($gameId,$r["PlayerId"]);
			$message['AllPlayersInfo'][] = $itemArray;
		}
	}
			
	echo json_encode($message);/*return the message as ajson encoded object*/
	
	function IsGameInDb($gameId)
	{
		$sql = sprintf("SELECT COUNT(*) FROM games WHERE id = '%d'" , $gameId);
		$result = RunSql($sql);
		$COUNT_NUMBER = $result->fetch_array(); 
		$count = $COUNT_NUMBER[0]; 
		/*if count == 0 then no game found*/
		if($count == 0)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	function getPlayers($gameId)
	{
		$sql = sprintf("SELECT PlayerId , PlayerIcon , Lat ,Lng  from game_players WHERE GameId = %d  AND Alive = 1 ", $gameId);
		return RunSql($sql);
	}

	
?>