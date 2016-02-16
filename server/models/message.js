Message = new Mongo.Collection("items")

if(Meteor.isServer){
  Meteor.publish("messages", function(){
    return Message.find({});
  });
}
