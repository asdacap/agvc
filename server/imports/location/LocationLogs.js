
import Machines from '../machine/Machines';
import nextMachineTimestamp from '../machine/nextMachineTimestamp';
import { calculateEstimatedSpeed } from '../machine/SpeedCalculator';

export default LocationLogs = new Mongo.Collection("LocationLogs");
LocationLogs.attachBehaviour('timestampable');

var LocationLogSchema = {
  machineId: {
    type: String,
    optional: false
  },
  type: {
    type: String, // Either 'point' or 'path'
    optional: false
  },
  firstInterruption: {
    type: Date,
    optional: true
  },
  pointId: {
    type: String,
    optional: true
  },
  pathId: {
    type: String,
    optional: true
  },
  pathDirection: {
    type: Number, // 1 for forward -1 for backward
    optional: true
  },
  pathProgress: {
    type: Number, // 0 to 1 showing path progress
    decimal: true,
    optional: true
  },
  nextEstimatedSpeed: {
    type: Number, // 0 to 1 showing path progress
    decimal: true,
    optional: true
  }
};

LocationLogs.attachSchema(LocationLogSchema);

LocationLogs.getLastLog = function(machineId, atTime){
  if(Meteor.isClient){
    // Probably faster this way
    let logs = LocationLogs.find({ machineId: machineId }, { reactive: false }).fetch();

    logs = logs.filter(L => L.createdAt.getTime() <= atTime.getTime());
    logs.sort((rA, rB) => rA.createdAt.getTime() - rB.createdAt.getTime());

    if(logs.length == 0){
      return undefined;
    }else{
      return logs[logs.length-1];
    }

  }else{
    return LocationLogs.findOne({
      machineId: machineId,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1,
      reactive: false
    });
  }
}

// safer locationlogs insert. This make sure that
// it also modifies the machine
LocationLogs.safeInsert = function(machineId, log){
  log = _.extend({}, log);
  log.createdAt = nextMachineTimestamp(machineId);
  log.machineId = machineId;
  let _id = LocationLogs.insert(log);
  log._id = _id;

  if(log.type == "path"){
    let nextSpeed = calculateEstimatedSpeed(machineId, log.pathId, log.createdAt);
    if(nextSpeed !== undefined){
      LocationLogs.update(_id, {
        $set: { nextEstimatedSpeed: nextSpeed }
      });
      log.nextEstimatedSpeed = nextSpeed;
    }
  }

  Machines.update({ machineId }, { $set: { lastLocationLog: log } });
}

if(Meteor.isServer){
  Meteor.publish("LocationLogs.last", function(machineId, atTime, limit){
    console.log("last subscribed");
    if(machineId === undefined || atTime === undefined){
      console.log("Location logs missing parameters");
      return null;
    }

    if(limit === undefined) limit = 1;

    return LocationLogs.find({
      machineId: machineId,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: limit
    });
  });

  Meteor.publish("LocationLogs.createdAtRange", function(machineId, startTime, endTime){
    return LocationLogs.find({
      machineId: machineId,
      createdAt: { $gte: startTime, $lte: endTime }
    });
  });

  // Rolling subscription will send reading starting from the startTime
  // and periodically send more reading. Used for state calculator to prevent
  // resubscribe
  Meteor.publish("LocationLogs.rolling", function(machineId, startTime, subbedAt){
    let subStartTime = new Date();
    let duration = 3000;
    let buffer = lastLog;

    let results = [];
    let intervalHandle = undefined;
    let runNext = _ => {
      let diff = new Date().getTime() - subStartTime.getTime();
      let newStart = new Date(startTime.getTime()+diff);
      let newEnd = new Date(newStart.getTime()+duration);

      // Remove old data
      while(results.length > 1 && results[0].createdAt.getTime()+buffer < newStart.getTime()){
        this.removed("LocationLogs", results[0]._id);
        results.shift();
      }

      // Add new one
      let _results =  LocationLogs.find({
        machineId: machineId,
        createdAt: { $gte: newStart, $lte: newEnd }
      }, { reactive: false }).fetch();

      _results.forEach(result => {
        results.push(result);
        this.added("LocationLogs", result._id, result);
      });
    };

    this.onStop(_ => {
      Meteor.clearInterval(intervalHandle);
    });

    let lastLog = LocationLogs.getLastLog(machineId, startTime);
    if(lastLog !== undefined){
      results.push(lastLog);
      this.added("LocationLogs", lastLog._id, lastLog);
    }

    LocationLogs.find({
      machineId: machineId,
      createdAt: { $gte: startTime, $lte: new Date(startTime.getTime() + duration) }
    }).fetch().forEach(result => {
      results.push(result);
      this.added("LocationLogs", result._id, result);
    });

    this.ready();

    // Start loop
    intervalHandle = Meteor.setInterval(runNext, duration);
  });
}

// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    LocationLogs.rawCollection().ensureIndex({ machineId: 1, createdAt: -1 }, {}, _ => _);
    LocationLogs.rawCollection().ensureIndex({ machineId: 1, createdAt: 1 }, {}, _ => _);
  });
}
