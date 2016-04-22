
var Machines = new Mongo.Collection("machines");
Machines.attachBehaviour("timestampable");

var MachineCommandSchema = new SimpleSchema({
  command: {
    type: String,
    optional: false
  },
  droppable: {
    type: Boolean,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: false
  }
});

var MachineSchema = {
  machineId: {
    type: String,
    optional: false,
    index: true,
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
  motorPIDMultiplier: {
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
  commandQueue: {
    type: [MachineCommandSchema]
  }
};

var MachineSchema = new SimpleSchema(MachineSchema);
Machines.attachSchema(MachineSchema);

Machines.defaultValue = {
  commandQueue: [],
  motorBaseSpeed: 200,
  motorPIDMultiplier: 80,
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
}

_.extend(Machines, {
  markOnline(query){
    this.update(query, {
      $set: {
        online: true,
        onlineOnServer: process.pid,
        onlineAt: new Date()
      }
    });
    Machines.find(query).fetch().forEach(machine => {
      Machines.setReading(machine.machineId, "online", true);
    });
  },
  markOffline(query){
    this.update(query, {
      $set: {
        online: false,
        onlineOnServer: process.pid,
        onlineAt: new Date()
      }
    });
    Machines.find(query).fetch().forEach(machine => {
      Machines.setReading(machine.machineId, "online", false);
    });
  },
});

export default Machines;
export { MachineSchema };
