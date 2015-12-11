from tornado import websocket, web, ioloop, httpserver
import uuid
import hashlib
import tornado
import json
import MyUtils




config = {'DB_HOST' : 'localhost','DB_USER' : 'liveQuestServer' , 'DB_PASSWD' : '****', 'DB' : 'livequest'}
connections = {}


#Extends the tornado websocket handler
class WSHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self,origin):
		return True

	def open(self):
		message = {}
		print("Websocket opened")
		print( self.request.remote_ip)
		print (len(connections))
		connections[self.request.remote_ip] = self
		print("Cheking if ip alreading  associated with user in connections table")
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT COUNT(*) FROM Connections WHERE IpKey ="%s"'''% (self.request.remote_ip)
			cursor.execute(SQL)
			connectionCount = cursor.fetchone()
		if connectionCount[0] > 0:
			print("Ip alreading  associated with user in connections table")
			message["SIGNEDIN"] = "SIGNEDIN"
			sendToPlayer(self,message)
		else:
			print("Ip not already assigned with user")
			message["SIGNEDIN"] = "NOTSIGNEDIN"
			sendToPlayer(self,message)

	def on_message(self, message):
		#print(message)
		if self.request.remote_ip in connections:
			data = json.loads(message)
			if 'SignIn' in data.keys():
				SignIn(self,data["SignIn"])
			if 'SignUp' in data.keys():
				SignUp(self,data["SignUp"])
			if 'LOGOUT' in data.keys():
				LogOut(self)
			if 'CREATENEWGAME' in data.keys():
				CreateNewGame(self, data["CREATENEWGAME"])
			if 'ITEMLOCATIONS' in data.keys():
				GetItemLocations(self, data["ITEMLOCATIONS"])
			if 'GETGAMES' in data.keys():
				GetAllGames(self, data["GETGAMES"])
	def on_close(self):
		print("Websocket closed")
		print( self.request.remote_ip)
		del connections[self.request.remote_ip]
		print("remaining connections : ",connections)
		#TODO remove connection from connections table in db (maybe no need)

def sendToAll(message):
	json.dumps(message)
	for key in connections:
		connections[key].write_message(message)

def sendToPlayer(connection,message):
	print("Sending : ", message, " to :", connection.request.remote_ip)
	json.dumps(message)
	connection.write_message(message)


def sendToAllButPlayer(self,message):
	json.dumps(message)
	for key in connections:
		if key != self.request.remote_ip:
			connections[key].write_message(message)

def SignIn(connection,data):
	print("User signing in : ",data["userName"])
	#check that the character are safe before executing the mysql command
	message = {}
	if validateCharacter(data["userName"]) and validateCharacter(data["password"]):
		#Check if the user exists
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT COUNT(*) FROM Users WHERE userName ="%s"'''% (data["userName"])
			cursor.execute(SQL)
			the_data = cursor.fetchone()
		if the_data[0] == 1:
			print("This UserName exists ")
			#Check Get User details from db and check if password matches
			with MyUtils.UseDatabase(config) as cursor:		
				SQL = '''SELECT * FROM Users WHERE userName ="%s"'''% (data["userName"])
				cursor.execute(SQL)
				the_data = cursor.fetchone()
			print("User ID ; ",the_data[0])
			print("Checking Password")
			if check_password(the_data[2],data["password"]):
				print("Password Correct")
				#TODO send back sign in message and a session id
				print("add user connection to db")
				print("Cheking if user alreading in table")
				with MyUtils.UseDatabase(config) as cursor:		
					SQL = '''SELECT COUNT(*) FROM Connections WHERE userID =%i'''% (the_data[0])
					cursor.execute(SQL)
					connectionCount = cursor.fetchone()
				if connectionCount[0] == 0:
					print("User not in Connection table, adding to table")
					with MyUtils.UseDatabase(config) as cursor:	
						SQL = '''INSERT INTO Connections (userID , IpKey) VALUES ( %i , "%s")'''% (the_data[0], connection.request.remote_ip)
						cursor.execute(SQL)
					print("Added to Connection table")
				else:
					print("User in Connection table, updating IpKey")
					with MyUtils.UseDatabase(config) as cursor:	
						SQL = '''UPDATE Connections SET IpKey= "%s" WHERE userID= %i;'''% (connection.request.remote_ip,the_data[0])
						cursor.execute(SQL)
					print("Connection table updated")
				message["SIGNINSUCCEED"] = True
				sendToPlayer(connection,message)
			else:
				print("Incorrect password")	
				message["ERROR"] = "INVALIDPASSWORD"
				sendToPlayer(connection,message)
		else:
			print("UserName was not in database")
			message["ERROR"] = "INVALIDUSERNAME"
			sendToPlayer(connection,message)
	else:
		print("Warning unsafe characters recieved : message " ,data)
		message["ERROR"] = "INVALIDCHARSSIGNIN"
		sendToPlayer(connection,message)
		

