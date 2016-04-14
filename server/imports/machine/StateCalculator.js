import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';

// Attempt to calculate the state of a machine
// at a particular time.
// The state would be the readings and position
// and a status.

function calculateLocationPoint(locationLog, atTime){
  if(locationLog.type === 'point'){
    var point = Map.getPoint(locationLog.pointId);
    if(point === undefined){
      console.error("Error point "+locationLog.pointId+" is not defined");
      return {
        x: 0,
        y: 0
      }
    }
    return {
      x: point.visualX,
      y: point.visualY
    };
  }else if(locationLog.type === 'path'){
    var path = Map.getPath(locationLog.pathId);
    if(path === undefined){
      console.error("Error path "+locationLog.pathId+" is not defined");
      return undefined;
    }

    if(Meteor.isClient){
      var pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", path.svgPathD);
    }else{
      var pts = Point(path.svgPathD);
    }

    if(Meteor.isClient){
      var length = pathEl.getTotalLength();
    }else{
      var length = pts.length();
    }

    var speed = path.machineSpeed;
    var timePassed = (atTime.getTime() - locationLog.createdAt.getTime());
    timePassed /= 1000.0;
    var lengthPassed = timePassed*speed;
    var progress = locationLog.pathProgress + (lengthPassed/length);
    if(progress > 1){
      progress = 1;
    }
    if(progress < 0){
      progress = 0;
    }

    if(Meteor.isClient){
      var point = pathEl.getPointAtLength(length*progress);
    }else{
      var parr = pts.at(length*progress);
      var point = {
        x: parr[0],
        x: parr[1]
      };
    }

    return {
      x: point.x,
      y: point.y
    };
  }else{
    console.error("ERROR: unknown location log type "+locationLog.type);
    return undefined;
  }
}

export default StateCalculator = {
  subscribe(machineId, atTime){
    // Subscribe to the data required to calculate the machine state at the time
    Meteor.subscribe("location_logs", machineId, atTime);
    Readings.availableReadings.forEach(function(reading){
      Meteor.subscribe("readingState", machineId, reading, atTime);
    });
  },
  calculate(machineId, atTime){
    // Attempt to calculate the state of the machine at the time
    let state = {};

    // First, the easy one. The readings.
    Readings.availableReadings.forEach(reading => {

      // Fetch the last one
      var readingValue = Readings.findOne({
        machineId: machineId,
        createdAt: { $lte: atTime },
        type: reading
      }, {
        sort: { createdAt: -1 },
        limit: 1
      });

      if(readingValue !== undefined){
        readingValue = readingValue.reading;
      }else{
        readingValue = Readings.defaultValue[reading]
      }

      state[reading] = readingValue;
    });


    // Then, the hard one, the position
    let lastLocation = LocationLogs.findOne({
      machineId: machineId,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });

    if(lastLocation === undefined){
      state.position = undefined;
    }else{
      state.position = calculateLocationPoint(lastLocation, atTime);
    }

    return state;
  }
};
