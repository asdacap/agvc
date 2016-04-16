import React from 'react';
import {
  CircularProgress,
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn,
  FlatButton,
  RaisedButton,
  Paper
} from 'material-ui';
import MessageLogs from '../message-log/MessageLogs';
import moment from 'moment';
import 'moment-duration-format';

export default MachineMessageLogTab = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    this.limit = new ReactiveVar(50);
    return {};
  },
  getMeteorData(){
    Meteor.subscribe("machineMessages", this.props.machine.machineId, this.limit.get());
    return {
      messages: MessageLogs.find({ fromMachineId: this.props.machine.machineId }, { sort: { createdAt: -1 } }).fetch()
    }
  },
  addMessageLog(){
    Meteor.call("addMessageLog", "Lalalal", this.props.machine.machineId);
  },
  clearMessageLog(){
    Meteor.call("clearMessageLog", this.props.machine.machineId);
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  onListScroll(e){
    var obj = document.body;
    if((obj.scrollTop+window.innerHeight)+5 >= obj.scrollHeight){
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
      <div>
        <FlatButton onClick={this.clearMessageLog} label="Clear" />&nbsp;
        <FlatButton onClick={this.addMessageLog} label="Click to add" />&nbsp;
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Message</TableHeaderColumn>
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
                  {duration.format("h [hrs], m [min], s [sec]")+" ago"}
                </TableRowColumn>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
});