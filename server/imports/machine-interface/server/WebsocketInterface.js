
import AGVMachineHandler from './AGVMachineHandler'
import websocket from 'websocket-driver';

var ROBOT_WEBSOCKET_PATH = '/machine_websocket'

// Override default upgrade handler. If path is ROBOT_WEBSOCKET_PATH, then
// Initiate handling. If not, then call the old handler
var server = WebApp.httpServer;
var oldUpgrades = server.listeners('upgrade');

startMachineWebSocketListener = function(){
  server.on('upgrade', function(request, socket, body){
    if(request.url == ROBOT_WEBSOCKET_PATH){
      if(!websocket.isWebSocket(request)){
        return;
      }
      console.log("New Websocket connection");

      var driver = websocket.http(request);
      socket.pipe(driver.io).pipe(socket);
      handleWebsocketConnection(driver, socket);
      driver.start();
    }else{
      var args = arguments;
      oldUpgrades.forEach(function(handler){
        handler.apply(server, args);
      });
    }
  });
}

// Where application logic resides
var handleWebsocketConnection = Meteor.bindEnvironment(function(driver, socket){
  new WebSocketConnectionHandler(driver, socket);
});

function WebSocketConnectionHandler(driver, socket){
  this.driver = driver;
  this.socket = socket;
  this.machineHandler = new AGVMachineHandler(this);
  driver.messages.on('data', this.machineHandler.onData);
  socket.on('close', this.machineHandler.onClose);
}

_.extend(WebSocketConnectionHandler.prototype, {
  getName(){
    return 'websocket';
  },
  close(){
    this.socket.close();
  },
  sendMessage(message){
    this.driver.write(message);
  }
});

export { startMachineWebSocketListener };
