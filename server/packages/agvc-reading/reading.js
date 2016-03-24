// This file needs to be loaded first

Readings = new Mongo.Collection("readings");
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
    console.log("Subscription redeceived "+machineId+" "+reading+" "+fromDate);
    return Readings.find({ machineId: machineId, type: reading, createdAt: { $gt: fromDate } });
  });
}

_.extend(Readings, {
  availableReadings: ["temperature", "battery", "online"],
  readingTitle: {
    temperature: "Temperature",
    battery: "Battery",
    online: "Online"
  },
  readingType: {
    temperature: Number,
    battery: Number,
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

// Hook machine interface to listen for reading update
if(Meteor.isServer){
  Readings.availableReadings.forEach(function(reading){
    function callback(value, machineObj){
      if(machineObj === undefined) return;
      Machines.setReading(machineObj.machineId, reading, value);
    }
    AGVMachineHandler.registerEventHandler({
      event: "key:"+reading,
      callback: callback
    });
  });
}
