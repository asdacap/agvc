import Readings from '../Readings';
import Machines from '../../machine/Machines';
import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import LocationLogs from '../../location/LocationLogs';
import Map from '../../location/Map';

function callback(value, machineObj){
  if(value != "0"){
    return;
  }

  let beforeTime = new Date(new Date().getTime()-1);

  let lastOn = Readings["obstructed"].findOne({
    machineId: machineObj.machineId,
    value: true,
    createdAt: {
      $lt: beforeTime
    }
  }, {
    sort: {
      createdAt: -1
    },
    limit: 1
  });

  if(lastOn === undefined){
    console.warn("Obstructed off without obstructed on!");
    return;
  }

  let whatToLookFor = ["outOfCircuit", "manualMode"];
  let hasObstructed = false;

  whatToLookFor.forEach(reading => {
    if(Readings[reading].find({
      machineId: machineObj.machineId,
      createdAt: {
        $lt: beforeTime,
        $gt: lastOn.createdAt
      }
    }).count() > 0){
      hasObstructed = true;
    }
  });

  if(hasObstructed) {
    return;
  }

  let locationLog = LocationLogs.findOne({
    machineId: machineObj.machineId,
    type: "path",
    createdAt: {
      $lt: beforeTime
    }
  },{
    sort: {
      createdAt: -1
    },
    limit: 1
  });

  if(locationLog === undefined) return;

  let path = Map.getPath(locationLog.pathId);
  let length = path.length;
  let speed = locationLog.nextEstimatedSpeed;
  if(speed == undefined){
    speed = path.machineSpeed/length;
  }
  let finalTime = lastOn.createdAt;

  // Now we need to calculate the progress
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

  let data = _.extend({}, _.pick(locationLog,"machineId", "type", "pointId", "pathId", "pathDirection", "nextEstimatedSpeed"), { createdAt: new Date(new Date()+10), pathProgress: progress});

  data._id = LocationLogs.insert(data);
  Machines.update(machineObj._id, { $set: { lastLocationLog: data } });
}
AGVMachineHandler.registerEventHandler({
  event: "key:obstructed",
  callback: callback
});
