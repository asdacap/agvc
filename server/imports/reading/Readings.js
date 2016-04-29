// This file needs to be loaded first

import Machines from '../machine/Machines';
import nextMachineTimestamp from '../machine/nextMachineTimestamp';
import d3 from 'd3';

export default Readings = {};

//// reading type metadata
Readings.availableReadings = [
  "temperature",
  "battery",
  "online",
  "outOfCircuit",
  "responseTime",
  "loopInterval",
  "obstructed",
  "sentDataRate",
  "receivedDataRate",
  "manualMode"
];

//// Schemas
var ReadingSchema = new SimpleSchema({
  value: {
    type: "none", // None as some reading is of type boolean
    optional: false
  },
  machineId: {
    type: String,
    optional: false
  }
});

//// Actually define the readings collection
Readings.availableReadings.forEach(reading => {
  Readings[reading] = new Mongo.Collection(reading+"Readings");
  Readings[reading].attachBehaviour("timestampable");
  Readings[reading].attachSchema(ReadingSchema);
});

//// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    Readings.availableReadings.forEach(reading => {
      Readings[reading].rawCollection().ensureIndex({ machineId: 1, createdAt: -1 }, {}, _ => _);
      Readings[reading].rawCollection().ensureIndex({ machineId: 1, createdAt: 1 }, {}, _ => _);
    });
  });
}

// Battery value needs to be transformed a little bit
function batteryValueTransformer(value){
  value = value*(25.0/1024.0);
  return value;
}

// Temperature value also need to be transformed
function temperatureValueTransformer(value){
  return value*0.48828125;
}

Readings.meta = {
  temperature: {
    title: "Temperature",
    defaultValue: 0,
    transformer: temperatureValueTransformer,
    unit: "c",
    formatter: d3.format(".2f"),
    type: Number
  },
  battery: {
    title: "Battery",
    defaultValue: 0,
    transformer: batteryValueTransformer,
    badLow: 6,
    unit: "V",
    formatter: d3.format(".2f"),
    type: Number
  },
  responseTime: {
    title: "Response Time",
    defaultValue: 0,
    badHigh: 100,
    unit: "ms",
    type: Number
  },
  loopInterval: {
    title: "Loop Interval",
    defaultValue: 0,
    badHigh: 50,
    unit: "ms",
    type: Number
  },
  sentDataRate: {
    title: "Sent Data Rate:",
    defaultValue: 0,
    unit: "B/s",
    formatter: d3.format(".2f"),
    type: Number
  },
  receivedDataRate: {
    title: "Received Data Rate:",
    defaultValue: 0,
    unit: "B/s",
    formatter: d3.format(".2f"),
    type: Number
  },
  online: {
    title: "Online",
    defaultValue: false,
    badLow: false,
    type: Boolean
  },
  outOfCircuit: {
    title: "Out of circuit",
    defaultValue: false,
    badHigh: true,
    type: Boolean
  },
  obstructed: {
    title: "Obstructed",
    defaultValue: false,
    badHigh: true,
    type: Boolean
  },
  manualMode: {
    title: "ManualMode",
    defaultValue: false,
    type: Boolean
  }
};

//// Publications
if(Meteor.isServer){
  Meteor.publish("Readings.fromDate", function(machineId, reading, fromDate){
    return Readings[reading].find({ machineId: machineId, createdAt: { $gt: fromDate } });
  });
  Meteor.publish("Readings.last", function(machineId, atTime, reading){
    if(reading !== undefined){
      let readings = Readings[reading].find({
        machineId: machineId,
        createdAt: { $lte: atTime }
      }, {
        sort: { createdAt: -1 },
        limit: 1
      });

      return readings;
    }else{
      return Readings.availableReadings.map(reading => {
        return Readings[reading].find({
          machineId: machineId,
          createdAt: { $lte: atTime }
        }, {
          sort: { createdAt: -1 },
          limit: 1
        });
      });
    }
  });
  Meteor.publish("Readings.first", function(machineId, atTime, reading){
    if(reading !== undefined){
      let readings = Readings[reading].find({
        machineId: machineId,
        createdAt: { $gte: atTime }
      }, {
        sort: { createdAt: 1 },
        limit: 1
      });

      return readings;
    }else{
      return Readings.availableReadings.map(reading => {
        return Readings[reading].find({
          machineId: machineId,
          createdAt: { $gte: atTime }
        }, {
          sort: { createdAt: 1 },
          limit: 1
        });
      });
    }
  });
  Meteor.publish("Readings.createdAtRange", function(machineId, fromTime, endTime, reading){
    if(reading !== undefined){
      let readings = Readings[reading].find({
        machineId: machineId,
        createdAt: { $gte: fromTime, $lte: endTime }
      });

      return readings;
    }else{
      return Readings.availableReadings.map(reading => {
        let readings = Readings[reading].find({
          machineId: machineId,
          createdAt: { $gte: fromTime, $lte: endTime }
        });

        return readings;
      });
    }
  });

  // Rolling subscription will send reading starting from the startTime
  // and periodically send more reading. Used for state calculator to prevent
  // resubscribe
  Meteor.publish("Readings.rolling", function(machineId, startTime, subbedAt, reading){
    let readings = Readings.availableReadings;
    if(reading !== undefined && reading !== null) readings = [reading];

    let subStartTime = new Date();
    let duration = 3000;
    let buffer = duration;

    let resultMap = {};
    readings.forEach(reading => {
      resultMap[reading] = [];
    });

    let intervalHandle = undefined;
    let runNext = _ => {
      let diff = new Date().getTime() - subStartTime.getTime();
      let newStart = new Date(startTime.getTime()+diff);
      let newEnd = new Date(newStart.getTime()+duration);

      readings.forEach(reading => {
        // Remove old data
        while(resultMap[reading].length > 1 && resultMap[reading][0].createdAt.getTime()+buffer < newStart.getTime()){
          this.removed(reading+"Readings", resultMap[reading][0]._id);
          resultMap[reading].shift();
        }

        // Add new one
        let results = Readings[reading].find({
          machineId: machineId,
          createdAt: { $gte: newStart, $lte: newEnd }
        }, { reactive: false }).fetch();

        results.forEach(result => {
          resultMap[reading].push(result);
          this.added(reading+"Readings", result._id, result);
        });

      });

      lastEnd = newEnd;
    };

    this.onStop(_ => {
      Meteor.clearInterval(intervalHandle);
    });

    // Send initial query result
    readings.forEach(reading => {
      let last = Readings.getLastReadingLog(reading, machineId, startTime);
      if(last !== undefined){
        resultMap[reading].push(last);
        this.added(reading+"Readings", last._id, last);
      }

      let results = Readings[reading].find({
        machineId: machineId,
        createdAt: { $gte: startTime, $lte: new Date(startTime.getTime() + duration) }
      }, { reactive: false }).fetch();

      results.forEach(result => {
        resultMap[reading].push(result);
        this.added(reading+"Readings", result._id, result);
      });
    });

    this.ready();

    // Start loop
    intervalHandle = Meteor.setInterval(runNext, duration);
  });
}

