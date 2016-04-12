import GlobalStates from '../../global-state/GlobalStates';


Meteor.methods({
  configureArduino(port, machineId){
    GlobalStates.insert({
      name: "ConfigureArduino",
      port: port,
      machineId: machineId
    });
  }
});
