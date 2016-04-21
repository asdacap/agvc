import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import Settings from '../../Settings';

// For bandwidth recording
AGVMachineHandler.registerEventHandler({
  event: "register",
  callback: function(machineId, handler){

    let totalSentData = 0;
    let totalReceivedData = 0;
    let startMeasurementAt = 0;

    let intervalHandle = Meteor.setInterval(_ => {
      if(startMeasurementAt != 0){
        let duration = new Date().getTime() - startMeasurementAt;
        if(duration <= 0) duration = 1;
        duration = duration / 1000;
        let sentDataRate = totalSentData/duration;
        if(isNaN(sentDataRate)){
          console.warn("sent data rate is NaN");
          sentDataRate = 0;
        }
        let receivedDataRate = totalReceivedData/duration;
        if(isNaN(receivedDataRate)){
          console.warn("received data rate is NaN");
          receivedDataRate = 0;
        }
        Machines.setReading(machineId, 'sentDataRate', sentDataRate);
        Machines.setReading(machineId, 'receivedDataRate', receivedDataRate);
      }
      totalSentData = 0;
      totalReceivedData = 0;
      startMeasurementAt = new Date().getTime();
    }, Settings.bandwidth_record_interval);

    let onCommandSent = command => {
      // 1 for newline
      totalSentData = totalSentData + command.length + 1;
    };

    let onDataReceived = data => {
      // 1 for newline
      totalReceivedData = totalReceivedData + data.length + 1;
    };

    handler.on('dataReceived', onDataReceived);
    handler.on('commandSent', onCommandSent);

    handler.once("unregister", _ => {
      Meteor.clearInterval(intervalHandle);
      handler.removeListener('dataReceived', onDataReceived);
      handler.removeListener('commandSent', onCommandSent);
      // There should be nothing more
      Machines.setReading(machineId, 'sentDataRate', 0);
      Machines.setReading(machineId, 'receivedDataRate', 0);
    })
  }
})
