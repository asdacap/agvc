/*
var WebSocketServer = Meteor.npmRequire('websocket').server;

var wsServer = new WebSocketServer({
  httpServer: WebApp.httpServer
});

wsServer.on('request', function(request){
  console.log("Connection");

  console.log(request);

  var connection = request.accept('echo-protocol', request.origin);

  connection.on('message',function(message){
    console.log("Got message "+message);
  });
});
*/

var websocket = Meteor.npmRequire('websocket-driver');

var ROBOT_WEBSOCKET_PATH = '/robot_websocket'

// Override default upgrade handler. If path is ROBOT_WEBSOCKET_PATH, then
// Initiate handling. If not, then call the old handler
var server = WebApp.httpServer;
var oldUpgrades = server.listeners('upgrade');

server.on('upgrade', function(request, socket, body){
  if(request.url == ROBOT_WEBSOCKET_PATH){
    if(!websocket.isWebSocket(request)){
      return;
    }

    var driver = websocket.http(request);
    socket.pipe(driver.io).pipe(socket);
    handleWebsocketConnection(driver);
    driver.start();
  }else{
    var args = arguments;
    oldUpgrades.forEach(function(handler){
      handler.apply(server, args);
    });
  }
});

// Where application logic resides
var handleWebsocketConnection = Meteor.bindEnvironment(function(driver){
  driver.messages.on('data',Meteor.bindEnvironment(function(data){
    MessageLogs.insert({ text: data });
  }));
});

WebApp.connectHandlers.use(function(req,res,next){
  console.log("New connection");
  next();
});
