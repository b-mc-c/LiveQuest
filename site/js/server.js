//python -m SimpleHTTPServer 8000 

var game
var url = "ws://" + window.location.hostname + ":8080/test";
var ws = new WebSocket(url);




 ws.onopen = function()
{
	//message = {}
	//message["SignIn"] = {"userName" : "testName", "password": "testPass"};
	//ws.send(JSON.stringify(message));
}

ws.onmessage = function(event)
{
	console.log(event.data);
	data = JSON.parse(event.data);
	Receive(data);
}
