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
  RaisedButton,
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
import ArrowForward from 'material-ui/lib/svg-icons/navigation/arrow-forward';

var styles = {
  MachineListItem: {
    marginRight: "20px",
    marginBottom: "20px"
  },
  Table: {
    height: "200px"
  }
};

export default MachineListItem = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time)
    }
  },
  render(){
    let self = this;

    let subtitleColor = Styles.Colors.lightBlack;
    if(this.props.machine.online){
      subtitleColor = Styles.Colors.lightGreenA400;
    }

    return <Card style={styles.MachineListItem}>
      <CardTitle title={this.props.machine.machineId}
         subtitle={this.data.state.status} subtitleColor={subtitleColor}
         actAsExpander={true}
         showExpandableButton={true}/>
      <CardText expandable={true}>
        <Table selectable={false} height={ styles.Table.height }>
          <TableBody displayRowCheckbox={false}>
            { Readings.availableReadings.map(function(reading){
              let value = self.data.state[reading].toString();
              if(Readings.meta[reading].unit !== undefined){
                value = value + " " + Readings.meta[reading].unit;
              }

              return <TableRow key={reading}>
                <TableRowColumn>{Readings.meta[reading].title}</TableRowColumn>
                <TableRowColumn>{value}</TableRowColumn>
              </TableRow>;
              }) }
          </TableBody>
        </Table>
      </CardText>
      <CardActions>
        <RaisedButton label="Open" onClick={_ => FlowRouter.go('machine', {machineId: this.props.machine.machineId})} icon={<ArrowForward />}/>
      </CardActions>
    </Card>;
  }
});
