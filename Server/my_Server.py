from tornado import websocket, web, ioloop, httpserver
from math import sin, cos, sqrt, atan2, radians
import uuid
import hashlib
import tornado
import json
import MyUtils




config = {'DB_HOST' : 'localhost','DB_USER' : 'liveQuestServer' , 'DB_PASSWD' : 'LiveQuestServerXneon&5255', 'DB' : 'livequest'}
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
			if 'ADDPLAYERTOGAME' in data.keys():
				AddPlayerToGame(self,data['ADDPLAYERTOGAME'])
			if 'PLAYERICON' in data.keys():
				getPlayerIcon(self,data['PLAYERICON'])
			if 'PICKUPITEM' in data.keys():
				PickUpItem(self,data['PICKUPITEM'])
			if 'GETMYITEMS' in data.keys():
				GetMyItems(self, data['GETMYITEMS'])
			if 'GETMYGOLD' in data.keys():
				GetMyGold(self, data['GETMYGOLD'])
			if 'GETPLAYERSINGAME' in data.keys():
				GetplayersInGame(self, data["GETPLAYERSINGAME"])
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
		userID = GetUserId(connection)
		print("Creating game in db")
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''INSERT INTO games (GameName , GameEndTime, HostId, active) VALUES ( "%s" , "%s",%i, 1)'''% (data["GameName"], data["EndTime"], userID)
			cursor.execute(SQL)
		print("Added to Games table")
		print("Getting game id")
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT id FROM games WHERE GameName ="%s" and HostId = %i LIMIT 1'''% (data["GameName"], userID)
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
	userID = GetUserId(connection)
	print("Getting active games hosted by user : ", userID)
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT id ,GameName, GameEndTime FROM games WHERE  HostId = %i AND active = 1 AND GameEndTime > now()'''% (userID)
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

def PickUpItem(connection, data):
	message = {}
	userID = GetUserId(connection)
	gameId = int(data["GameId"])
	print("confrim User ",userID, " already in game ", gameId)
	if IsUserAlreadyInGame(userID, gameId) == True:
		print("User in game")
		print("Get item ", gameId ,"'s LatLong")
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''SELECT * FROM game_items WHERE id = %i'''% (data["Item"][0])
			print(SQL)
			cursor.execute(SQL)
			item = cursor.fetchone()
		dist = getdistBetween(float(data["playerLatLng"]["lat"]),float(data["playerLatLng"]["lng"]),float(item[6]),float(item[7]))
		print ("dist between is :", dist, "m Pickup range is " , int(item[5]) , "m" )
		if  dist <= int(item[5]):
			print("IN RANGE")
			with MyUtils.UseDatabase(config) as cursor:	
				SQL = '''UPDATE game_items SET User = %i, PickedUp =1 Where id =%i '''% (userID,data["Item"][0])
				print(SQL)
				cursor.execute(SQL)
			with MyUtils.UseDatabase(config) as cursor:	
				SQL = '''SELECT gold FROM game_items WHERE id =%i '''% (data["Item"][0])
				print(SQL)
				cursor.execute(SQL)
				gold = cursor.fetchone()[0]
			print("Adding ", gold ," pieces of gold to user" , userID )
			with MyUtils.UseDatabase(config) as cursor:	
				SQL = '''SELECT Gold FROM game_players WHERE GameId =%i AND PlayerId = %i'''% (gameId,userID)
				print(SQL)
				cursor.execute(SQL)
				currentGold = cursor.fetchone()[0]
			currentGold += gold
			with MyUtils.UseDatabase(config) as cursor:	
				SQL = '''UPDATE game_players SET Gold =%i WHERE GameId =%i AND PlayerId = %i'''% (currentGold,gameId,userID)
				print(SQL)
				cursor.execute(SQL)
			GetItemLocations(connection,data)#send back updated items list
			GetMyItems(connection, data)#sends back updated my items list 
			GetMyGold(connection, data)#send back the current gold
		else:
			print ("item was not in range ")

