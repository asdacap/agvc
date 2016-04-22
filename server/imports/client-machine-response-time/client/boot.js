import Machines from '../../machine/Machines';
import ClientMachinePing from '../ClientMachinePing';
import ClientMachineResponseTime from './ClientMachineResponseTime';

// Every 1 second, send a ping to every arduino
let handle = Meteor.subscribe("machines");

let loop = Meteor.setInterval(function(){
  Machines.find({}).fetch().forEach(machine => {
    Meteor.call("clientMachinePing", machine.machineId, new Date());
  });
}, 1000);

// Listen to changes
Meteor.autorun(function(){
  Chronos.liveUpdate(5000);
  Meteor.subscribe("ClientMachinePing", Meteor.connection._lastSessionId);

  let query = ClientMachinePing.find({ connectionId: Meteor.connection._lastSessionId });
  query.fetch().forEach(processPing);

  query.observe({
    added(doc){
      processPing(doc);
    }
  });
});

function processPing(ping){
  let timestamp = ping.timestamp;
  Meteor.call("pingAck", ping._id);

  let responseTime = new Date().getTime() - timestamp;

  ClientMachineResponseTime.upsert({ machineId: ping.machineId }, {
    $set: {
      machineId: ping.machineId,
      responseTime: responseTime
    }
  });
}
