import React from 'react';
import {
  AppCanvas,
  AppBar,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn,
  List,
  ListItem,
  FlatButton,
  RaisedButton,
} from 'material-ui';
import SideNavPage from '../components/SideNavPage';
import { MachineOnlineText } from './common'
import Machines from './Machines';
import MachineStatusTab from './MachineStatusTab';
import MachineCommandQueueTab from './MachineCommandQueueTab';
import MachineMessageLogTab from './MachineMessageLogTab';
import ReadingsTab from './ReadingsTab';
import ManualTab from './ManualTab';

let styles = {
  MachineLoading: {
    textAlign: "center"
  }
};

export default MachinePage = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machineId: React.PropTypes.string
  },
  getMeteorData(){
    var handle = Meteor.subscribe("machine", this.props.machineId);
    return {
      ready: handle.ready(),
      machine: Machines.findOne({ machineId: this.props.machineId })
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title={this.props.machineId} onLeftIconButtonTouchTap={this.toggleNav}/>
            {
              !this.data.ready ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> : <Tabs>
                <Tab label="Status">
                  <MachineStatusTab machine={this.data.machine} />
                </Tab>
                <Tab label="Readings">
                  <ReadingsTab machine={this.data.machine} />
                </Tab>
                <Tab label="Command Queue">
                  <MachineCommandQueueTab machine={this.data.machine} />
                </Tab>
                <Tab label="Message Logs">
                  <MachineMessageLogTab machine={this.data.machine} />
                </Tab>
                <Tab label="Manual Control">
                  <ManualTab machine={this.data.machine} />
                </Tab>
              </Tabs>
            }
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});
