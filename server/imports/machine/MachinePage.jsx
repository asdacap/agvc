import React from 'react';
import {
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
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import SideNavPage from '../components/SideNavPage';
import { MachineOnlineText } from './common'
import Machines from './Machines';
import MachineStatusTab from './MachineStatusTab';
import MachineMessageLogTab from './MachineMessageLogTab';
import ManualTab from './ManualTab';
import ResponseTimeIndicator from '../client-response-time/ResponseTimeIndicator';
import ViewTimeToolbar from '../components/ViewTimeToolbar';
import NoRerenderContainer from '../components/NoRerenderContainer';

let NViewTimeToolbar = NoRerenderContainer(ViewTimeToolbar);

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
    var handle = Meteor.subscribe("Machine", this.props.machineId);
    return {
      ready: handle.ready(),
      machine: Machines.findOne({ machineId: this.props.machineId })
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  changePage(value){
    FlowRouter.go('machine', { machineId: this.props.machineId, page: value });
  },
  render() {

    let page = "status";
    if(this.props.page !== undefined
      && _.contains(["status", "message_logs", "manual_control"], this.props.page)
     ){
       page = this.props.page;
    }

    let page_component = "";

    if(this.data.ready){
      if(page == "status"){
        page_component = <MachineStatusTab machine={this.data.machine} />;
      }else if(page == "message_logs"){
        page_component = <MachineMessageLogTab machine={this.data.machine} />;
      }else if(page == "manual_control"){
        page_component = <ManualTab machine={this.data.machine} />;
      }
    }

    return <MuiThemeProvider muiTheme={getMuiTheme()}>
        <SideNavPage ref="navPage">
          <div>
            <NViewTimeToolbar title={this.props.machineId} toggleNav={this.toggleNav} />
            {
              !this.data.ready ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> : <div>
                <Tabs value={page} onChange={this.changePage}>
                  <Tab label="Status" value="status" reading={this.props.reading} />
                  <Tab label="Message Logs" value="message_logs" />
                  <Tab label="Manual Control" value="manual_control" />
                </Tabs>
                { page_component }
              </div>
            }
            <ResponseTimeIndicator />
          </div>
        </SideNavPage>
      </MuiThemeProvider>;
  }
});
