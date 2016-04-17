import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import Settings from '../../Settings';

if(Meteor.isServer){
  // Hook machine interface to listen for reading update
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

  // For latency recording
  AGVMachineHandler.registerEventHandler({
    event: "connect",
    callback: function(machineId, handler){
      let intervalHandle = Meteor.setInterval(_ => {
        Machines.sendCommand(machineId, "p:"+(new Date().getTime()), true);
      }, Settings.ping_interval);
      let pingCallback = value => {
        let latency = new Date().getTime() - value;
        Machines.setReading(machineId, 'latency', latency);
      };
      let eventHandle = handler.on('key:p', pingCallback);
      handler.once('close', _ => {
        Meteor.clearInterval(intervalHandle);
        handler.removeListener('key:p', pingCallback);
      })
    }
  })
}
