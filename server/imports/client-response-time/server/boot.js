import Settings from '../../Settings';
import ClientResponseTimeLogs from '../ClientResponseTimeLogs';
import ClientResponseTimes from '../ClientResponseTimes';

// Periodically create a log that the client will have to send back
Meteor.onConnection(function(connection){
  console.log("Starting client point to client "+connection.id);
  // The thing that ping
  let intervalHandle = Meteor.setInterval(function(){
    ClientResponseTimeLogs.insert({ connectionId: connection.id });
  }, Settings.client_ping_interval);

  connection.onClose(_ => {
    Meteor.clearInterval(intervalHandle);
  });
});

Meteor.methods({
  responseTimeLogPing(logId){
    let connection = this.connection;

    let log = ClientResponseTimeLogs.findOne(logId);
    if(log === undefined) return;
    ClientResponseTimeLogs.remove(logId);

    let duration = new Date().getTime() - log.createdAt.getTime();

    let responseTime = ClientResponseTimes.findOne({ connectionId: connection.id });
    let previousLogs = [];
    if(responseTime !== undefined){
      previousLogs = responseTime.previousLogs;
    }

    // Put into it
    previousLogs.unshift(duration);

    // Take only five
    previousLogs = previousLogs.slice(0, 5);

    // Calculate the average
    let total = 0;
    previousLogs.forEach(l => total+=l);
    let average = total / previousLogs.length;

    ClientResponseTimes.upsert({ connectionId: connection.id }, {
      $set: {
        connectionId: connection.id,
        responseTime: average,
        previousLogs: previousLogs
      }
    });
  }
});

Meteor.publish("ClientResponseTimeLogs", function(connectionId){
  return ClientResponseTimeLogs.find({ connectionId: connectionId });
});

Meteor.publish("ClientResponseTimes", function(connectionId){
  return ClientResponseTimes.find({ connectionId: connectionId });
});
