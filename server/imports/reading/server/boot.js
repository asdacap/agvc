import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

// Hook machine interface to listen for reading update
if(Meteor.isServer){
  Readings.availableReadings.forEach(function(reading){
    function callback(value, machineObj){
      if(machineObj === undefined) return;
      if(Readings.readingType[reading] == Boolean){
        value = parseInt(value, 0);
        if(value){
          value = true;
        }else{
          value = false;
        }
      }
      Machines.setReading(machineObj.machineId, reading, value);
    }
    AGVMachineHandler.registerEventHandler({
      event: "key:"+reading,
      callback: callback
    });
  });
}
