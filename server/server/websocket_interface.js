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

var ROBOT_WEBSOCKET_PATH = '/machine_websocket'

// Override default upgrade handler. If path is ROBOT_WEBSOCKET_PATH, then
// Initiate handling. If not, then call the old handler
var server = WebApp.httpServer;
var oldUpgrades = server.listeners('upgrade');

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

// A mapping of machineId and driver object
var machinesConnection = {};

function WebSocketConnectionHandler(driver, socket){
  this.driver = driver;
  this.socket = socket;
  this.machineObj = undefined;
  this.queueHandler = undefined;
  driver.messages.on('data', Meteor.bindEnvironment(_.bind(this.onData, this)));
  socket.on('close', Meteor.bindEnvironment(_.bind(this.onClose,this)));
}

_.extend(WebSocketConnectionHandler.prototype, {
  registerMachineId(machineId){
    if(machinesConnection[machineId] !== undefined){
      console.warn("Connection still exist for machineId "+machineId);
      return;
    }
    if(machinesConnection[machineId] === undefined){
      this.machineObj = Machines.findOne({ machineId: machineId });
      if(this.machineObj === undefined){
        console.warn("Failed to find machine with id "+machineId);
        return;
      }

      console.log("Registering connection");
      machinesConnection[machineId] = { driver: this.driver, socket: this.socket };

      Machines.markOnline(this.machineObj._id);

      this.queueHandler = Machines.find({ machineId: machineId }).observe({
        changed: Meteor.bindEnvironment(this.onMachineChanged)
      });

      // Send previous command.
      this.onMachineChanged(this.machineObj);
    }
  },
  onMachineChanged(newDocument, oldDocument){
    if(newDocument.commandQueue.length === 0) return;
    var commands = newDocument.commandQueue;
    Machines.update(this.machineObj._id, { $set: { commandQueue: [] } });

    commands.forEach(function(command){
      if(command.droppable && (new Date() - command.createdAt) > 10000){
        console.log("Droppable command "+command.command+" dropped");
      }
      this.driver.write(command.command);
    });
  },
  onData(data){
    console.log("Got data "+data);
    if(this.machineObj === undefined){
      MessageLogs.insert({ text: data });
    }else{
      MessageLogs.insert({ text: data, fromMachineId: this.machineObj.machineId });
    }

    var keyValueMatch = data.match(/([^:]+):([^:]+)/);
    if(keyValueMatch !== null){
        this.onKeyValueMatch(keyValueMatch[1], keyValueMatch[2]);
    }
  },
  onKeyValueMatch(key, value){
    if(key === "machineId"){
      this.registerMachineId(value);
    }
    if(this.machineObj !== undefined){
      if(AVAILABLE_READINGS.indexOf(key) != -1){
        Readings.insert({ machineId: this.machineObj.machineId, type: key, reading: Integer.parse(value) })
      }
    }
  },
  onClose(){
    console.log("Closing connection");
    if(this.machineObj !== undefined){
      this.queueHandler.stop();
      Machines.markOffline(this.machineObj._id);
      machinesConnection[this.machineObj.machineId] = undefined;
    }
  }
});

// Where application logic resides
var handleWebsocketConnection = Meteor.bindEnvironment(function(driver, socket){
  new WebSocketConnectionHandler(driver, socket);
});

var running = Meteor.npmRequire('is-running')

/*
Meteor.setInterval(function(){
  // Every 5000 second, loop through machines whose online from this PID and make sure we are online.
  // Also cleanup machine whose pid is not running.
  // This assume the server cluster is on the same server.
  Machines.find({ online: true }).fetch().forEach(function(machine){
    if(!running(machine.onlineOnServer)){
      console.log("Cleanup "+machine.machineId);
      Machines.markOffline(machine._id);
    }else if(process.pid == machine.onlineOnServer && machinesConnection[machine.machineId] === undefined){
      console.log("Cleanup "+machine.machineId);
      Machines.markOffline(machine._id);
    }
  });
}, 5000);

// Just a debugger
WebApp.connectHandlers.use(function(req,res,next){
  console.log("New connection");
  next();
});

*/
