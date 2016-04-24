import Machines from '../Machines';
import CommandQueues from '../CommandQueues';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

Machines.sendCommand = function(machineId, command, droppable){
  if(droppable === undefined){
    droppable = false;
  }

  let queue = CommandQueues.getForMachine(machineId);

  if(Settings.bypassCommandQueue && Settings.master){
    if(AGVMachineHandler.sendMessage(machineId, command)){
      return;
    }
  }

  CommandQueues.update(queue._id, { $push: { commandQueue: {
    command: command,
    droppable: droppable,
    createdAt: new Date()
  } } } );
}
