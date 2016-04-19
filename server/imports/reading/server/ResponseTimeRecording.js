import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import Settings from '../../Settings';

// For responseTime recording
AGVMachineHandler.registerEventHandler({
  event: "register",
  callback: function(machineId, handler){
    let intervalHandle = Meteor.setInterval(_ => {
      Machines.sendCommand(machineId, "p:"+(new Date().getTime()), true);
    }, Settings.ping_interval);
    let pingCallback = value => {
      let responseTime = new Date().getTime() - value;
      Machines.setReading(machineId, 'responseTime', responseTime);
    };
    let eventHandle = handler.on('key:p', pingCallback);
    handler.once("unregister", _ => {
      Meteor.clearInterval(intervalHandle);
      handler.removeListener('key:p', pingCallback);
    })
  }
})
