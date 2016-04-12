import React from 'react';
import { AppCanvas,
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
    Paper
  } from 'material-ui';
import SideNavPage from '../SideNavPage';
import { MachineOnlineText } from './common'
import { EditMachineForm } from './MachineForm'
import ReadingHistoryChart from './ReadingHistoryChart'
import moment from 'moment';
import 'moment-duration-format';

var styles = {
  MachineLoading: {
    textAlign: "center"
  },
  ButtonWithMargin: {
    marginLeft: "0.5em"
  },
  ReadingTab: {
    Content: {
      padding: "1ex"
    }
  },
  ChartStyle: {
    padding: "1ex"
  }
}

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
              </Tabs>
            }
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

var MachineStatusTab = React.createClass({
  getInitialState(){
    return {
      openForm: false
    };
  },
  delete(){
    if(confirm("Are you sure?")){
      Meteor.call("deleteMachine", this.props.machine.machineId);
      FlowRouter.go('dashboard');
    }
  },
  edit(){
    this.setState({ openForm: true });
  },
  closeEdit(){
    this.setState({ openForm: false });
  },
  goHistoryPage(reading){
    FlowRouter.go('readingHistory', { machineId: this.props.machine.machineId, reading: reading });
  },
  render(){
    var self = this;
    var listItems = Readings.availableReadings.map(function(reading){
      return <ListItem
          primaryText={Readings.readingTitle[reading]} secondaryText={self.props.machine[reading].toString()} />;
    });

    return <div>
      <List>
        <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
        <ListItem primaryText="Online Status" secondaryText={<MachineOnlineText machine={this.props.machine} />} />
        {listItems}
        <ListItem primaryText="JSON" secondaryText={JSON.stringify(this.props.machine)} />
      </List>
      <RaisedButton style={styles.ButtonWithMargin} label="Delete" onClick={this.delete}/>
      <RaisedButton style={styles.ButtonWithMargin} label="Edit" onClick={this.edit}/>
      <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
    </div>;
  }
});

var MachineCommandQueueTab = React.createClass({
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  render(){
    return (
      <div>
        <RaisedButton label="Ping" onClick={this.ping}/>
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            { this.props.machine.commandQueue.map(function(command, idx){
              return <TableRow key={idx}>
                <TableRowColumn>{command.command}</TableRowColumn>
              </TableRow>;
              }) }
          </TableBody>
        </Table>
      </div>
    );
  }
});

var MachineMessageLogTab = React.createClass({
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
    console.log("on scroll "+(obj.scrollTop+window.innerHeight)+" and "+obj.scrollHeight);
    if((obj.scrollTop+window.innerHeight)+5 >= obj.scrollHeight){
      console.log("passes");
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

var ReadingsTab = function(props){
  var charts = Readings.availableReadings.map(function(reading){
    return <div className="col-lg-4 col-md-6 col-xs-12">
      <Paper style={styles.ChartStyle}>
        <div>{Readings.readingTitle[reading]}</div>
        <ReadingHistoryChart machine={props.machine} reading={reading} key={reading} />
      </Paper>
    </div>
  });
  return <div className="row" style={styles.ReadingTab.Content}>{charts}</div>;
};
