import Machines from '../Machines';

Meteor.methods({
  enterManualMode(machineId){
    Machines.sendCommand(machineId, "enterManual");
  },
  exitManualMode(machineId){
    Machines.sendCommand(machineId, "exitManual");
  },
  manualLeft(machineId){
    Machines.sendCommand(machineId, "manualLeft");
  },
  manualRight(machineId){
    Machines.sendCommand(machineId, "manualRight");
  },
  manualForward(machineId){
    Machines.sendCommand(machineId, "manualForward");
  },
  manualBackward(machineId){
    Machines.sendCommand(machineId, "manualBackward");
  },
  manualStop(machineId){
    Machines.sendCommand(machineId, "manualStop");
  }
});
