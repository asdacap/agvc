
// Place where initial stuff lives
injectTapEventPlugin();

if(Meteor.isServer){
  Meteor.startup(function(){
    startMachineTCPListener();
    startMachineWebSocketListener();
  });
}
