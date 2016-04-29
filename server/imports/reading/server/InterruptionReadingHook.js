
import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import LocationLogs from '../../location/LocationLogs';
import Map from '../../location/Map';

// I such event were to happen, log the current time to
// the last locationLOgs
function callback(value, machineObj){
  let newMachine = Machines.findOne(machineObj._id);
  let lastLog = newMachine.lastLocationLog;
  if(lastLog === undefined){
     return;
  }
  if(lastLog.firstInterruption === undefined){
    LocationLogs.update({ _id: lastLog._id }, { $set: { firstInterruption: new Date() } });

    lastLog.firstInterruption = new Date();
    Machines.update({ _id: machineObj._id }, { $set: { lastLocationLog: lastLog } });
  }
}

AGVMachineHandler.registerEventHandler({
  event: "key:obstructed",
  callback: callback
});

AGVMachineHandler.registerEventHandler({
  event: "key:outOfCircuit",
  callback: callback
});

AGVMachineHandler.registerEventHandler({
  event: "key:manualMode",
  callback: callback
});
