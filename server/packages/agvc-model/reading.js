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
