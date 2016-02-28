
Machines = new Mongo.Collection("machines");
Machines.attachBehaviour("timestampable");

var MachineCommandSchema = new SimpleSchema({
  command: {
    type: String,
    optional: false
  },
  droppable: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    optional: false
  }
});

var MachineSchema = new SimpleSchema({
  machineId: {
    type: String,
    optional: false,
    index: true,
    unique: true
  },
  commandQueue: {
    type: [MachineCommandSchema]
  }
});

Machines.attachSchema(MachineSchema);

Meteor.methods({
  addMachine(props){
    _.extend(props, {
      commandQueue: []
    });

    Machines.insert(props);
  },
  sendCommand(machineId, command, droppable){
    if(droppable === undefined){
      droppable = false;
    }
    var machine = Machines.findOne({machineId: machineId});

    if(machine === undefined){
      console.log("Machine not found. machineId: "+machineId);
      return;
    }

    machine.commandQueue.push({
      command: command,
      droppable: droppable,
      createdAt: new Date()
    });

    Machines.update(machine._id, machine);
  }
});

if(Meteor.isServer){
  Meteor.publish("machines", function(){
    return Machines.find({});
  });
}
