from tornado import websocket, web, ioloop, httpserver
import uuid
import hashlib
import tornado
import json
import MyUtils




config = {'DB_HOST' : 'localhost','DB_USER' : 'liveQuestServer' , 'DB_PASSWD' : '*******', 'DB' : 'livequest'}
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
			SQL = '''INSERT INTO games (GameName , GameEndTime, HostId) VALUES ( "%s" , "%s",%i)'''% (data["GameName"], data["EndTime"], userID[0])
			cursor.execute(SQL)
		print("Added to Games table")
		print("Getting game id")
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT id FROM games WHERE GameName ="%s" and HostId = %i LIMIT 1'''% (data["GameName"], userID[0])
			cursor.execute(SQL)
			gameID = cursor.fetchone()
		print("GameID : ", gameID[0])
		message["GAMECREATEDSUCCESS"] = gameID[0]
		sendToPlayer(connection,message)
	else:
		print("Warning unsafe characters recieved : message " ,data)
		message["ERROR"] = "INVALIDCHARSNEWGAME"
		sendToPlayer(connection,message)


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

	
