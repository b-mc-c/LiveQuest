from tornado import websocket, web, ioloop, httpserver
import tornado
import json
import MyUtils



config = {'DB_HOST' : 'localhost','DB_USER' : 'liveQuestServer' , 'DB_PASSWD' : '***', 'DB' : 'livequest'}
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
		print(message)
		if self.request.remote_ip in connections:
			data = json.loads(message)
			print(data)
			print('SignIn' in data.keys())
			if 'SignIn' in data.keys():
				SignIn(data["SignIn"])
				sendToAll(message)
			if 'SignUp' in data.keys():
				SignUp(data["SignUp"])
				sendToAll(message)

			

def sendToAll(message):
	json.dumps(message)
	for key in connections:
		connections[key].write_message(message)

def sendToAllButPlayer(self,message):
	json.dumps(message)
	for key in connections:
		if key != self.request.remote_ip:
			connections[key].write_message(message)

def SignIn(data):
	print("Signing in")
	print("UserName = ",data["userName"])
	print("Password = ",data["password"])

def SignUp(data):
	print("Signing up")
	print("UserName = ",data["userName"])
	print("Password = ",data["password"])
	with MyUtils.UseDatabase(config) as cursor:		
		SQL = '''INSERT INTO Users (UserName , Password, Email) VALUES ( "%s" , "%s", "%s")'''% (data["userName"], data["password"],data["Email"])
		cursor.execute(SQL)
			

app = tornado.web.Application([
	(r'/test', WSHandler),
	])

if __name__ == '__main__':
	#what is 8080?
	app.listen(8080)
	tornado.ioloop.IOLoop.instance().start()

	
