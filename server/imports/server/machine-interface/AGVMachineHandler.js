
import running from 'is-running';
import { EventEmitter } from 'events';
import util from 'util';
import Machines from '../../models/Machines';
import MessageLogs from '../../models/MessageLogs';

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

// A list of event registration
// The format of object is {
//  event: "Event name",
//  callback: Thecallback
// }
var eventRegistrations = [];

// Handle ,achine messagings and online presence
var AGVMachineHandler = class AGVMachineHandler extends EventEmitter{
  constructor(driver){
    super();
    bindAllFunction(this);
    this.driver = driver;
    this.machineObj = undefined;
    this.queueHandler = undefined;

    this.bindRegisteredEvent();
  }

  bindRegisteredEvent(){
    eventRegistrations.forEach(ev => {
      this.on(ev.event, ev.callback);
    });
  }

  unBindRegisteredEvent(){
    eventRegistrations.forEach(ev => {
      this.removeListener(ev.event, ev.callback);
    });
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
    this.emit("key:"+key, value, this.machineObj);
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
    this.unBindRegisteredEvent();
  }

}

AGVMachineHandler.registerEventHandler = function(evObj){
  eventRegistrations.push(evObj);
};

function bindAllFunction(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};

export default AGVMachineHandler;
