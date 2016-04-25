import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';
import moment from 'moment';
import { calculateEstimatedSpeed } from './SpeedCalculator';

/**
 * This file is used as a more efficient StateCalculator
 * However, it requires the machineObject and only calculate
 * the live state. That means, no atTime
 */

// Calculate the last time this locationLog is interrupted
// Used by calculateLocationPoint to know if the path ended prematurely
function calculateLastInterruptedTime(locationLog, machineObj, startTime){
  let finalTime = new Date();

  let whatToLookFor = [
    ["outOfCircuit", true],
    ["manualMode", true],
    ["obstructed", true]
  ]

  whatToLookFor.forEach((readingVal) => {
    let reading = readingVal[0];
    let value = readingVal[1];

    if(machineObj[readingVal] !== undefined &&
      machineObj[readingVal+"UpdatedAt"].getTime() < finalTime.getTime() &&
      machineObj[readingVal+"UpdatedAt"].getTime() > startTime.getTime()){
      finalTime = machineObj[readingVal+"UpdatedAt"];
    }
  });

  return finalTime;
}

// Attempt to calculate the state of a machine
// at a particular time.
function calculateLocationPoint(locationLog, machineObj){
  if(locationLog.type === 'point'){
    let point = Map.getPoint(locationLog.pointId);
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
    let path = Map.getPath(locationLog.pathId);
    if(path === undefined){
      console.error("Error path "+locationLog.pathId+" is not defined");
      return undefined;
    }

    let pathEl = undefined;
    let pts = undefined;
    let length = undefined;

    if(Meteor.isClient){
      pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", path.svgPathD);
    }else{
      pts = Point(path.svgPathD);
    }

    if(Meteor.isClient){
      length = pathEl.getTotalLength();
    }else{
      length = pts.length();
    }

    let speed = locationLog.nextEstimatedSpeed;
    if(speed == undefined){
      speed = path.machineSpeed/length;
    }

    // final time calculation
    // In case an event happen between the start of the log
    // and finalTime (which is current time),
    // Truncate the finalTime to that time
    let finalTime = calculateLastInterruptedTime(locationLog, machineObj, locationLog.createdAt);

    // Back to our calculation
    let timePassed = (finalTime - locationLog.createdAt.getTime());
    timePassed /= 1000.0;
    let progressPassed = timePassed*speed;
    let progress = 0;

    if(locationLog.pathDirection == 1){
      progress = locationLog.pathProgress + progressPassed;
    }else{
      // Reversed direction
      progress = locationLog.pathProgress - progressPassed;
    }
    if(progress > 1){
      progress = 1;
    }
    if(progress < 0){
      progress = 0;
    }

    let point = undefined;
    if(Meteor.isClient){
      point = pathEl.getPointAtLength(length*progress);
    }else{
      let parr = pts.at(length*progress);
      point = {
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
function calculateStatus(machineId, machineObj){
  // Set the default status and when it happened
  let cStatus = "normal";
  let cStatusTime = 0;

  // Ignore it if it is true
  if(machineObj.online !== undefined && machineObj.online == false){
    cStatus = "offline";
    cStatusTime = machineObj.onlineUpdatedAt.getTime();
  }

  // Ignore it if it is false
  if(machineObj.outOfCircuit !== undefined &&
    machineObj.outOfCircuit &&
    machineObj.outOfCircuitUpdatedAt.getTime() > cStatusTime){
    cStatus = "outOfCircuit";
    cStatusTime = machineObj.outOfCircuitUpdatedAt.getTime();
  }

  if(machineObj.obstructed !== undefined &&
    machineObj.obstructed &&
    machineObj.obstructedUpdatedAt.getTime() > cStatusTime){
    cStatus = "obstructed";
    cSTatusTime = machineObj.obstructedUpdatedAt.getTime();
  }

  if(machineObj.manualMode !== undefined &&
    machineObj.manualMode &&
    machineObj.manualModeUpdatedAt.getTime() > cStatusTime){
    cStatus = "manualMode";
    cSTatusTime = machineObj.manualModeUpdatedAt.getTime();
  }

  return cStatus;
};

let defaultCalculateStateOptions = {
  status: true,
  position: true
};
Readings.availableReadings.forEach(reading => defaultCalculateStateOptions[reading] = true);

export default LiveStateCalculator = {
  defaultCalculateStateOptions,
  calculate(machineId, machineObj, options){

    if(machineObj === undefined){
      machineObj = Machines.findOne({ machineId: machineId }, { reactive: false });
    }

    if(machineObj === undefined){
      // Bare minimum before sanitize
      machineObj = {
        machineId: machineId
      };
    }
    // Sanitize the machinObj
    Readings.availableReadings.forEach(reading => {
      if(machineObj[reading] === undefined){
        machineObj[reading] = Readings.meta[reading].defaultValue;
      }
      if(machineObj[reading+"UpdatedAt"] === undefined){
        machineObj[reading+"UpdatedAt"] = new Date();
      }
    });

    if(options === undefined){
      options = defaultCalculateStateOptions;
    }

    // Attempt to calculate the state of the machine at the time
    let state = {};

    // First, the easy one. The readings.
    Readings.availableReadings.forEach(reading => {

      if(options[reading]){
        // Fetch the last one
        var readingValue = machineObj[reading];
        if(readingValue === undefined){
          readingValue = Readings.meta[reading].defaultValue;
        }

        state[reading] = readingValue;
      }
    });


    if(options.position){
      // Then, the hard one, the position
      let lastLocation = machineObj.lastLocationLog;

      if(lastLocation === undefined){
        state.position = undefined;
      }else{
        state.position = calculateLocationPoint(lastLocation, machineObj);
      }

    }

    if(options.status){
      // Then, the status one
      state.status = calculateStatus(machineId, machineObj);
    }

    return state;
  }
};
