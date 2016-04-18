import React from 'react';
import Readings from '../reading/Readings'
import GlobalStates from '../global-state/GlobalStates';

import {
  Dialog,
  Card,
  CardText,
  CardHeader,
  CardActions,
  CardTitle,
  FlatButton,
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableRowColumn,
  TextField,
  FloatingActionButton,
  Styles
} from 'material-ui';
import { EditMachineForm } from './MachineForm';
import ViewTime from '../client/ViewTime';

var styles = {
  MachineListItem: {
    display: "inline-block",
    marginRight: "20px",
    marginBottom: "20px"
  },
  Table: {
    height: "200px"
  }
};

export default MachineListItem = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    return {
      openForm: false
    };
  },
  getMeteorData(){
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time)
    }
  },
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  delete(){
    Meteor.call("deleteMachine", this.props.machine.machineId);
  },
  edit(){
    this.setState({ openForm: true });
  },
  closeEdit(){
    this.setState({ openForm: false });
  },
  sendSetting(){
    Meteor.call("sendMachineSetting", this.props.machine.machineId);
  },
  render(){
    let self = this;

    let subtitleColor = Styles.Colors.lightBlack;
    if(this.props.machine.online){
      subtitleColor = Styles.Colors.lightGreenA400;
    }

    return <Card style={styles.MachineListItem}>
      <CardTitle title={this.props.machine.machineId} subtitle={this.props.machine.online ? "Online" : "Offline"} subtitleColor={subtitleColor}/>
      <CardText>
        Readings:
        <Table selectable={false} height={ styles.Table.height }>
          <TableBody displayRowCheckbox={false}>
            { Readings.availableReadings.map(function(reading){
              return <TableRow key={reading}>
                <TableRowColumn>{Readings.meta[reading].title}</TableRowColumn>
                <TableRowColumn>{self.data.state[reading].toString()}</TableRowColumn>
              </TableRow>;
              }) }
          </TableBody>
        </Table>
        <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
      </CardText>
      <CardActions>
        <FlatButton label="Ping" onClick={this.ping}/>
        <FlatButton label="Delete" onClick={this.delete}/>
        <FlatButton label="Edit" onClick={this.edit}/>
        <FlatButton label="Send Setting" onClick={this.sendSetting} disabled={!this.props.machine.online}/>
        <FlatButton label="Open" onClick={_ => FlowRouter.go('machine', {machineId: this.props.machine.machineId})}/>
      </CardActions>
    </Card>;
  }
});
