from tornado import websocket, web, ioloop, httpserver
import uuid
import hashlib
import tornado
import json
import MyUtils




config = {'DB_HOST' : 'localhost','DB_USER' : 'liveQuestServer' , 'DB_PASSWD' : '**********', 'DB' : 'livequest'}
connections = {}
playersReady = {}




#Extends the tornado websocket handler
class WSHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self,origin):
		return True

	def open(self):
		print("Websocket opened")
		print( self.request.remote_ip)
		
		connections[self.request.remote_ip] = self
		print (len(connections))

	def on_message(self, message):
		#print(message)
		if self.request.remote_ip in connections:
			data = json.loads(message)
			if 'SignIn' in data.keys():
				SignIn(data["SignIn"])
			if 'SignUp' in data.keys():
				SignUp(data["SignUp"])
		

def sendToAll(message):
	json.dumps(message)
	for key in connections:
		connections[key].write_message(message)

def sendToPlayer(connection,message):
	json.dumps(message)
	connection.write_message(message)


def sendToAllButPlayer(self,message):
	json.dumps(message)
	for key in connections:
		if key != self.request.remote_ip:
			connections[key].write_message(message)

def SignIn(data):
	print("User signing in : ",data["userName"])
	if validateCharacter(data["userName"]) and validateCharacter(data["password"]):
		with MyUtils.UseDatabase(config) as cursor:		
			SQL = '''SELECT COUNT(*) FROM Users WHERE userName ="%s"'''% (data["userName"])
			cursor.execute(SQL)
			the_data = cursor.fetchone()
		if the_data[0] == 1:
			print("This UserName exists ")
			with MyUtils.UseDatabase(config) as cursor:		
				SQL = '''SELECT * FROM Users WHERE userName ="%s"'''% (data["userName"])
				cursor.execute(SQL)
				the_data = cursor.fetchone()
			print("User ID ; ",the_data[0])
			print("Checking Password")
			if check_password(the_data[2],data["password"]):
				print("Password Correct")
			else:
				print("Incorrect password")
		else:
			print("UserName was not in database")
	else:
		print("Warning unsafe characters recieved : message " ,data)
		#TODOsend message back to user saying signUp falied 
		

def SignUp(data):
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
		else:
			print("User already exits in db, cannot create new user")
			#TODO add return call here to send message back to client indicating username already exists 
	else:
		print("Warning unsafe characters recieved : message " ,data)
		#TODOsend message back to user saying signUp falied 

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

	
