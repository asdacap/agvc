import Machines from './Machines';
import Readings from '../reading/Readings';
import LocationLogs from '../location/LocationLogs';
import Map from '../location/Map';
import Point from 'point-at-length';
import moment from 'moment';

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

function getPreviousSpeeds(machineId, atPath, atTime){
  let locationLogs = LocationLogs.find({
    machineId: machineId,
    type: "path",
    createdAt: {
      $lte: atTime
    }
  }, {
    sort: { createdAt: -1 },
    limit: 50
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

  return speeds;
}

// attempt to estimate speed by considering previously recorded speed
function calculateEstimatedSpeed(machineId, atPath, atTime){

  let speeds = getPreviousSpeeds(machineId, atPath, atTime);
  if(speeds == undefined){
    return undefined;
  }

  let total = 0;
  speeds.sort();
  // Find median
  if(speeds.length > 3){
    let middle = Math.floor(speeds.length/2);
    let nspeeds = [speeds[middle-1],speeds[middle],speeds[middle+1]];
    speeds = nspeeds;
  }
  speeds.forEach(speed => total = total+speed);

  return total/speeds.length;
}


export { calculateEstimatedSpeed, findInterruptionWithinTime, getPreviousSpeeds };
