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

if(Meteor.isServer){
  Readings.availableReadings.forEach(function(reading){
    function callback(value, machineObj){
      if(machineObj === undefined) return;
      var numValue = parseInt(value, 0);
      var toSet = {};
      toSet[reading] = numValue;
      Machines.update({ machineId: machineObj.machineId }, { $set: toSet } )
      Readings.insert({ machineId: machineObj.machineId, type: reading, reading: numValue })
    }
    AGVMachineHandler.registerEventHandler({
      event: "key:"+reading,
      callback: callback
    });
  });
}
