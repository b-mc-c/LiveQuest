/* check if user is already signed in*/
$.ajax({
	url: '../Server/CheckSignedIn.php',
	type: 'Get',
	async: false,
    success: function(data) {
		data = JSON.parse(data);
		Receive(data);
	}
});