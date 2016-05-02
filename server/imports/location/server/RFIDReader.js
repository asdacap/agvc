import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import LocationLogs from '../LocationLogs';
import Machines from '../../machine/Machines';
import Settings from '../../Settings';
import { calculateEstimatedSpeed } from '../../machine/SpeedCalculator';

// This file handlers the mapping between RFID string read from the machine
// into a location log. It also handle the rudimentary scheduling, ie predicting
// which path it will take next.

// Just a reference
var PointRFID = {
  point_1: "SOMERFID",
  point_2: "SOMERFID"
}


// Very basic RFID-LocationLog mapping.
// If the RFID is received, create a location log according to map.
let ResponseMap = {
  "04 8e a1 c2 d7 38 81": [{ // black
    type: "path",
    pathId: "outLeft",
    pathProgress: 1,
    pathDirection: 1
  },{
    type: "path",
    pathId: "inLeft",
    pathProgress: 0,
    pathDirection: 1
  }],
  "04 46 9e c2 d7 38 81": [{ // blue
    type: "path",
    pathId: "inLeft",
    pathProgress: 1,
    pathDirection: 1
  },{
    type: "path",
    pathId: "outRight",
    pathProgress: 0,
    pathDirection: 1
  }],
  "04 49 9f c2 d7 38 81": [{ // yellow
    type: "path",
    pathId: "outRight",
    pathProgress: 1,
    pathDirection: 1
  },{
    type: "path",
    pathId: "inRight",
    pathProgress: 0,
    pathDirection: 1
  }],
  "04 81 a5 c2 d7 38 81": [{ // white
    type: "path",
    pathId: "inRight",
    pathProgress: 1,
    pathDirection: 1
  },{
    type: "path",
    pathId: "outLeft",
    pathProgress: 0,
    pathDirection: 1
  }]
}

AGVMachineHandler.registerEventHandler({
  event: 'key:rfid',
  callback: function(value, machineObj){
    console.log("rfid event received "+value);
    if(ResponseMap[value] === undefined){
      console.warn("ERROR: RFID string "+value+" has no response mapping!");
      return;
    }

    let response = [];
    if(ResponseMap[value].constructor === Array){
      response = ResponseMap[value];
    }else{
      response.push(ResponseMap[value]);
    }

    response.forEach(resp => {
      LocationLogs.safeInsert(machineObj.machineId, resp);
    });
  }
});
