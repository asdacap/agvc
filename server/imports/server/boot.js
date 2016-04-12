
  Meteor.startup(function(){
    startMachineTCPListener();
    startMachineWebSocketListener();
  });
