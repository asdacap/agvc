
import running from 'is-running';
import { EventEmitter } from 'events';
import util from 'util';
import Machines from '../../machine/Machines';
import MessageLogs from '../../message-log/MessageLogs';
import Settings from '../../Settings';

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
    this.incomingQueue = []; // Pending incoming message when its not registered

    this.driver.sendMessage("identify"); // Tell it to indentify itself
    this.dataSeq = 0; // Used for the timeout timer
    this.closed = false; // So that it won't close twice

    this.emit("connect"); // Its connected
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
    this.dataSeq = this.dataSeq+1;
    this.checkDataSequenceTimeout(this.dataSeq);
    console.log("Got data "+data);

    if(data == "") return;

    // Record into message logs
    if(this.machineObj === undefined){
      MessageLogs.insert({ text: data });
    }else{
      MessageLogs.insert({ text: data, fromMachineId: this.machineObj.machineId });
    }

    if(this.machineObj === undefined){
      // If it is not registered...
      let keyValueMatch = data.match(/([^:]+):([^:]+)/);
      if(keyValueMatch !== null && keyValueMatch[1] == "machineId"){ // Its a registration
        this.onKeyValueMatch(keyValueMatch[1], keyValueMatch[2]);

        if(this.machineObj !== undefined){
          // Its registered. Cool, here are your messages...
          this.incomingQueue.forEach(dat => this.onData(dat));
          this.incomingQueue = [];
        }else{
          // Still not registered?
          this.incomingQueue.push(data);
        }
      }else{
        this.incomingQueue.push(data);
        this.driver.sendMessage("identify"); // Please tell me who are you...
      }
    }else{
      let keyValueMatch = data.match(/([^:]+):([^:]+)/);
      if(keyValueMatch !== null){
        this.onKeyValueMatch(keyValueMatch[1], keyValueMatch[2]);
      }
      this.emit("dataReceived", data, this.machineObj.machineId, this);
    }

  }

  // This check if no data was sent within 10000 milisecond, that means it has been disconnected.
  checkDataSequenceTimeout(seq){
    let self = this;
    setTimeout(function(){
      if(seq == self.dataSeq){ // After all this time. Still the same packet?
        self.close();
      }
    }, Settings.data_sequence_timeout);
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
      if(machinesConnection[machineId] === this){
        // Already registered. Don't register again
        return;
      }
      console.warn("Another registered connection exist. Closing...");
      machinesConnection[machineId].close();
    }

    this.machineObj = Machines.findOne({ machineId: machineId });
    if(this.machineObj === undefined){
      console.warn("Failed to find machine with id "+machineId);
      return;
    }

    console.log("Registering connection for machine "+machineId);
    machinesConnection[machineId] = this;

    this.startCommandQueueObservation();
    this.emit('register', this.machineObj.machineId, this);
  }

  // This is where it listen to new command from the machine commandQueue
  startCommandQueueObservation(){
    this.queueHandler = Machines.find({ machineId: this.machineObj.machineId }, {}).observe({
      changed: this.onMachineChanged
    });

    // Send previous command.
    this.onMachineChanged(this.machineObj);
  }

  sendMessage(message){
    this.driver.sendMessage(message);
  }
  // Listen to new command from the commandQueue on the machine object
  onMachineChanged(newDocument, oldDocument){
    var self = this;
    if(newDocument.commandQueue.length === 0) return;
    var commands = newDocument.commandQueue;
    Machines.update(this.machineObj._id, { $set: { commandQueue: [] } });

    commands.forEach(function(command){
      if(command.droppable && (new Date() - command.createdAt) > Settings.dropppable_command_timeout){
        console.log("Droppable command "+command.command+" dropped");
        return;
      }
      //console.log("send data "+command.command);
      self.sendMessage(command.command);
      self.emit("commandSent", command.command, self.machineObj.machineId, this);
    });
  }

  close(){
    if(this.closed) return;
    this.driver.close();
  }

  onClose(){
    if(this.closed) return;
    this.closed = true;
    console.log("Closing connection");
    if(this.machineObj !== undefined){
      if(this.queueHandler !== undefined){
        this.queueHandler.stop();
      }
      machinesConnection[this.machineObj.machineId] = undefined;
      this.emit("unregister", this.machineObj.machineId, this);
      this.machineObj = undefined;
    }
    this.emit("disconnect");
    this.unBindRegisteredEvent();
  }

}

AGVMachineHandler.registerEventHandler = function(evObj){
  eventRegistrations.push(evObj);
};

AGVMachineHandler.sendMessage = function(machineId, message){
  if(machinesConnection[machineId] !== undefined){
    machinesConnection[machineId].sendMessage(message);
    return true;
  }
  return false;
}

let startOfflineSweeper = function(){
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
}

function bindAllFunction(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};

export default AGVMachineHandler;
export { startOfflineSweeper };
