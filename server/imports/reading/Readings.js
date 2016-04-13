// This file needs to be loaded first

import Machines from '../machine/Machines';

export default Readings = new Mongo.Collection("readings");
Readings.attachBehaviour("timestampable");

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

if(Meteor.isServer){
  Meteor.publish("readings", function(machineId, reading, fromDate){
    return Readings.find({ machineId: machineId, type: reading, createdAt: { $gt: fromDate } });
  });
}

_.extend(Readings, {
  availableReadings: ["temperature", "battery", "online", "outOfCircuit"],
  readingTitle: {
    temperature: "Temperature",
    battery: "Battery",
    outOfCircuit: "Out of circuit",
    online: "Online"
  },
  readingType: {
    temperature: Number,
    battery: Number,
    outOfCircuit: Boolean,
    online: Boolean
  }
})

var MachineSchema = {}
Readings.availableReadings.forEach(function(reading){
  if(Readings.readingType[reading] == Boolean){
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

// Set default value
Readings.availableReadings.forEach(function(reading){
  if(Readings.readingType[reading] == Boolean){
    Machines.defaultValue[reading] = false;
  }else{
    Machines.defaultValue[reading] = 0;
  }
});

// Utility function to set readings
Machines.setReading = function(machineId, reading, value){
  if(Readings.readingType[reading] == Boolean){
    // Assume it is already passed as boolean
  }else{
    value = parseInt(value, 0);
  }
  var toSet = {};
  toSet[reading] = value;
  Machines.update({ machineId: machineId }, { $set: toSet } )
  Readings.insert({ machineId: machineId, type: reading, reading: value })
}
