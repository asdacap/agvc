import React from 'react';
import ClientResponseTimes from './ClientResponseTimes';
import ViewTime from '../client/ViewTime';
import Settings from '../Settings';

let styles = {
  Indicator: {
    position: "fixed",
    top: 3,
    left: 3,
    zIndex: 1200
  }
}

export default ResponseTimeIndicator = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    let responseTime = 0;

    ViewTime.time; // Just for live update
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
    if(Settings.show_client_response_time){
      return <span style={styles.Indicator}>{this.data.responseTime}</span>;
    }else{
      return <span></span>;
    }
  }
});
