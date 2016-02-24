
MessageLogs = new Mongo.Collection("messages");
MessageLogs.attachBehaviour("timestampable");

Meteor.methods({
  addMessageLog(text){
    console.log("adding "+text);
    MessageLogs.insert({text: text});
  },
  removeMessageLog(id){
    MessageLogs.remove({_id: id});
  },
  clearMessageLog(){
    MessageLogs.remove({});
  }
});

if(Meteor.isServer){
  Meteor.publish("messages", function(){
    return MessageLogs.find({});
  });
}
