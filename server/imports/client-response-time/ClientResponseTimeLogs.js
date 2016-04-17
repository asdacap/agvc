
// This collection will act as 'ping' from the server.
// The server will periodically save this log which the client will subscribe to
// The client will then send the id of the log back to the server. The server will
// then do some calculation to determine the round trip time
export default ClientResponseTimeLogs = new Mongo.Collection("ClientResponseTimeLogs");
ClientResponseTimeLogs.attachBehaviour("timestampable");

let schema = new SimpleSchema({
  connectionId: {
    type: String,
    optional: false
  }
});

ClientResponseTimeLogs.attachSchema(schema);

//// Ensure index for performance
if(Meteor.isServer){
  Meteor.startup(function(){
    ClientResponseTimeLogs.rawCollection().ensureIndex({ connectionId: 1 }, {}, _ => _);
  });
}
