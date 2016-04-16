
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
  commandQueue: {
    type: [MachineCommandSchema]
  }
};

var MachineSchema = new SimpleSchema(MachineSchema);
Machines.attachSchema(MachineSchema);

Machines.defaultValue = {
  commandQueue: []
}

Meteor.methods({
  addMachine(props){
    _.extend(props, Machines.defaultValue);
    Machines.insert(props);
  },
  deleteMachine(machineId){
    Machines.remove({machineId: machineId});
  },
  editMachine(machine){
    _.extend(machine, Machines.defaultValue);
    Machines.update(machine._id, { $set: machine } );
  },
  sendCommand(machineId, command, droppable){
    Machines.sendCommand(machineId, command, droppable);
  }
});

if(Meteor.isServer){
  Meteor.publish("machines", function(){
    return Machines.find({});
  });
  Meteor.publish("machine", function(machineId){
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
  sendCommand(machineId, command, droppable){
    if(droppable === undefined){
      droppable = false;
    }
    var machine = Machines.findOne({machineId: machineId});

    Machines.update(machine._id, { $push: { commandQueue: {
      command: command,
      droppable: droppable,
      createdAt: new Date()
    } } } );
  }
});

export default Machines;
