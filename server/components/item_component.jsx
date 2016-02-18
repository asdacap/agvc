
ItemList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      items: Items.find({}).fetch()
    }
  },
  addItem(){
    console.log("Clicked");
    Meteor.call("addItem","Lalalal");
  },
  sendPing(){
    Meteor.call("sendPing");
  },
  render(){
    return <div>
        <a onClick={this.sendPing}>Ping</a>
        <a onClick={this.addItem}>Click to add</a>
        {this.data.items.map(function(item){ return <ItemView item={item} />; })}
      </div>;
  }
});

ItemView = React.createClass({
  remove(){
    Meteor.call("removeItem", this.props.item._id);
  },
  render(){
    return <div key={this.props.item._id} onClick={this.remove}>{this.props.item.text}</div>;
  }
});

if(Meteor.isClient){
  Meteor.subscribe("items");
}
