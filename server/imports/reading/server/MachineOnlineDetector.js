import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

AGVMachineHandler.registerEventHandler({
  event: "register",
  callback: function(machineId, handler){
    Machines.markOnline({machineId});
  }
});

AGVMachineHandler.registerEventHandler({
  event: "unregister",
  callback: function(machineId, handler){
    Machines.markOffline({machineId});
  }
});
