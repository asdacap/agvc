
var MessageLogs = new Mongo.Collection("messages");
MessageLogs.attachBehaviour("timestampable");

var MessageLogSchema = new SimpleSchema({
  text: {
    type: String,
    optional: false
  },
  fromMachineId: {
    type: String,
    optional: true
  }
})

MessageLogs.attachSchema(MessageLogSchema);

Meteor.methods({
  addMessageLog(text, machineId){
    if(machineId === undefined){
      MessageLogs.insert({text: text});
    }else{
      MessageLogs.insert({text: text, fromMachineId: machineId});
    }
  },
  removeMessageLog(id){
    MessageLogs.remove({_id: id});
  },
  clearMessageLog(machineId){
    if(machineId === undefined){
      MessageLogs.remove({});
    }else{
      MessageLogs.remove({ fromMachineId: machineId });
    }
  }
});

if(Meteor.isServer){
  Meteor.publish("messages", function(limit){
    return MessageLogs.find({}, { limit, sort: { createdAt: -1 } });
  });
  Meteor.publish("machineMessages", function(machineId, limit){
    return MessageLogs.find({ fromMachineId: machineId }, { limit, sort: { createdAt: -1 } });
  });
}

export default MessageLogs;
