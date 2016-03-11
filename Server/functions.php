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
	
?>