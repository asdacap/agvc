import Machines from '../Machines';

Meteor.methods({
  enterManualMode(machineId){
    Machines.sendCommand(machineId, "enterManual");
  },
  exitManualMode(machineId){
    Machines.sendCommand(machineId, "exitManual");
  },
  manualLeft(machineId){
    Machines.sendCommand(machineId, "manualLeft", true);
  },
  manualRight(machineId){
    Machines.sendCommand(machineId, "manualRight", true);
  },
  manualForward(machineId){
    Machines.sendCommand(machineId, "manualForward", true);
  },
  manualBackward(machineId){
    Machines.sendCommand(machineId, "manualBackward", true);
  },
  manualStop(machineId){
    Machines.sendCommand(machineId, "manualStop");
  }
});
