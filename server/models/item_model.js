
Items = new Mongo.Collection("items")

Meteor.methods({
  addItem(text){
    console.log("adding "+text);
    Items.insert({text: text});
  },
  removeItem(id){
    Items.remove({_id: id});
  }
});

if(Meteor.isServer){
  Meteor.publish("items", function(){
    return Items.find({});
  });
}
