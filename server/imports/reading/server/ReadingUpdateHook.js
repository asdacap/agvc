import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

console.log("Registering callback");

Readings.availableReadings.forEach(function(reading){
  function callback(value, machineObj){
    console.log("Callback on value "+value);
    if(machineObj === undefined) return;
    if(Readings.meta[reading].type == Boolean){
      value = parseInt(value, 0);
      if(value){
        value = true;
      }else{
        value = false;
      }
    }else if(Readings.meta[reading].type == Number){
      value = parseInt(value, 0);
    }

    if(Readings.meta[reading].transformer !== undefined){
      value = Readings.meta[reading].transformer(value);
    }
    Machines.setReading(machineObj.machineId, reading, value);
  }
  AGVMachineHandler.registerEventHandler({
    event: "key:"+reading,
    callback: callback
  });
});
