import Readings from './Readings';
import AGVMachineHandler from '../server/machine-interface/AGVMachineHandler';

// Hook machine interface to listen for reading update
if(Meteor.isServer){
  Readings.availableReadings.forEach(function(reading){
    function callback(value, machineObj){
      if(machineObj === undefined) return;
      Machines.setReading(machineObj.machineId, reading, value);
    }
    AGVMachineHandler.registerEventHandler({
      event: "key:"+reading,
      callback: callback
    });
  });
}
