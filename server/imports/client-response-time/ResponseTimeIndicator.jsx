import React from 'react';
import ClientResponseTimes from './ClientResponseTimes';

export default ResponseTimeIndicator = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    let responseTime = 0;

    Chronos.liveUpdate(1000);

    Meteor.subscribe("ClientResponseTimes", Meteor.connection._lastSessionId);

    let record = ClientResponseTimes.findOne({ connectionId: Meteor.connection._lastSessionId });
    if(record !== undefined){
      responseTime = record.responseTime;
    }

    return {
      responseTime
    }
  },
  render(){
    return <span style={{ position: "fixed", bottom: 3, left: 3 }}>{this.data.responseTime}</span>;
  }
});
