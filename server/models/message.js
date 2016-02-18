Message = new Mongo.Collection("messages")

if(Meteor.isServer){
  Meteor.publish("messages", function(){
    return Message.find({});
  });
}
