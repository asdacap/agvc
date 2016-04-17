import ClientResponseTimeLogs from '../ClientResponseTimeLogs';

Meteor.autorun(function(){

  Chronos.liveUpdate(1000);
  Meteor.subscribe("clientResponseTimeLogs", Meteor.connection._lastSessionId);

  let logs = ClientResponseTimeLogs.find({ connectionId: Meteor.connection._lastSessionId }).fetch().forEach(log => {
    Meteor.call('responseTimeLogPing', log._id);
  });

});
