// This file needs to be loaded first

import Machines from '../machine/Machines';

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
    type: Number
  },
  battery: {
    title: "Battery",
    defaultValue: 0,
    transformer: batteryValueTransformer,
    unit: "V",
    type: Number
  },
  responseTime: {
    title: "Response Time",
    defaultValue: 0,
    unit: "ms",
    type: Number
  },
  loopInterval: {
    title: "Loop Interval",
    defaultValue: 0,
    unit: "ms",
    type: Number
  },
  online: {
    title: "Online",
    defaultValue: false,
    type: Boolean
  },
  outOfCircuit: {
    title: "Out of circuit",
    defaultValue: false,
    type: Boolean
  },
  obstructed: {
    title: "Obstructed",
    defaultValue: false,
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
  Meteor.publish("Readings.createdAtRange", function(machineId, fromTime, endTime, reading){
    if(reading !== undefined){
      console.log("Individual reading "+machineId+" ft "+fromTime.toString()+" "+endTime.toString()+" "+reading);
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
}

//// Attaching additional schemas to machine
var MachineSchema = {}
Readings.availableReadings.forEach(function(reading){
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
  var toSet = {};
  console.log("Setting value "+value);
  toSet[reading] = value;
  Machines.update({ machineId: machineId }, { $set: toSet } )
  Readings[reading].insert({ machineId: machineId, value: value })
}


//// Utility function to get reading

Readings.getLastReadingLog = function(reading, machineId, atTime){
  return Readings[reading].findOne({
    machineId: machineId,
    createdAt: { $lte: atTime }
  }, {
    sort: { createdAt: -1 },
    limit: 1
  });
};
