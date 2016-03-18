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
  Meteor.publish("readings", function(machineId, from){
    return Readings.find({ machineId: machineId, createdAt: { $gt: from } });
  });
}

AVAILABLE_READINGS = ["temperature", "battery"];
