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
  "manualMode"
];

Readings.meta = {
  temperature: {
    title: "Temperature",
    defaultValue: 0,
    type: Number
  },
  battery: {
    title: "Battery",
    defaultValue: 0,
    type: Number
  },
  responseTime: {
    title: "Response Time",
    defaultValue: 0,
    type: Number
  },
  loopInterval: {
    title: "Loop Interval",
    defaultValue: 0,
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
  Meteor.publish("readings", function(machineId, reading, fromDate){
    return Readings.find({ machineId: machineId, type: reading, createdAt: { $gt: fromDate } });
  });
  Meteor.publish("readingState", function(machineId, reading, atTime){

    return Readings.find({
      machineId: machineId,
      type: reading,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });

    let self = this;
    let readings = Readings.find({
      machineId: machineId,
      type: reading,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    }).fetch().forEach(function(doc){
      self.added('readings', doc._id, doc);
    });

    self.ready();
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
      optional: false
    };
  }
});
Machines.attachSchema(MachineSchema);

//// Utility function to set readings
Machines.setReading = function(machineId, reading, value){
  if(Readings.meta[reading].type == Boolean){
    // Assume it is already passed as boolean
  }else{
    value = parseInt(value, 0);
  }
  var toSet = {};
  toSet[reading] = value;
  Machines.update({ machineId: machineId }, { $set: toSet } )
  Readings.insert({ machineId: machineId, type: reading, reading: value })
}

//// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    Readings.rawCollection().ensureIndex({ createdAt: 1, type: 1, machineId: 1 }, {}, _ => _);
  });
}
