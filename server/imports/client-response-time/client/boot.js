import ClientResponseTimeLogs from '../ClientResponseTimeLogs';
import Settings from '../../Settings';

if(Settings.show_client_response_time){
  Meteor.autorun(function(){

    Chronos.liveUpdate(1000);
    Meteor.subscribe("ClientResponseTimeLogs", Meteor.connection._lastSessionId);

    let logs = ClientResponseTimeLogs.find({ connectionId: Meteor.connection._lastSessionId }).fetch().forEach(log => {
      Meteor.call('responseTimeLogPing', log._id);
    });

  });
}
