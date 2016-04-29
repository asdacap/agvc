
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
    unique: true
  },
  commandQueue: {
    type: [CommandSchema]
  }
};

let Schema = new SimpleSchema(schema);
CommandQueues.attachSchema(Schema);

CommandQueues.getForMachine = function(machineId, fields){
  if(fields === undefined){
    fields = {
      machineId: 1,
      commandQueue: 1
    };
  }

  let machine = CommandQueues.findOne({ machineId }, { fields: fields, reactive: false });
  if(machine !== undefined){
    return machine;
  }
  CommandQueues.insert({ machineId, commandQueue: [] });
  return CommandQueues.findOne({ machineId }, { fields: fields, reactive: false });
}

if(Meteor.isServer){
  Meteor.publish("CommandQueues.forMachine", (machineId) => {
    return CommandQueues.find({ machineId });
  });
}

export default CommandQueues;
