import React from 'react';
var MUI = require('material-ui');
var {
  AppCanvas,
  AppBar,
  FlatButton,
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn
} = MUI;

var styles = {
  AppBar: {
    marginBottom: "10px"
  }
}

MessageLogPage = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    this.limit = new ReactiveVar(50);
    return {};
  },
  getMeteorData(){
    Meteor.subscribe("messages", this.limit.get());
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
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  onListScroll(e){
    var obj = document.body;
    if((obj.scrollTop+window.innerHeight) >= obj.scrollHeight){
      if(this.limit.get() <= this.data.messages.length){
        this.limit.set(this.limit.get()+50);
      }
    }
  },
  componentDidMount(){
    var obj = document;
    obj.addEventListener("scroll", this.onListScroll);
  },
  componentWillUnmount(){
    var obj = document;
    obj.removeEventListener("scroll", this.onListScroll);
  },
  render(){
    return (
      <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Message Logs" onLeftIconButtonTouchTap={this.toggleNav} style={styles.AppBar}/>
            <FlatButton onClick={this.clearMessageLog} label="Clear" />&nbsp;
            <FlatButton onClick={this.addMessageLog} label="Click to add" />&nbsp;
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>Message</TableHeaderColumn>
                  <TableHeaderColumn>From Machine</TableHeaderColumn>
                  <TableHeaderColumn>Created At</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} ref="table_body">
                {this.data.messages.map(function(message){
                   var duration = moment.duration(moment(message.createdAt).diff(moment(), 'seconds'), 'seconds');
                   return <TableRow key={message._id}>
                     <TableRowColumn>
                       {message.text}
                     </TableRowColumn>
                     <TableRowColumn>
                       {message.fromMachineId}
                     </TableRowColumn>
                     <TableRowColumn>
                       {duration.format("h [hrs], m [min], s [sec]")+" ago"}
                     </TableRowColumn>
                   </TableRow>;
                 })}
              </TableBody>
            </Table>
          </div>
        </SideNavPage>
      </AppCanvas>
    );
  }
});
