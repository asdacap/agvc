
var Machines = new Mongo.Collection("machines");
Machines.attachBehaviour("timestampable");

var MachineSchema = {
  machineId: {
    type: String,
    optional: false,
    unique: true
  },
  online: {
    type: Boolean,
    optional: true
  },
  onlineOnServer: {
    type: Number,
    optional: true
  },
  onlineAt: {
    type: Date,
    optional: true
  },
  motorBaseSpeed: {
    type: Number,
    optional: false
  },
  motorLROffset: {
    type: Number,
    optional: false
  },
  motorPIDMultiplierRatio: {
    type: Number,
    decimal: true,
    optional: false
  },
  motorVoltageCompensation: {
    type: Number,
    optional: false
  },
  motorDiffRange: {
    type: Number,
    optional: false
  },
  PID_Kp: {
    type: Number,
    decimal: true,
    optional: false
  },
  PID_Ki: {
    type: Number,
    decimal: true,
    optional: false
  },
  PID_Kd: {
    type: Number,
    decimal: true,
    optional: false
  },
  lastLocationLog: {
    type: Object,
    blackbox: true,
    optional: true
  }
};

var MachineSchema = new SimpleSchema(MachineSchema);
Machines.attachSchema(MachineSchema);

Machines.defaultValue = {
  motorBaseSpeed: 200,
  motorPIDMultiplierRatio: 0.3,
  motorVoltageCompensation: 30,
  motorDiffRange: 200,
  motorLROffset: 0,
  PID_Kp: 0.95,
  PID_Ki: 0.2,
  PID_Kd: 0.03,
  online: false,
  onlineOnServer: 0,
  onlineAt: new Date(0)
}

Machines.addMachine = function(props){
  _.extend(props, Machines.defaultValue);
  Machines.insert(props);
}

Meteor.methods({
  addMachine(props){
    Machines.addMachine(props);
  },
  deleteMachine(machineId){
    Machines.remove({machineId: machineId});
  },
  editMachine(machine){
    Machines.update(machine._id, { $set: machine } );
  },
  sendCommand(machineId, command, droppable){
    Machines.sendCommand(machineId, command, droppable);
  }
});

if(Meteor.isServer){
  Meteor.publish("Machines", function(){
    return Machines.find({});
  });
  Meteor.publish("Machine", function(machineId){
    return Machines.find({ machineId });
  });

  Machines.rawCollection().ensureIndex({ machineId: 1, online: 1 }, {}, _ => _);
  Machines.rawCollection().ensureIndex({ online: 1 }, {}, _ => _);
}

_.extend(Machines, {
  markOnline(machineId){
    this.update({ machineId }, {
      $set: {
        online: true,
        onlineOnServer: process.pid,
        onlineAt: new Date()
      }
    });
    Machines.find({ machineId }).fetch().forEach(machine => {
      Machines.setReading(machine.machineId, "online", true);
    });
  },
  markOffline(machineId, force){
    let machine = Machines.findOne({ machineId });
    if(machine.onlineOnServer != process.pid && !force){
      // Outside our jurisdiction....
      return;
    }
    this.update({ machineId }, {
      $set: {
        online: false,
        onlineOnServer: process.pid,
        onlineAt: new Date()
      }
    });
    Machines.find({ machineId }).fetch().forEach(machine => {
      Machines.setReading(machine.machineId, "online", false);
    });
  },
});

export default Machines;
export { MachineSchema };
