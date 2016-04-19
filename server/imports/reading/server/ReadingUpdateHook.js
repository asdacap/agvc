import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

Readings.availableReadings.forEach(function(reading){
  function callback(value, machineObj){
    if(machineObj === undefined) return;
    if(Readings.meta[reading].type == Boolean){
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