def SignUp(connection,data):
	message = {}
	print("New User Signing up UserName =" ,data["userName"])
	if validateCharacter(data["userName"]) and validateCharacter(data["password"]) and validateCharacter(data["Email"]):
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT COUNT(*) FROM Users WHERE userName ="%s"'''% (data["userName"])
			cursor.execute(SQL)
			the_data = cursor.fetchone()
		if the_data[0] == 0:
			print("This UserName is available , creating new user in db")
			hashP= hash_password(data["password"])
			with MyUtils.UseDatabase(config) as cursor:		
				SQL = '''INSERT INTO Users (userName , password, email) VALUES ( "%s" , "%s", "%s")'''% (data["userName"], hashP,data["Email"])
				cursor.execute(SQL)
			print("User creataion success")
			print("add user connection to db")
			print("Cheking if user alreading in table")
			with MyUtils.UseDatabase(config) as cursor:		
				SQL = '''SELECT COUNT(*) FROM Connections WHERE userID =%i'''% (the_data[0])
				cursor.execute(SQL)
				connectionCount = cursor.fetchone()
			if connectionCount[0] == 0:
				print("User not in Connection table, adding to table")
				with MyUtils.UseDatabase(config) as cursor:		
					SQL = '''SELECT id FROM Users WHERE username ="%s"'''% (data["userName"])
					cursor.execute(SQL)
					userId = cursor.fetchone()
				with MyUtils.UseDatabase(config) as cursor:	
					SQL = '''INSERT INTO Connections (userID , IpKey) VALUES ( %i , "%s")'''% (userId[0] , connection.request.remote_ip)
					cursor.execute(SQL)
				print("Added to Connection table")
			else:
				print("User in Connection table, updating IpKey")
				with MyUtils.UseDatabase(config) as cursor:	
					SQL = '''UPDATE Connections SET IpKey= "%s" WHERE userID= %i;'''% (connection.request.remote_ip,the_data[0])
					cursor.execute(SQL)
				print("Connection table updated")
			message["SIGNINSUCCEED"] = True
			sendToPlayer(connection,message)
		else:
			print("User already exits in db, cannot create new user")
			message["ERROR"] = "INVALIDUSERNAMETAKEN"
			sendToPlayer(connection,message)
	else:
		print("Warning unsafe characters recieved : message " ,data)
		message["ERROR"] = "INVALIDCHARSSIGNUP"
		sendToPlayer(connection,message)

def LogOut(connection):
	message = {}
	print("Logging out user :", connection.request.remote_ip)
	print("Cheking if ip is associated with user in connections table")
	with MyUtils.UseDatabase(config) as cursor:
		SQL = '''DELETE FROM Connections WHERE IpKey = "%s";'''% (connection.request.remote_ip)
		cursor.execute(SQL)
	print("User Logged Out assigned with user")
	message["LOGGEDOUT"] = True
	sendToPlayer(connection,message)

def CreateNewGame(connection, data):
	message = {}
	print("Atempting to create new game ")
	print("Validating characters data")
	if validateCharacter(data["GameName"]) and validateCharacter(data["EndTime"]):
		print("characters valid")
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT userID FROM Connections WHERE IpKey ="%s"'''% (connection.request.remote_ip)
			cursor.execute(SQL)
			userID = cursor.fetchone()
		print("Creating game in db")
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''INSERT INTO games (GameName , GameEndTime, HostId, active) VALUES ( "%s" , "%s",%i, 1)'''% (data["GameName"], data["EndTime"], userID[0])
			cursor.execute(SQL)
		print("Added to Games table")
		print("Getting game id")
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT id FROM games WHERE GameName ="%s" and HostId = %i LIMIT 1'''% (data["GameName"], userID[0])
			cursor.execute(SQL)
			gameID = cursor.fetchone()
		print("GameID : ", gameID[0])
		placedItems = data["placedItems"]
		for item in  placedItems:
			it = placedItems[item]
			print("Adding Item : ", it )
			with MyUtils.UseDatabase(config) as cursor:	
				SQL = '''INSERT INTO Game_Items (GameId, ItemIdentifier , Name, Gold ,PickUpRange ,Lat ,Lng ,PickedUp ,Alive) 
											VALUES ( %i, %i , "%s",%i , %i, %.20f , %.20f , 0, 1)'''% (gameID[0], it["Item"], it["Name"], it["Gold"], it["Range"], it["Lat"], it["Lng"])
				cursor.execute(SQL)
		message["GAMECREATEDSUCCESS"] = gameID[0]
		sendToPlayer(connection,message)
	else:
		print("Warning unsafe characters recieved : message " ,data)
		message["ERROR"] = "INVALIDCHARSNEWGAME"
		sendToPlayer(connection,message)

