
// This collection record a particular client connection's response time
// A service in the server create and modifies this collection which
// The client subscribe to according to it's connectionId
export default ClientResponseTimes = new Mongo.Collection("ClientResponseTimes");
ClientResponseTimes.attachBehaviour("timestampable");

let schema = new SimpleSchema({
  connectionId: {
    type: String,
    optional: false
  },
  responseTime: {
    type: String,
    optional: false
  },
  previousLogs: {
    type: [Number],
    optional: false
  }
});

ClientResponseTimes.attachSchema(schema);

//// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    ClientResponseTimes.rawCollection().ensureIndex({ connectionId: 1 }, {}, _ => _);
  });
}
