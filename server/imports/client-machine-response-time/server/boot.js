import ClientMachinePing from '../ClientMachinePing';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import Machines from '../../machine/Machines';

Meteor.methods({
  clientMachinePing(machineId, timestamp){
    Machines.sendCommand(machineId, "cP:"+timestamp.getTime()+"-"+this.connection.id, true);
  },
  pingAck(_id){
    ClientMachinePing.remove(_id);
  }
});

// If the ping is found, record it and hopefully, the client will get it
AGVMachineHandler.registerEventHandler({
  event: "key:cP",
  callback: function(value, machineObj){
    let splitted = value.split("-");
    let timestamp = parseInt(splitted[0], 0);
    let connectionId = splitted[1];
    ClientMachinePing.insert({
      connectionId,
      timestamp,
      machineId: machineObj.machineId
    });
  }
});
