
export default LocationLogs = new Mongo.Collection("locations");
LocationLogs.attachBehaviour('timestampable');

var LocationLogSchema = {
  machineId: {
    type: String,
    optional: false
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
  },
  nextEstimatedSpeed: {
    type: Number, // 0 to 1 showing path progress
    decimal: true,
    optional: true
  }
};

LocationLogs.attachSchema(LocationLogSchema);

if(Meteor.isServer){
  Meteor.publish("LocationLogs.last", function(machineId, atTime, limit){
    if(machineId === undefined || atTime === undefined){
      console.log("Location logs missing parameters");
      return null;
    }

    if(limit === undefined) limit = 1;

    return LocationLogs.find({
      machineId: machineId,
      createdAt: { $lte: atTime }
    }, {
      sort: { createdAt: -1 },
      limit: limit
    });
  });

  Meteor.publish("LocationLogs.createdAtRange", function(machineId, startTime, endTime){
    return LocationLogs.find({
      machineId: machineId,
      createdAt: { $gte: startTime, $lte: endTime }
    });
  });
}

// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    LocationLogs.rawCollection().ensureIndex({ machineId: 1, createdAt: -1 }, {}, _ => _);
    LocationLogs.rawCollection().ensureIndex({ machineId: 1, createdAt: 1 }, {}, _ => _);
  });
}
