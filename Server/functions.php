<?php
	
	/* functions*/
	/*connects to db runs the command passed in and returns the result*/
	function RunSql($sql) 
	{
		include 'config.php';   
		// Create connection
		$conn = new mysqli($servername, $username, $password, $dbname);
		// Check connection
		if ($conn->connect_error) {
			die("Connection failed: " . $conn->connect_error);
		} 
		// run the command 
		$result = $conn->query($sql);
		// close the connection
		$conn->close();
		// return the result
		return $result;
	}
	/*returns true if username is available else false*/
	function UsernameAvailable($userName) 
	{
		$sql = sprintf("SELECT COUNT(*) FROM Users WHERE userName = '%s'" , $userName);
		$result = RunSql($sql);
		$COUNT_NUMBER = $result->fetch_array(); 
		$count = $COUNT_NUMBER[0]; 
		/*if count == 0 then username is available*/
		if($count == 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	/*add new user to users table returns result */
	function AddNewUser($userName,$passWord,$email) 
	{
		$sql = sprintf("INSERT INTO Users (userName , password, email) VALUES ( '%s' , '%s', '%s')" , $userName, $passWord ,$email);
		return $result = RunSql($sql);
	}
	/*get the user id from user table associated with userName */	
	function GetUserid($userName)
	{
		$sql = sprintf("SELECT id FROM Users WHERE userName ='%s'" ,$userName);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		return $row['id'];
		
	}
	/*add user id and ip to connections */	
	function AddUserToConnections($userId , $ip)
	{
		$sql = sprintf("INSERT INTO Connections (userID , IpKey) VALUES ( %d , '%s')" ,$userId , $ip);
		$result = RunSql($sql);
	}
	/*returns true if user password is correct or fasle if it is not */	
	function ConfirmPassword($userName,$password)
	{
		$sql = sprintf("SELECT * FROM Users WHERE userName ='%s'",$userName);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		if (password_verify($password, $row['password'])) 
		{
			/* Success! */
			return true;
		}
		else
		{
			/* Invalid credentials */
	 		return false;
		}
	}
	/*returns true if ip is in connections table or fasle if it is not */	
	function IpInConnections($ip)
	{
		$sql = sprintf("SELECT COUNT(*) FROM Connections WHERE IpKey ='%s'" , $ip);
		$result = RunSql($sql);
		$COUNT_NUMBER = $result->fetch_array(); 
		$count = $COUNT_NUMBER[0]; 
		/*if count == 0 then ip is in table*/
		if($count == 0)
		{
			return false;
		}
		else
		{
			return true;
		}	
	}
	/*returns user id if ip is in connections table or null if it is not */	
	function GetIdFromConnections($ip)
	{	
		/*confirm ip exists in connections*/
		if(IpInConnections($ip) === true)
		{
			/*get the id asociated with ip and return*/
			$sql = sprintf("SELECT userID FROM Connections WHERE IpKey ='%s'" , $ip);
			$result = RunSql($sql);
			$row = $result->fetch_assoc();
			return $row['userID'];
		}
		else
		{
			return Null;
		}	
	}
	/*sets the active value of any game in table whose endTime is before current time to null*/
	function DeActivateOldGames()
	{	
		$sql = sprintf("UPDATE games SET active=0 WHERE active = 1 AND GameEndTime < now()");
		$result = RunSql($sql);		
	}
	/*get Games hosed by user*/
	function GetGamesHostedByUser($userId)
	{	
		$sql = sprintf("SELECT id ,GameName, GameEndTime FROM games WHERE  HostId = %d AND active = 1 AND GameEndTime > now()", $userId);
		return RunSql($sql);	
			
	}
	/*get all available Games*/
	function GetAllGames()
	{
		$sql = sprintf("SELECT id ,GameName, GameEndTime, HostId FROM games WHERE active = 1 AND GameEndTime > now()");
		return RunSql($sql);			
	}
	/*remove the users ip from connections*/
	function RemoveIp($ip)
	{
		if(IpInConnections($ip) === true)
		{
			
			$sql = sprintf("DELETE FROM Connections WHERE IpKey = '%s';", $ip);
			return RunSql($sql);
		}
	}
	/*adds a new game with name $name , endtime $endtime associated with userId $userId returns the new games id*/
	function AddNewGame($userId, $name, $endTime)
	{
		$sql = sprintf("INSERT INTO games (GameName , GameEndTime, HostId, active) VALUES ( '%s' , '%s',%d, 1)" ,$name, $endTime, $userId);
		RunSql($sql);
		$sql = sprintf("SELECT id FROM games WHERE GameName ='%s' and GameEndTime ='%s' and HostId = %d LIMIT 1" ,$name, $endTime, $userId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		return $row['id'];
	}
	/*adds a new game with name $name , endtime $endtime associated with userId $userId returns the new games id*/
	function AddItemsToGame($gameId, $items)
	{
		foreach ($items as $item) 
		{
			$sql = sprintf("INSERT INTO game_items (GameId, ItemIdentifier , Name, Gold ,PickUpRange ,Lat ,Lng ,PickedUp ,Alive) 
											VALUES ( %d, %d , '%s',%d , %d, %.20f , %.20f , 0, 1)", $gameId,
											$item["Item"], $item["Name"], $item["Gold"], $item["Range"], $item["Lat"], $item["Lng"]);
			RunSql($sql);
		}
	}
	/*adds a player to a game if they are not curently in the game*/
	function AddPlayerToGame($gameId, $userId, $iconId)
	{
		/*check if player currently in game*/
		if(IsPlayerInGame($gameId, $userId) === false)
		{
			$sql = sprintf("INSERT INTO game_players (GameId, PlayerId , Gold ,Lat ,Lng ,Alive,PlayerIcon) 
											VALUES ( %d, %d , 0 ,0 , 0, 1 ,%d)", $gameId, $userId, $iconId);
			RunSql($sql);
		}
	}
	/*adds a player to a game if they are not curently in the game*/
	function IsPlayerInGame($gameId, $userId)
	{
		/*check if player currently in game*/
		
		$sql = sprintf("SELECT count(*)  FROM game_players WHERE PlayerId = %d AND GameId = %d",$userId, $gameId);									
		$result = RunSql($sql);
		$COUNT_NUMBER = $result->fetch_array(); 
		$count = $COUNT_NUMBER[0]; 
		/*if count == 0 then ip is in table*/
		if($count == 0)
		{
			return false;
		}
		else
		{
			return true;
		}	
	}
	/*Get list of items in a game */
	function GetActiveItems($gameId)
	{
		$sql = sprintf("SELECT * FROM game_items WHERE GameId = %d AND pickedUp = 0 AND Alive > 0;", $gameId);
		return RunSql($sql);
	}
	/*Get list of players in a game */
	function GetPlayersInGame($gameId,$userId)
	{
		$sql = sprintf("SELECT PlayerId , PlayerIcon , Lat ,Lng  from game_players WHERE GameId = %d  AND Alive = 1  AND PlayerId NOT IN (%d)", $gameId,$userId);
		return RunSql($sql);
	}
	
	/*Get players icon for game */
	function GetPlayerIcon($gameId,$userId)
	{
		$sql = sprintf("SELECT PlayerIcon from game_players WHERE GameId = %d AND PlayerId = %d", $gameId, $userId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		return $row['PlayerIcon'];
	}
	/*Update the players location */
	function UpdatePlayerLocation($gameId,$userId,$lat,$lng)
	{
		$sql = sprintf("UPDATE game_players SET Lat=%.16f, Lng=%.16f WHERE GameId=%d AND PlayerId = %d ", $lat,$lng, $gameId, $userId);
		RunSql($sql);
	}
	/*gets the players items associated with this game*/
	function GetPlayersItems($gameId,$userId)
	{
		
		$sql = sprintf("SELECT id , itemIdentifier, Name from game_items WHERE GameId = %d AND User = %d AND Alive = 1 AND PickedUp = 1 ", $gameId, $userId);
		return RunSql($sql);
	}
	/*Gets the players gold assocaited with this game*/
	function GetPlayersGold($gameId,$userId)
	{
		
		$sql = sprintf("SELECT Gold FROM game_players WHERE GameId =%d AND PlayerId = %d", $gameId, $userId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		return $row['Gold'];
	}
	/*Sets the players gold assocaited with this game*/
	function SetPlayersGold($gameId,$userId, $value)
	{
		$sql = sprintf("UPDATE game_players SET Gold = %d WHERE GameId =%d AND PlayerId = %d",$value , $gameId, $userId);
		RunSql($sql);
	}
	/*Check if the user is in range of an item */
	function UserInRangeOfItem($gameId,$userId,$itemId)
	{
		/*Get items data from db*/
		$sql = sprintf("SELECT * FROM game_items WHERE id = %d", $itemId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		$itemLat = $row['Lat'];
		$itemLng = $row['Lng'];
		$itemRange = $row['PickUpRange'];
		/*Get users data from db*/
		$sql = sprintf("SELECT * FROM game_players WHERE PlayerId = %d and GameId = %d", $userId , $gameId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		$userLat = $row['Lat'];
		$userLng = $row['Lng'];
		if(DistanceBetween($itemLat,$itemLng,$userLat,$userLng) <= $itemRange)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	/*distance between to lat lng points in meters*/
	function DistanceBetween($itemLat,$itemLng,$userLat,$userLng)
	{
		$R = 6371000;/*approx radius of earth in meters*/
		$lat1 = deg2rad($itemLat);/*Convert to radians*/
		$lon1 = deg2rad($itemLng);/*Convert to radians*/
		$lat2 = deg2rad($userLat);/*Convert to radians*/
		$lon2 = deg2rad($userLng);/*Convert to radians*/
		$dlon = $lon2 - $lon1;
		$dlat = $lat2 - $lat1;
		$a = sin($dlat / 2) * sin($dlat / 2) + cos($lat1) * cos($lat2) * sin($dlon / 2) * sin($dlon / 2);
		$c = 2 * atan2(sqrt($a), sqrt(1 - $a));
		$distance = $R * $c;
		return $distance; /* returns distance in meters */
	}
	/* asigns the item with id $itemId to $userId and icreases plaers gold by itemsGold*/
	function AsignItemToPlayer($gameId,$userId,$itemId)
	{
		/*Assign*/
		$sql = sprintf("UPDATE game_items SET User = %d, PickedUp =1 Where id =%d", $userId, $itemId);
		RunSql($sql);	
		$itemGold = GetitemsGold($itemId);/*get items gold value*/
		$playersGold = GetPlayersGold($gameId,$userId);/*get the players gold value*/
		$newValue = $itemGold + $playersGold;/*add the items gold to the players gold*/
		SetPlayersGold($gameId,$userId, $newValue); /*sets the players new gold in db*/
	}
	/*gets the gold value of an item*/
	function GetitemsGold($itemId)
	{
		$sql = sprintf("SELECT Gold FROM game_items WHERE id =%d", $itemId);
		$result = RunSql($sql);
		$row = $result->fetch_assoc();
		return $row['Gold'];
	}

?>