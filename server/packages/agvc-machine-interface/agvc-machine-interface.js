// Write your package code here!
var running = Npm.require('is-running')

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

// A mapping of machineId, driver and AGVMachineHandler
var machinesConnection = {};

// Handle ,achine messagings and online presence
AGVMachineHandler  = class{
  constructor(driver){
    bindAllFunction(this);
    this.driver = driver;
    this.machineObj = undefined;
    this.queueHandler = undefined;
  }

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
  }

  onKeyValueMatch(key, value){
    key = key.trim();
    value = value.trim();
    if(key === "machineId"){
      this.registerMachineId(value);
    }
    if(this.machineObj !== undefined){
      console.log("Key is "+key+" "+Readings.available_readings.indexOf(key)+" "+key.length);
      if(Readings.available_readings.indexOf(key) != -1){
        Readings.insert({ machineId: this.machineObj.machineId, type: key, reading: parseInt(value, 0) })
      }
    }
  }

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
  }

  onMachineChanged(newDocument, oldDocument){
    var self = this;
    if(newDocument.commandQueue.length === 0) return;
    var commands = newDocument.commandQueue;
    Machines.update(this.machineObj._id, { $set: { commandQueue: [] } });

    commands.forEach(function(command){
      if(command.droppable && (new Date() - command.createdAt) > 10000){
        console.log("Droppable command "+command.command+" dropped");
      }
      self.driver.sendMessage(command.command);
    });
  }

  onClose(){
    console.log("Closing connection");
    if(this.machineObj !== undefined){
      this.queueHandler.stop();
      Machines.markOffline(this.machineObj._id);
      machinesConnection[this.machineObj.machineId] = undefined;
    }
  }

}

function bindAllFunction(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};
