
MessageList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      messages: MessageLogs.find({}, { sort: { createdAt: -1 } }).fetch()
    }
  },
  addMessageLog(){
    Meteor.call("addMessageLog","Lalalal");
  },
  clearMessageLog(){
    Meteor.call("clearMessageLog");
  },
  sendPing(){
    Meteor.call("sendPing");
  },
  render(){
    return <div>
        <hr />
        <h2>Message Lists</h2>
        <a onClick={this.sendPing} className="btn waves-effect waves-light">Ping</a>&nbsp;
        <a onClick={this.clearMessageLog} className="btn waves-effect waves-light">Clear</a>&nbsp;
        <a onClick={this.addMessageLog} className="btn waves-effect waves-light">Click to add</a>&nbsp;
        <ul className="collection">
          {this.data.messages.map(function(message){ return <MessageView message={message} key={message._id}/>; })}
        </ul>
      </div>;
  }
});

MessageView = React.createClass({
  remove(){
    Meteor.call("removeMessageLog", this.props.message._id);
  },
  createdAtString(){
    var date = this.props.message.createdAt;
    if(date === undefined){
      return "(undefined)";
    }
    return date.toString();
  },
  render(){
    return <li onClick={this.remove} className="collection-item">
      {this.props.message.text}
      <small className="right">{this.createdAtString()}</small>
    </li>;
  }
});

if(Meteor.isClient){
  Meteor.subscribe("messages");
}
