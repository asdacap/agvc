import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';
import moment from 'moment';

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

function calculateStatus(machineId, atTime){
  // Set the default status and when it happened
  let cStatus = "normal";
  let cStatusTime = 0;

  // First, check online
  let onlineLog = Readings.getLastReadingLog("online", machineId, atTime);

  // Ignore it if it is true
  if(onlineLog !== undefined && onlineLog.value == true) onlineLog = undefined;
  if(onlineLog !== undefined){
    cStatus = "offline";
    cStatusTime = onlineLog.createdAt.getTime();
  }

  // Next, check out of circuit
  let outOfCircuitLog = Readings.getLastReadingLog("outOfCircuit", machineId, atTime);

  // Ignore it if it is false
  if(outOfCircuitLog !== undefined && outOfCircuitLog.value == false) outOfCircuitLog = undefined;
  if(outOfCircuitLog !== undefined && outOfCircuitLog.createdAt.getTime() > cStatusTime){
    cStatus = "outOfCircuit";
    cStatusTime = outOfCircuitLog.createdAt.getTime();
  }

  // Next, check manual mode
  let manualModeLog = Readings.getLastReadingLog("manualMode", machineId, atTime);

  // Ignore it if it is false
  if(manualModeLog !== undefined && manualModeLog.value == false) manualModeLog = undefined;
  if(manualModeLog !== undefined && manualModeLog.createdAt.getTime() > cStatusTime){
    cStatus = "manualMode";
    cSTatusTime = manualModeLog.createdAt.getTime();
  }

  return cStatus;
};

export default StateCalculator = {
  subscribe(machineId, atTime){

    // Subscribing only the last one is inefficent
    // We are subscribing record for the whole minute
    atTime = new Date(atTime.getTime());
    atTime.setSeconds(0,0);
    let toTime = moment(new Date(atTime.getTime())).add(1, 'minutes').toDate();

    // Subscribe to the data required to calculate the machine state at the time
    let ready = true;
    ready = ready && Meteor.subscribe("LocationLogs.last", machineId, atTime).ready();
    ready = ready && Meteor.subscribe("LocationLogs.createdAtRange", machineId, atTime, toTime).ready();
    Readings.availableReadings.forEach(function(reading){
      ready = ready && Meteor.subscribe("Readings.last", machineId, reading, atTime).ready();
      ready = ready && Meteor.subscribe("Readings.createdAtRange", machineId, reading, atTime, toTime).ready();
    });
    return ready;
  },
  calculate(machineId, atTime){
    // Attempt to calculate the state of the machine at the time
    let state = {};

    // First, the easy one. The readings.
    Readings.availableReadings.forEach(reading => {

      // Fetch the last one
      var readingValue = Readings.getLastReadingLog(reading, machineId, atTime);
      if(readingValue !== undefined){
        readingValue = readingValue.reading;
      }else{
        readingValue = Readings.meta[reading].defaultValue;
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

    // Then, the status one
    state.status = calculateStatus(machineId, atTime);

    return state;
  }
};
