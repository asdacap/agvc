
// Schemaless Collection
GlobalStates = new Mongo.Collection('global_states');

if(Meteor.isServer){
  Meteor.publish("global_states", function(){
    return GlobalStates.find({}); // Publish everything
  });
}

if(Meteor.isClient){
  Meteor.subscribe('global_states'); // Subscribe to everything
}
