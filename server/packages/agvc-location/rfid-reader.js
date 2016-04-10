
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
var ResponseMap = {
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

AGVMachineHandler.registerEventHandler({
  event: 'key:rfid',
  callback: function(value, machineObj){
    console.log("rfid event received "+value);
    if(ResponseMap[value] === undefined){
      console.log("ERROR: RFID string "+value+" has no response mapping!");
      return;
    }

    var newlog = _.extend({},ResponseMap[value]);
    newlog.machineId = machineObj.machineId;

    LocationLogs.insert(newlog);
  }
});
