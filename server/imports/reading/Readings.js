// This file needs to be loaded first

import Machines from '../machine/Machines';

export default Readings = new Mongo.Collection("readings");
Readings.attachBehaviour("timestampable");

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

//// Schemas
var ReadingSchema = new SimpleSchema({
  type: {
    type: String,
    optional: false
  },
  reading: {
    type: "none", // None as some reading is of type boolean
    optional: false
  },
  machineId: {
    type: String,
    optional: false
  }
});

Readings.attachSchema(ReadingSchema);

//// Publications
if(Meteor.isServer){
  Meteor.publish("Readings.fromDate", function(machineId, reading, fromDate){
    return Readings.find({ machineId: machineId, type: reading, createdAt: { $gt: fromDate } });
  });
  Meteor.publish("Readings.last", function(machineId, reading, atTime){
    let readings = Readings.find({
      machineId: machineId,
      type: reading,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });

    return readings;
  });
  Meteor.publish("Readings.createdAtRange", function(machineId, reading, fromTime, endTime){
    let readings = Readings.find({
      machineId: machineId,
      type: reading,
      createdAt: { $gte: fromTime, $lte: endTime }
    });

    return readings;
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
  toSet[reading] = value;
  Machines.update({ machineId: machineId }, { $set: toSet } )
  Readings.insert({ machineId: machineId, type: reading, reading: value })
}


//// Utility function to get reading

Readings.getLastReadingLog = function(reading, machineId, atTime){
  return Readings.findOne({
    machineId: machineId,
    createdAt: { $lte: atTime },
    type: reading
  }, {
    sort: { createdAt: -1 },
    limit: 1
  });
};

//// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    Readings.rawCollection().ensureIndex({ type: 1, machineId: 1, createdAt: -1 }, {}, _ => _);
    Readings.rawCollection().ensureIndex({ type: 1, machineId: 1, createdAt: 1 }, {}, _ => _);
  });
}
