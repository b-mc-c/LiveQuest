<?php
	include 'functions.php';
	$message = array();/*message to be returned*/
	$gameId = $_POST['gameId'];											/*the game being played */
	$results = GetGameResults($gameId);
	while($r = $results->fetch_assoc()) 
	{
		$row = array();
		$row["Name"] = GetPlayersName($r["PlayerId"]);
		$row["Gold"] = $r["Gold"];
		$message['Results'][] = $row;
	}
	
	echo json_encode($message);/*return the message as ajson encoded object*/
?>