import Machines from '../Machines';
import CommandQueues from '../CommandQueues';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

Machines.sendCommand = function(machineId, command, droppable){
  if(droppable === undefined){
    droppable = false;
  }

  let queue = CommandQueues.getForMachine(machineId, { _id: 1 });

  if(Settings.bypassCommandQueue && Settings.machine_interface_server){
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
