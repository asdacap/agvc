import Machines from '../Machines';

Meteor.methods({
  sendMachineSetting(machineId){
    let machine = Machines.findOne({ machineId: machineId });
    Machines.sendCommand(machineId, "motorBaseSpeed:"+machine.motorBaseSpeed);
    Machines.sendCommand(machineId, "motorLROffset:"+machine.motorLROffset);
    Machines.sendCommand(machineId, "motorPIDMultiplier:"+machine.motorPIDMultiplier);
    Machines.sendCommand(machineId, "motorDiffRange:"+machine.motorDiffRange);
    Machines.sendCommand(machineId, "PID_Kp:"+machine.PID_Kp);
    Machines.sendCommand(machineId, "PID_Ki:"+machine.PID_Ki);
    Machines.sendCommand(machineId, "PID_Kd:"+machine.PID_Kd);
    Machines.sendCommand(machineId, "saveSettings");
  },
});
