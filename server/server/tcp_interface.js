
// Plans for TCP is scrapped in favour of websocket

var net = Meteor.npmRequire('net');
var split = Meteor.npmRequire('split');

// Handle listening to port
var TCPListener = function(){
  this.server = net.Server();
  this.server.on('connection',Meteor.bindEnvironment(_.bind(this.onConnect, this)));
}

_.extend(TCPListener.prototype,{
  start(){
    console.log("Starting tcp server on port "+Settings.tcp_listen_port+"...");
    this.server.listen(Settings.tcp_listen_port);
  },
  onConnect(socket){
    console.log("Incoming connection...");
    new SocketHandler(socket);
  }
});


// A mapping of machineId and socketHandler
var machinesConnection = {};

// Handle per-connection message
var SocketHandler = function(socket){
  bindAllFunction(this);
  this.socket = socket;
  this.socket.on('close', this.onClose);
  this.socket.on('error', this.onError);
  this.socket.on('data', function(data){
    console.log("raw data received "+data.toString());
  });
  this.splitted = this.socket.pipe(split());
  this.splitted.on('data',this.onData);

  this.machineObj = undefined;
  this.queueHandler = undefined;
}

_.extend(SocketHandler.prototype, {
  onData(data){
    console.log("Got data "+data);
    if(data == "") return;
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
      if(Readings.available_readings.indexOf(key) != -1){
        Readings.insert({ machineId: this.machineObj.machineId, type: key, reading: Integer.parse(value) })
      }
    }
  },
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

      console.log("Registering connection for machine "+machineId);
      machinesConnection[machineId] = this;

      Machines.markOnline(this.machineObj._id);

      this.queueHandler = Machines.find({ machineId: machineId }).observe({
        changed: this.onMachineChanged
      });

      // Send previous command.
      this.onMachineChanged(this.machineObj);
    }
  },
  onMachineChanged(newDocument, oldDocument){
    var self = this;
    if(newDocument.commandQueue.length === 0) return;
    var commands = newDocument.commandQueue;
    Machines.update(this.machineObj._id, { $set: { commandQueue: [] } });

    commands.forEach(function(command){
      if(command.droppable && (new Date() - command.createdAt) > 10000){
        console.log("Droppable command "+command.command+" dropped");
      }
      self.sendMessage(command.command);
    });
  },
  onClose(){
    console.log("Closing connection");
    if(this.machineObj !== undefined){
      this.queueHandler.stop();
      Machines.markOffline(this.machineObj._id);
      machinesConnection[this.machineObj.machineId] = undefined;
    }
  },
  onError(){
    console.log("connection error");
  },
  sendMessage(message){
    this.socket.write(message+"\n");
  }
});

function bindAllFunction(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};

Meteor.startup(function(){
  var listener = new TCPListener();
  listener.start();
});

var running = Meteor.npmRequire('is-running')

Meteor.setInterval(function(){
  // Every 5000 second, loop through machines whose online from this PID and make sure we are online.
  // Also cleanup machine whose pid is not running.
  // This assume the server cluster is on the same server.
  Machines.find({ online: true }).fetch().forEach(function(machine){
    if(!running(machine.onlineOnServer)){
      console.log("Cleanup not running pid "+machine.machineId);
      Machines.markOffline(machine._id);
    }else if(process.pid == machine.onlineOnServer && machinesConnection[machine.machineId] === undefined){
      console.log("Cleanup machinesConnection "+machine.machineId);
      Machines.markOffline(machine._id);
    }
  });
}, 5000);
