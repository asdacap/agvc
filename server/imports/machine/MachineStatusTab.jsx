import React from 'react';
import {
    List,
    ListItem,
    FlatButton,
    RaisedButton,
    SelectField,
    MenuItem,
    Paper
  } from 'material-ui';
import { EditMachineForm } from './MachineForm'
import ReadingHistoryChart from '../reading/ReadingHistoryChart';
import ViewTime from '../client/ViewTime';
import SingleMachineMap from '../location/SingleMachineMap';
import Settings from '../Settings';
import MediaQuery from 'react-responsive';
import Readings from '../reading/Readings'
import ClientMachineResponseTime from '../client-machine-response-time/client/ClientMachineResponseTime';
import NoRerenderContainer from '../components/NoRerenderContainer';
import StateCalculator from '../machine/StateCalculator';
import LiveStateCalculator from '../machine/LiveStateCalculator';

var styles = {
  ButtonWithMargin: {
    marginTop: "0.5em",
    marginLeft: "0.5em"
  },
  ChartContainerStyle: {
    padding: "1em",
  },
  TopContainer: {
    display: "flex",
  },
  MapContainerLeft: {
    flex: "0 0 auto",
    display: "flex",
    flexWrap: "wrap",
    width: "300px",
    flexDirection: "column"
  },
  LeftMap: {
    flex: "1 0 auto",
  },
  StatusContainer: {
    flex: "1 1 auto",
  },
  TopMap: {
    maxHeight: "300px",
    width: "100%",
  },
  Expanded: {
    backgroundColor: "#e7e7e7"
  },
  badValueColor: "#ffdd29"
}

let NListItem = NoRerenderContainer(ListItem, false, [], ["secondaryText"]);

let ReadingChartListItem = React.createClass({
  getInitialState(){
    return {
      open: false,
      range: "minute"
    }
  },
  toggle(){
    if(!this.props.expandable) return;
    this.setState({ open: !this.state.open });
  },
  handleRangeChange(e, idx, value){
    this.setState({ range: value });
  },
  render(){
    let reading = this.props.reading;
    let secondaryText = "";
    if(this.props.value !== undefined){
      secondaryText = this.props.value;

      if(Readings.meta[reading].formatter !== undefined){
        secondaryText = Readings.meta[reading].formatter(secondaryText);
      }

      // Making sure its string
      secondaryText = secondaryText.toString();

      if(Readings.meta[reading].unit !== undefined){
        secondaryText = secondaryText + " " + Readings.meta[reading].unit;
      }
    }

    // Show alert if bad value
    let listItemStyle = {};
    if(!Readings.isGoodReading(reading, this.props.value)){
      listItemStyle.backgroundColor = styles.badValueColor;
    }

    if(this.state.open){
      return <div style={styles.Expanded}>
        <NListItem primaryText={Readings.meta[reading].title}
          style={listItemStyle}
          secondaryText={secondaryText}
          onTouchTap={this.toggle} >
        </NListItem>
        <div style={styles.ChartContainerStyle}>
          <SelectField value={this.state.range}
            floatingLabelText="Readng period"
            underlineStyle={{ borderColor: "#000000" }}
            onChange={this.handleRangeChange}>
            <MenuItem value="minute" primaryText="1 minute" />
            <MenuItem value="10minute" primaryText="10 minute" />
            <MenuItem value="hour" primaryText="1 hour" />
          </SelectField>
          <ReadingHistoryChart machine={this.props.machine} reading={reading} range={this.state.range}/>
        </div>
      </div>;
    }else{
      return <NListItem primaryText={Readings.meta[reading].title}
        style={listItemStyle}
        secondaryText={secondaryText}
        onTouchTap={this.toggle} >
      </NListItem>;

    }
  }
});

