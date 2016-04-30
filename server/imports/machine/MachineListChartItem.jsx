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
import ArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import ReadingHistoryChart from '../reading/ReadingHistoryChart';

var styles = {
  MachineListItem: {
    marginRight: "20px",
    marginBottom: "20px"
  },
  Table: {
    height: "200px"
  },
  CardHeaderBackgroundOnStatus: {
    offline: "#ffdd29",
    outOfCircuit: "#ffdd29",
    obstructed: "#ffdd29",
    manualMode: "#299fff",
  }
};

export default MachineListChartItem = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object.isRequired,
    range: React.PropTypes.string.isRequired,
    reading: React.PropTypes.string.isRequired
  },
  getMeteorData(){
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time)
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

    return <Card style={styles.MachineListItem}>
      <CardHeader title={this.props.machine.machineId}
         subtitle={this.data.state.status}
         style={titleStyle}/>
      <CardText>
        <ReadingHistoryChart machine={this.props.machine} reading={this.props.reading} range={this.props.range}/>
      </CardText>
      <CardActions>
        <RaisedButton label="Open" onTouchTap={_ => FlowRouter.go('machine', {machineId: this.props.machine.machineId})} icon={<ArrowForward />}/>
      </CardActions>
    </Card>;
  }
});
