import GlobalStates from '../global-state/GlobalStates'

// Needed to syncronize time on client and server

// Periodically set the server time
if(Meteor.isServer){
  if(GlobalStates.find({ name: "serverTime" }).count() === 0){
    GlobalStates.insert({ name: "serverTime", serverTime: new Date() });
  }
  Meteor.setInterval(function(){
    GlobalStates.update({ name: "serverTime" }, { $set: { serverTime: new Date() } });
  }, 10000);
}

if(Meteor.isClient){

  var lastObtained = new Date();
  var serverTime = new Date();

  // Listen to change and set the serverTime
  GlobalStates.find({ name: "serverTime" }).observe({
    changed(newDocument, oldDocument){
      serverTime = newDocument.serverTime;
      lastObtained = new Date();
    }
  });

  // First fetch
  if(GlobalStates.find({ name: "serverTime" }).count() !== 0){
    serverTime = GlobalStates.findOne({ name: "serverTime" }).serverTime;
  }

  // Calculate the offset between lastObtained and current time
  // to calculate actual serverTime
  GlobalStates.getServerTime = function(){
    var offset = (new Date()).getTime() - lastObtained.getTime();
    var actual = serverTime.getTime()+offset;
    return new Date(actual);
  }
}