let ReadingList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){

    let machineStateReady = undefined;
    let machineState = undefined;

    if(this.props.machineState !== undefined){
      machineStateReady = this.props.machineStateReady;
      machineState = this.props.machineState;
    }else{
      machineStateReady = StateCalculator.subscribe(this.props.machine.machineId, ViewTime.time);
      machineState = StateCalculator.calculate(this.props.machine.machineId, ViewTime.time);
    }

    return { machineStateReady, machineState };
  },
  getDefaultProps(){
    return {
      expandable: true
    };
  },
  render(){
    let self = this;
    var listItems = Readings.availableReadings.map(function(reading){
      return <ReadingChartListItem
        machine={self.props.machine}
        machineState={self.props.machineState}
        reading={reading}
        expandable={self.props.expandable}
        value={self.data.machineState[reading]}
        key={reading}/>;
    });
    return <List>
      {listItems}
    </List>;
  }
});

export default MachineStatusTab = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    let clientMachineResponseTime = 0;

    let record = ClientMachineResponseTime.findOne({machineId: this.props.machine.machineId});
    if(record !== undefined){
      clientMachineResponseTime = record.responseTime;
    }

    let machineStateReady = false;
    let machineState = undefined;
    if(ViewTime.mode == "live"){
      ViewTime.time; // For the update
      machineStateReady = true;
      machineState = LiveStateCalculator.calculate(
        this.props.machine.machineId,
        this.props.machine,
        _.extend({}, LiveStateCalculator.defaultCalculateStateOptions, { position: false }));
    }else{

      let atTime = ViewTime.time;
      if(ViewTime.playing){
        // We will use rolling subscription
        if(!this.rollingFrom){
          this.rollingFrom = atTime;
          this.subscribedAt = new Date();
        }
        ready = StateCalculator.rollingSubscribe(this.props.machine.machineId, this.rollingFrom, this.subscribedAt);
      }else{
        if(this.rollingFrom){
          this.rollingFrom = undefined;
          this.subscribedAt = undefined;
        }
        ready = StateCalculator.subscribe(this.props.machine.machineId, atTime);
      }

      machineState = StateCalculator.calculate(
        this.props.machine.machineId,
        ViewTime.time,
        _.extend({}, LiveStateCalculator.defaultCalculateStateOptions, { position: false }));
    }

    return {
      clientMachineResponseTime,
      machineStateReady,
      machineState
    }
  },
  getInitialState(){
    return {
      openForm: false,
      showMap: true
    };
  },
  delete(){
    if(confirm("Are you sure?")){
      Meteor.call("deleteMachine", this.props.machine.machineId);
      FlowRouter.go('dashboard');
    }
  },
  toggleAllMachineMap(){
    this.setState({ showMap: !this.state.showMap });
  },
  edit(){
    this.setState({ openForm: true });
  },
  closeEdit(){
    this.setState({ openForm: false });
  },
  render(){
    var self = this;
    return <div style={styles.TopContainer}>
      {
        this.state.showMap ? <MediaQuery query='(min-width: 700px)'>
          <div style={styles.MapContainerLeft} onTouchTap={this.toggleAllMachineMap}>
            <SingleMachineMap machineId={this.props.machine.machineId} style={styles.LeftMap}
              machineState={this.data.machineState} machineStateReady={this.data.machineStateReady}/>
          </div>
        </MediaQuery> : <span></span>
      }
      <div style={styles.StatusContainer}>
        {
          this.state.showMap ? <div onTouchTap={this.toggleAllMachineMap}>
            <MediaQuery query='(max-width: 700px)'>
              <SingleMachineMap machineId={this.props.machine.machineId} style={styles.TopMap}
              machineState={this.data.machineState} machineStateReady={this.data.machineStateReady}/>
            </MediaQuery>
          </div> : <RaisedButton style={styles.ButtonWithMargin} label="Show Map"
          onTouchTap={this.toggleAllMachineMap}/>
        }
        <RaisedButton style={styles.ButtonWithMargin} label="Delete" onTouchTap={this.delete}/>
        <RaisedButton style={styles.ButtonWithMargin} label="Edit" onTouchTap={this.edit}/>
        <List>
          <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
          <ListItem primaryText="Client-Machine response time" secondaryText={this.data.clientMachineResponseTime} />
        </List>
        <ReadingList machine={this.props.machine} machineState={this.data.machineState} machineStateReady={this.data.machineStateReady} />
        <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
      </div>
    </div>;
  }
});

export { ReadingList };
