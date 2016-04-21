import Machines from '../Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

Machines.sendCommand = function(machineId, command, droppable){
  if(droppable === undefined){
    droppable = false;
  }
  var machine = Machines.findOne({machineId: machineId});

  if(Settings.bypassCommandQueue && Settings.master){
    if(AGVMachineHandler.sendMessage(command)){
      return;
    }
  }

  Machines.update(machine._id, { $push: { commandQueue: {
    command: command,
    droppable: droppable,
    createdAt: new Date()
  } } } );
}