def GetItemLocations(connection, data):
	message = {}
	gameId = data["GameId"]
	with MyUtils.UseDatabase(config) as cursor:		
		SQL = '''SELECT * FROM Game_Items WHERE GameId = %i AND pickedUp = 0 AND Alive > 0;'''% (gameId)
		cursor.execute(SQL)
		result = cursor.fetchall()
	message["ITEMSFOUND"] = result
	sendToPlayer(connection,message)

def GetAllGames(connection, data):
	DeActivateOldGames()
	print("Getting all games for : ",connection.request.remote_ip)
	message = {}
	print("Getting userId ")
	with MyUtils.UseDatabase(config) as cursor:		
		SQL = '''SELECT userID FROM Connections WHERE IpKey ="%s"'''% (connection.request.remote_ip)
		cursor.execute(SQL)
		userID = cursor.fetchone()
	print("Getting active games hosted by user : ", userID[0])
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT id ,GameName, GameEndTime FROM games WHERE  HostId = %i AND active = 1 AND GameEndTime > now()'''% (userID[0])
		cursor.execute(SQL)
		tempHostGames = cursor.fetchall()
	hostGames = []
	for game in  tempHostGames:
		temp = {"id" : game[0], "name" : game[1], "time" : game[2].strftime("%I:%M%p on %B %d, %Y")}
		print(temp)
		hostGames.append(temp)
	print("Getting all active games")
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT id ,GameName, GameEndTime, HostId FROM games WHERE active = 1 AND GameEndTime > now()'''
		cursor.execute(SQL)
		tempAllGames = cursor.fetchall()
	allGames = []
	for game in  tempAllGames:
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''SELECT userName FROM users WHERE id = %i'''% (game[3])
			print(SQL)
			cursor.execute(SQL)
			hostName = cursor.fetchone()
		temp = {"id" : game[0], "name" : game[1], "time" : game[2].strftime("%I:%M%p on %B %d, %Y"),"host":hostName[0]}
		print(temp)
		allGames.append(temp)
	message["GAMESLIST"] = {"myHostedGames" : hostGames, "availableGames" : allGames,}
	sendToPlayer(connection,message)


def DeActivateOldGames():
	print("Checking for expired Games that are still marked as active")
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT id  FROM games WHERE active = 1 AND GameEndTime < now()'''
		cursor.execute(SQL)
		expiredGames = cursor.fetchall()
	print("expired Games : ", expiredGames)
	for game in expiredGames:
		print("Deactivating game : ", game[0])
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''UPDATE games SET active=0 WHERE id=%i'''% (game[0])
			cursor.execute(SQL)


#validate the data the ensure character which could allow users to modify mysql database are not present 
def validateCharacter(val):
	if ";" in val:
		return False
	elif "'" in val:
		return False
	elif '"' in val:
		return False
	else:
		return True

def hash_password(password):
    # uuid is used to generate a random number
    salt = uuid.uuid4().hex
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt
    
def check_password(hashed_password, user_password):
    password, salt = hashed_password.split(':')
    return password == hashlib.sha256(salt.encode() + user_password.encode()).hexdigest()	


app = tornado.web.Application([
	(r'/test', WSHandler),
	])

if __name__ == '__main__':
	#what is 8080?
	app.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

	
