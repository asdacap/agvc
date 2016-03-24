// This file needs to be loaded first

Readings = new Mongo.Collection("readings");
Readings.attachBehaviour("timestampable");

var ReadingSchema = new SimpleSchema({
  type: {
    type: String,
    optional: false
  },
  reading: {
    type: Number,
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

Readings.availableReadings = ["temperature", "battery"];
Readings.readingTitle = {
  temperature: "Temperature",
  battery: "Battery"
}

var MachineSchema = {}
Readings.availableReadings.forEach(function(reading){
  MachineSchema[reading] = {
    type: Number,
    optional: false
  };
});
Machines.attachSchema(MachineSchema);

// Set default value
Readings.availableReadings.forEach(function(reading){
  Machines.defaultValue[reading] = 0;
});

// Utility function to set readings
Machines.setReading = function(machineId, reading, value){
  var numValue = parseInt(value, 0);
  var toSet = {};
  toSet[reading] = numValue;
  Machines.update({ machineId: machineId }, { $set: toSet } )
  Readings.insert({ machineId: machineId, type: reading, reading: numValue })
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
