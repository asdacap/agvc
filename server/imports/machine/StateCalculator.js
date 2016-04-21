import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';
import moment from 'moment';


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

    // Check the first time it is out of circuit
    let readingLog = Readings[reading].findOne({
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

    if(readingLog !== undefined && readingLog.createdAt.getTime() < finalTime.getTime()){
      finalTime = readingLog.createdAt;
    }
  });

  return finalTime;
}

// Check if there any interruption to the AVG during the time duration
function findInterruptionWithinTime(machineId, fromTime, toTime){
  let interruptionReading = ["obstructed", "outOfCircuit", "manualMode"];
  let interrupted = false;
  interruptionReading.forEach(reading => {
    if(interrupted) return;

    let readingLog = Readings[reading].findOne({
      machineId: machineId,
      createdAt: {
        $gte: fromTime,
        $lte: toTime
      }
    });
    if(readingLog !== undefined) interrupted = true;
  });
  return interrupted;
}

// attempt to estimate speed by considering previously recorded speed
function calculateEstimatedSpeed(machineId, atPath, atTime){
  let locationLogs = LocationLogs.find({
    machineId: machineId,
    type: "path",
    createdAt: {
      $lte: atTime
    }
  }, {
    sort: { createdAt: -1 },
    limit: 20
  }).fetch();

  let speeds = [];

  for(let i=0;i<locationLogs.length-1;i++){
    let log1 = locationLogs[i];
    let log2 = locationLogs[i+1];
    if(log1.pathId != atPath) continue;
    if(log1.pathId !== log2.pathId) continue;
    if(findInterruptionWithinTime(log2.createdAt, log1.createdAt)) continue;

    let diff = Math.abs(log1.pathProgress - log2.pathProgress);
    let timediff = (log1.createdAt.getTime() - log2.createdAt.getTime())/1000;

    // Probably just sits there
    if(diff == 0) continue;

    speeds.push(diff/timediff);
  }

  if(speeds.length == 0) return undefined;

  let total = 0;
  speeds.forEach(speed => total = total+speed);

  return total/speeds.length;
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

    if(Meteor.isClient){
      var length = pathEl.getTotalLength();
    }else{
      var length = pts.length();
    }

    var speed = calculateEstimatedSpeed(locationLog.machineId, locationLog.pathId, atTime)
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

export default StateCalculator = {
  subscribe(machineId, atTime){

    // Subscribing only the last one is inefficent
    // We are subscribing record for the whole minute
    atTime = new Date(atTime.getTime());
    atTime.setSeconds(Math.floor(atTime.getSeconds()/10)*10,0);
    let toTime = moment(new Date(atTime.getTime())).add(20, 'seconds').toDate();

    // Subscribe to the data required to calculate the machine state at the time
    let ready = true;
    ready = ready && Meteor.subscribe("LocationLogs.last", machineId, atTime, 20).ready();
    ready = ready && Meteor.subscribe("LocationLogs.createdAtRange", machineId, atTime, toTime).ready();
    ready = ready && Meteor.subscribe("Readings.last", machineId, atTime).ready();
    ready = ready && Meteor.subscribe("Readings.createdAtRange", machineId, atTime, toTime).ready();
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
        readingValue = readingValue.value;
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
