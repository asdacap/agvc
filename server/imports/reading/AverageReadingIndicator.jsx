import React from 'react';
import ViewTime from '../client/ViewTime';
import Machines from '../machine/Machines';
import Readings from './Readings';
import Settings from '../Settings';

let styles = {
  Indicator: {
    position: "fixed",
    top: 15,
    left: 3,
    zIndex: 1200,
    pointerEvents: "none"
  }
}

let averageReading = {
};

if(Meteor.isClient && Settings.show_average_readings){
  Meteor.subscribe("Machines", Meteor.connection._lastSessionId);

  let readingLists = [];

  Meteor.setInterval(_ => {
    let currentReading = {};
    Readings.availableReadings.forEach(reading => currentReading[reading] = 0);

    let machines = Machines.find({ online: true }, {reactive: false}).fetch();
    machines.forEach(machine => {
      Readings.availableReadings.forEach(reading => {
        currentReading[reading] = currentReading[reading] + machine[reading];
      });
    });

    let machineCount = machines.length;

    Readings.availableReadings.forEach(reading => currentReading[reading] = currentReading[reading] / machineCount);

    readingLists.push(currentReading);
    if(readingLists.length > 10){
      readingLists.shift();
    }

    Readings.availableReadings.forEach(reading => {
      averageReading[reading] = 0

      readingLists.forEach(rl => {
        averageReading[reading] = averageReading[reading] + rl[reading];
      });

      averageReading[reading] = averageReading[reading]/readingLists.length;
    });
  }, 1000);
}

export default AverageReadingIndicator = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    let responseTime = 0;
    ViewTime.time; // Just for live update
    return {
      responseTime
    }
  },
  render(){
    if(Settings.show_average_readings){
      return <span style={styles.Indicator}>
        {_.map(averageReading, (value, key) => {
          return <p>{Readings.meta[key].title+": "+value.toString()}</p>;
          })}
        </span>
      }else{
        return <span></span>;
      }
  }
});
