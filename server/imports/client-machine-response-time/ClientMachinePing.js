
// This collection is used to measure response time
// from the client to arduino
//
// The client will first send a call to a method with a timestamp and machineId
// The server will then send a mesasage to the arduino containing the timestamp and connectionId
// The arduino will send back the message to the server.
// The server listen to it, and when received, add a record to this collection.
// The client will observe this collection, delete new record and calculate the
// response time based on the timestamp
export default ClientMachinePing = new Mongo.Collection("ClientMachinePing");
ClientMachinePing.attachBehaviour("timestampable");

let schema = new SimpleSchema({
  connectionId: {
    type: String,
    optional: false
  },
  machineId: {
    type: String,
    optional: false
  },
  timestamp: {
    type: Number,
    optional: false
  }
});

ClientMachinePing.attachSchema(schema);

if(Meteor.isServer){
  Meteor.publish("ClientMachinePing", connectionId => {
    return ClientMachinePing.find({ connectionId });
  });
}