//// Attaching additional schemas to machine
var MachineSchema = {}
Readings.availableReadings.forEach(function(reading){
  MachineSchema[reading+"UpdatedAt"] = {
    type: Date,
    optional: true
  };
  MachineSchema[reading+"StartUpdatedAt"] = {
    type: Date,
    optional: true
  };
  if(Readings.meta[reading].type == Boolean){
    MachineSchema[reading] = {
      type: Boolean,
      optional: false
    };
  }else{
    MachineSchema[reading] = {
      type: Number,
      decimal: true,
      optional: false
    };
  }
});
Machines.attachSchema(MachineSchema);

//// Setting default valies
Readings.availableReadings.forEach(function(reading){
  Machines.defaultValue[reading] = Readings.meta[reading].defaultValue;
});

//// Utility function to set readings
Machines.setReading = function(machineId, reading, value){
  let atTime = nextMachineTimestamp(machineId);

  // Check duplicated reading
  let previousTwo = Readings[reading].find({
    machineId: machineId,
    createdAt: { $lte: atTime }
  },{
    reactive: false,
    fields: { value: 1 },
    sort: { createdAt: -1 },
    limit: 2
  }).fetch();

  if(previousTwo.length == 2 && previousTwo[0].value == previousTwo[1].value && previousTwo[0].value == value){
    // Update the first one with current time
    Readings[reading].update({ _id: previousTwo[0]._id }, { $set: { createdAt: atTime } });
    let toSet = {};
    toSet[reading] = value;
    toSet[reading+"UpdatedAt"] = atTime;
    Machines.update({ machineId: machineId }, { $set: toSet });
  }else{
    // Make another record
    Readings[reading].insert({ machineId: machineId, value: value, createdAt: atTime });
    let toSet = {};
    toSet[reading] = value;
    toSet[reading+"UpdatedAt"] = atTime;
    toSet[reading+"StartUpdatedAt"] = atTime;
    Machines.update({ machineId: machineId }, { $set: toSet });
  }
}

//// Override addMachine so that initial reading is created
let oldAddMachine = Machines.addMachine;
Machines.addMachine = function(props){
  oldAddMachine(props);
  Readings.availableReadings.forEach(reading => {
    Machines.setReading(props.machineId, reading, Readings.meta[reading].defaultValue);
  });
}

//// Utility function to get reading
Readings.getLastReadingLog = function(reading, machineId, atTime){

  if(Meteor.isClient){
    // It is possible that getting all readings, then sorting it would
    // be faster in client
    let readings = Readings[reading].find({
      machineId: machineId
    }, { reactive: false, fields: { createdAt: 1, value: 1 } }).fetch();

    readings = readings.filter(read => read.createdAt.getTime() <= atTime.getTime());
    readings.sort((rA, rB) => rA.createdAt.getTime() - rB.createdAt.getTime());

    if(readings.length == 0){
      return undefined;
    }else{
      let result = readings[readings.length-1];
      result.machineId = machineId;
      return result;
    }
  }
  return Readings[reading].findOne({
    machineId: machineId,
    createdAt: { $lte: atTime }
  }, {
    sort: { createdAt: -1 },
    limit: 1
  });
};

//// Utility function to see if the reading value is outside the 'good' range
Readings.isGoodReading = function(reading, value){
  let badHigh = Readings.meta[reading].badHigh;
  let badLow = Readings.meta[reading].badLow;
  if(value >= badHigh) return false;
  if(value <= badLow) return false;
  return true;
}
