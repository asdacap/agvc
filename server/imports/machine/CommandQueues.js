
let CommandQueues = new Mongo.Collection("CommandQueues");
CommandQueues.attachBehaviour("timestampable");

let CommandSchema = new SimpleSchema({
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

let schema = {
  machineId: {
    type: String,
    optional: false,
    index: true,
    unique: true
  },
  commandQueue: {
    type: [CommandSchema]
  }
};

let Schema = new SimpleSchema(schema);
CommandQueues.attachSchema(Schema);

CommandQueues.getForMachine = function(machineId){
  let machine = CommandQueues.findOne({ machineId });
  if(machine !== undefined){
    return machine;
  }
  CommandQueues.insert({ machineId, commandQueue: [] });
  return CommandQueues.findOne({ machineId });
}

if(Meteor.isServer){
  Meteor.publish("CommandQueues.forMachine", (machineId) => {
    return CommandQueues.find({ machineId });
  });
}

export default CommandQueues;
