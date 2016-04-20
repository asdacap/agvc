import AGVMachineHandler from '../../machine-interface/server/AGVMachineHandler';
import LocationLogs from '../LocationLogs';
import Settings from '../../Settings';

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
  "DEBUG": {
    type: 'path',
    pathId: 'leftCircle',
    pathProgress: 0,
    pathDirection: 1
  },
  "05 36 22 34 24 b0 c1": {
    type: 'path',
    pathId: 'rightCircle',
    pathProgress: 0,
    pathDirection: 1
  },
  "2d a2 43 85": {
    type: 'path',
    pathId: 'leftCircle',
    pathProgress: 0,
    pathDirection: 1
  }
}

if(Settings.use_bigger_map){
  ResponseMap = {
    "04 8e a1 c2 d7 38 81": {
      type: "path",
      pathId: "verticalRight",
      pathProgress: 1,
      pathDirection: -1
    },
    "04 46 9e c2 d7 38 81": {
      type: "path",
      pathId: "verticalLeft",
      pathProgress: 1,
      pathDirection: -1
    },
    "04 49 9f c2 d7 38 81": {
      type: "path",
      pathId: "horizontalLeft",
      pathProgress: 1,
      pathDirection: -1
    },
    "04 81 a5 c2 d7 38 81": {
      type: "path",
      pathId: "horizontalRight",
      pathProgress: 1,
      pathDirection: -1
    }
  }
}

AGVMachineHandler.registerEventHandler({
  event: 'key:rfid',
  callback: function(value, machineObj){
    console.log("rfid event received "+value);
    if(ResponseMap[value] === undefined){
      console.warn("ERROR: RFID string "+value+" has no response mapping!");
      return;
    }

    var newlog = _.extend({},ResponseMap[value]);
    newlog.machineId = machineObj.machineId;

    LocationLogs.insert(newlog);
  }
});
