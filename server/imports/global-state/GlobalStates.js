
// Schemaless Collection
GlobalStates = new Mongo.Collection('global_states');

if(Meteor.isServer){
  Meteor.publish("GlobalStates", function(){
    return GlobalStates.find({}); // Publish everything
  });
}

if(Meteor.isClient){
  Meteor.subscribe('GlobalStates'); // Subscribe to everything
}

export default GlobalStates;
