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
import NoRerenderContainer from '../components/NoRerenderContainer';
import StateCalculator from './StateCalculator';
import LiveStateCalculator from './LiveStateCalculator';
import Machines from './Machines';

let NTableRow = NoRerenderContainer(TableRow, false, ["style"]);
let NCardTitle = NoRerenderContainer(CardTitle, false, ["style"]);
let NCardActions = NoRerenderContainer(CardActions, true);

var styles = {
  MachineListItem: {
    marginRight: "20px",
    marginBottom: "20px"
  },
  Table: {
    height: "400px"
  },
  CardHeaderBackgroundOnStatus: {
    offline: "#fc3b3b",
    outOfCircuit: "#ffdd29",
    obstructed: "#ffdd29",
    manualMode: "#299fff",
  },
  badValueColor: "#ffdd29"
};

export default MachineListItem = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){

    // Position is not needed
    let opts = _.extend({}, StateCalculator.defaultCalculateStateOptions, { position: false });

    if(ViewTime.mode == "live"){
      // Should be subscribed by the parent
      let machine = Machines.findOne({ machineId: this.props.machine.machineId });
      return {
        state: LiveStateCalculator.calculate(this.props.machine.machineId, machine, opts)
      }
    }else{
      StateCalculator.subscribe(this.props.machine.machineId, ViewTime.time);

      return {
        state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time, opts)
      }
    }
  },
  render(){
    let self = this;

    let titleStyle = {
      backgroundColor: "#ffffff"
    };

    if(styles.CardHeaderBackgroundOnStatus[this.data.state.status] !== undefined){
      titleStyle.backgroundColor = styles.CardHeaderBackgroundOnStatus[this.data.state.status];
    }

    return <Card style={styles.MachineListItem} initiallyExpanded={true}>
      <NCardTitle title={this.props.machine.machineId}
         subtitle={this.data.state.status}
         actAsExpander={true}
         style={titleStyle}
         showExpandableButton={true}/>
      <CardText expandable={true}>
        <Table selectable={false} height={ styles.Table.height }>
          <TableBody displayRowCheckbox={false}>
            { Readings.availableReadings.map(function(reading){
              let rawValue = self.data.state[reading];

              let value = rawValue;

              if(Readings.meta[reading].formatter !== undefined){
                value = Readings.meta[reading].formatter(value);
              }

              value = value.toString();

              if(Readings.meta[reading].unit !== undefined){
                value = value + " " + Readings.meta[reading].unit;
              }

              // Show alert if bad value
              let style = {};
              if(!Readings.isGoodReading(reading, rawValue)){
                style.backgroundColor = styles.badValueColor;
              }

              // Value is just to prevent it from rerendering
              return <NTableRow key={reading} style={style} value={value}>
                <TableRowColumn>{Readings.meta[reading].title}</TableRowColumn>
                <TableRowColumn>{value}</TableRowColumn>
              </NTableRow>;
              }) }
          </TableBody>
        </Table>
      </CardText>
      <NCardActions>
        <RaisedButton label="Open" onTouchTap={_ => FlowRouter.go('machine', {machineId: this.props.machine.machineId})} icon={<ArrowForward />}/>
      </NCardActions>
    </Card>;
  }
});
