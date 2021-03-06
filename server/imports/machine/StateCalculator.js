import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';
import moment from 'moment';
import { calculateEstimatedSpeed } from './SpeedCalculator';


// Calculate the last time this locationLog is interrupted
// Used by calculateLocationPoint to know if the path ended prematurely
function calculateLastInterruptedTime(locationLog, atTime){
  let finalTime = atTime;

  let whatToLookFor = [
    ["outOfCircuit", true],
    ["manualMode", true],
    ["obstructed", true]
  ]

  whatToLookFor.forEach((readingVal) => {
    let reading = readingVal[0];
    let value = readingVal[1];

    let readingLog = undefined;
    if(Meteor.isClient){
      let readings = Readings[reading].find({
        machineId: locationLog.machineId,
        value: value
      }).fetch();

      readings = readings.filter(read =>
        read.createdAt.getTime() >= locationLog.createdAt.getTime() &&
        read.createdAt.getTime() <= atTime.getTime());
      readings.sort((rA, rB) => rB.createdAt.getTime() - rA.createdAt.getTime());

      readingLog = readings[0];
    }else{
      readingLog = Readings[reading].findOne({
        machineId: locationLog.machineId,
        value: value,
        createdAt: {
          $gte: locationLog.createdAt,
          $lte: atTime
        }
      }, {
        sort: { createdAt: 1 },
        limit: 1
      });
    }

    if(readingLog !== undefined && readingLog.createdAt.getTime() < finalTime.getTime()){
      finalTime = readingLog.createdAt;
    }
  });

  return finalTime;
}

// Attempt to calculate the state of a machine
// at a particular time.
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

    let length = path.length;
    let speed = locationLog.nextEstimatedSpeed;
    if(speed == undefined){
      speed = path.machineSpeed/length;
    }

    // final time calculation
    // In case an event happen between the start of the log
    // and finalTime (which is current time),
    // Truncate the finalTime to that time
    let finalTime = calculateLastInterruptedTime(locationLog, atTime);

    // Back to our calculation
    let timePassed = (finalTime - locationLog.createdAt.getTime());
    timePassed /= 1000.0;
    let progressPassed = timePassed*speed;

    if(locationLog.pathDirection == 1){
      var progress = locationLog.pathProgress + progressPassed;
    }else{
      // Reversed direction
      var progress = locationLog.pathProgress - progressPassed;
    }
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
        y: parr[1]
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

// The state would be the readings and position
// and a status.
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

  // Next, check obstructed
  let obstructedLog = Readings.getLastReadingLog("obstructed", machineId, atTime);

  // Ignore it if it is false
  if(obstructedLog !== undefined && obstructedLog.value == false) obstructedLog = undefined;
  if(obstructedLog !== undefined && obstructedLog.createdAt.getTime() > cStatusTime){
    cStatus = "obstructed";
    cSTatusTime = obstructedLog.createdAt.getTime();
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

let defaultCalculateStateOptions = {
  status: true,
  position: true
};
Readings.availableReadings.forEach(reading => defaultCalculateStateOptions[reading] = true);

export default StateCalculator = {
  defaultCalculateStateOptions,
  subscribe(machineId, atTime){

    // Subscribing only the last one is inefficent
    // We are subscribing record for the whole minute
    atTime = new Date(atTime.getTime());
    atTime.setSeconds(Math.floor(atTime.getSeconds()/5)*5,0);
    let toTime = moment(new Date(atTime.getTime())).add(10, 'seconds').toDate();

    // Subscribe to the data required to calculate the machine state at the time
    let ready = true;
    ready = ready && Meteor.subscribe("LocationLogs.last", machineId, atTime).ready();
    ready = ready && Meteor.subscribe("LocationLogs.createdAtRange", machineId, atTime, toTime).ready();
    ready = ready && Meteor.subscribe("Readings.last", machineId, atTime).ready();
    ready = ready && Meteor.subscribe("Readings.createdAtRange", machineId, atTime, toTime).ready();
    return ready;
  },
  rollingSubscribe(machineId, atTime, subscribedAt){
    atTime = new Date(atTime.getTime());

    // Subscribe to the data required to calculate the machine state at the time
    let ready = true;
    if(!Meteor.subscribe("LocationLogs.rolling", machineId, atTime, subscribedAt).ready()){
      ready = false;
    }
    if(!Meteor.subscribe("Readings.rolling", machineId, atTime, subscribedAt).ready()){
      ready = false;
    }
    return ready;
  },
  calculate(machineId, atTime, options){

    if(options === undefined){
      options = defaultCalculateStateOptions;
    }

    // Attempt to calculate the state of the machine at the time
    let state = {};

    // First, the easy one. The readings.
    Readings.availableReadings.forEach(reading => {

      if(options[reading]){
        // Fetch the last one
        var readingValue = Readings.getLastReadingLog(reading, machineId, atTime);
        if(readingValue !== undefined){
          readingValue = readingValue.value;
        }else{
          readingValue = Readings.meta[reading].defaultValue;
        }

        state[reading] = readingValue;
      }
    });


    if(options.position){
      // Then, the hard one, the position
      let lastLocation = LocationLogs.getLastLog(machineId, atTime);

      if(lastLocation === undefined){
        state.position = undefined;
      }else{
        state.position = calculateLocationPoint(lastLocation, atTime);
      }

    }

    if(options.status){
      // Then, the status one
      state.status = calculateStatus(machineId, atTime);
    }

    return state;
  }
};