def GetMyGold(connection, data):
	message = {}
	userID = GetUserId(connection)
	gameId = int(data["GameId"])
	print("confrim User ",userID, " already in game ", gameId)
	if IsUserAlreadyInGame(userID, gameId) == True:
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''SELECT Gold FROM game_players WHERE GameId =%i AND PlayerId = %i'''% (gameId,userID)
			print(SQL)
			cursor.execute(SQL)
			currentGold = cursor.fetchone()[0]
		message["CurrentGold"] = {"Gold" : currentGold,} 
		sendToPlayer(connection,message)

def GetMyItems(connection, data):
	message = {}
	userID = GetUserId(connection)
	gameId = int(data["GameId"])
	if IsUserAlreadyInGame(userID, gameId) == True:
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''SELECT id , itemIdentifier, Name from Game_items WHERE GameId = %i AND User = %i AND Alive = 1 AND PickedUp = 1'''% (gameId, userID)
			cursor.execute(SQL)
			items = cursor.fetchall()
		message["MyItemsList"] = items
		sendToPlayer(connection,message)

def GetplayersInGame(connection, data):
	message = {}
	userID = GetUserId(connection)
	gameId = int(data["GameId"])
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT PlayerId , PlayerIcon , Lat ,Lng  from Game_players WHERE GameId = %i  AND Alive = 1  AND PlayerId NOT IN (%i)'''% (gameId, userID)
		cursor.execute(SQL)
		items = cursor.fetchall()
	message["PlayersInGame"] = items
	sendToPlayer(connection,message)

def AddPlayerToGame(connection,data):
	userID = GetUserId(connection)
	gameID = int(data["GameId"])
	playericonID = int(data["PlayerIconId"])
	if IsUserAlreadyInGame(userID, gameID) == False:
		print("Adding user" , userID , " to game ", data["GameId"])
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''INSERT INTO Game_players (GameId, PlayerId , Gold ,Lat ,Lng ,Alive,PlayerIcon) 
											VALUES ( %i, %i , 0 ,0 , 0, 1 ,%i)'''% (gameID, userID, playericonID)
			cursor.execute(SQL)
		print("Successfully added user" , userID , " to game ", data["GameId"])
	else:
		print("User" , userID , "already associated with game ", data["GameId"] , " : Do nothing" )


def getPlayerIcon(connection, data):
	message = {}
	userID = GetUserId(connection)
	gameId = int(data["GameId"])
	if IsUserAlreadyInGame(userID, gameId) == True:
		with MyUtils.UseDatabase(config) as cursor:	
			SQL = '''SELECT PlayerIcon from Game_players WHERE GameId = %i AND PlayerId = %i'''% (gameId, userID)
			cursor.execute(SQL)
			icon = cursor.fetchone()
		message["PLAYERICON"] = icon[0]
		sendToPlayer(connection,message)

def getdistBetween(lt1, ln1 , lt2 , ln2):
	#formula source http://stackoverflow.com/questions/19412462/getting-distance-between-two-points-based-on-latitude-longitude-python 
	# approximate radius of earth in km
	print ("lt1 : ",lt1 ,", ln1 :", ln1,", lt2 :", lt2,", ln2 :", ln2)
	# approximate radius of earth in m
	R = 6371000

	lat1 = radians(lt1)
	lon1 = radians(ln1)
	lat2 = radians(lt2)
	lon2 = radians(ln2)
	dlon = lon2 - lon1
	dlat = lat2 - lat1
	a = sin(dlat / 2) * sin(dlat / 2) + cos(lat1) * cos(lat2) * sin(dlon / 2) * sin(dlon / 2)
	c = 2 * atan2(sqrt(a), sqrt(1 - a))
	distance = R * c
	print ("Distance : ",distance ,"m")
	return distance; # returns distance in meters

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


def IsUserAlreadyInGame(userId,gameId):
	print("Checking if user" , userId , " is already associated with game ", gameId )
	with MyUtils.UseDatabase(config) as cursor:	
		SQL = '''SELECT count(*)  FROM Game_Players WHERE PlayerId = %i AND GameId = %i'''% (userId, gameId)
		cursor.execute(SQL)
		userCount = cursor.fetchone()
	if userCount[0] >= 1:
		return True;
	else:
		return False;


def GetUserId(connection):
	print("Getting userId ")
	with MyUtils.UseDatabase(config) as cursor:		
		SQL = '''SELECT userID FROM Connections WHERE IpKey ="%s"'''% (connection.request.remote_ip)
		cursor.execute(SQL)
		userID = cursor.fetchone()
	return userID[0]
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

	
