import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';

let PING_INTERVAL = 1000;

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

  // For latency recording
  AGVMachineHandler.registerEventHandler({
    event: "connect",
    callback: function(machineId, handler){
      let intervalHandle = Meteor.setInterval(_ => {
        Machines.sendCommand(machineId, "p:"+(new Date().getTime()));
      }, PING_INTERVAL);
      let eventHandle = handler.on('key:p', value => {
        let latency = new Date().getTime() - value;
        Machines.setReading(machineId, 'latency', latency);
      });
      handler.on('close', _ => {

      })
    }
  })
}
