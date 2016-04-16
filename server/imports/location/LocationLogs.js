
export default LocationLogs = new Mongo.Collection("locations");
LocationLogs.attachBehaviour('timestampable');

var LocationLogSchema = {
  machineId: {
    type: String,
    optional: false,
    index: true
  },
  type: {
    type: String, // Either 'point' or 'path'
    optional: false
  },
  pointId: {
    type: String,
    optional: true
  },
  pathId: {
    type: String,
    optional: true
  },
  pathDirection: {
    type: Number, // 1 for forward -1 for backward
    optional: true
  },
  pathProgress: {
    type: Number, // 0 to 1 showing path progress
    optional: true
  }
};

LocationLogs.attachSchema(LocationLogSchema);

if(Meteor.isServer){
  Meteor.publish("location_logs", function(machineId, atTime){
    if(machineId === undefined || atTime === undefined){
      console.log("Location logs missing parameters");
      return null;
    }

    return LocationLogs.find({
      machineId: machineId,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });
  })
}

// Ensure index for performance
Meteor.startup(function(){
  LocationLogs.rawCollection().ensureIndex({ createdAt: 1 }, {}, _ => _);
});
