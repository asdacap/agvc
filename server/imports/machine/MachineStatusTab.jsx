import React from 'react';
import {
    List,
    ListItem,
    FlatButton,
    RaisedButton
  } from 'material-ui';
import { EditMachineForm } from './MachineForm'
import ReadingHistoryChart from '../reading/ReadingHistoryChart';
import ViewTime from '../client/ViewTime';
import SingleMachineMap from '../location/SingleMachineMap';
import MediaQuery from 'react-responsive';

var styles = {
  ButtonWithMargin: {
    marginTop: "0.5em",
    marginLeft: "0.5em"
  },
  ChartContainerStyle: {
    padding: "1em",
    paddingLeft: "0.5em"
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
  }
}

let ReadingChartListItem = React.createClass({
  getInitialState(){
    return {
      open: false
    }
  },
  toggle(){
    this.setState({ open: !this.state.open });
  },
  render(){
    let reading = this.props.reading;
    let secondaryText = "";
    if(this.props.value !== undefined){
      secondaryText = this.props.value.toString();

      if(Readings.meta[reading].unit !== undefined){
        secondaryText = secondaryText + " " + Readings.meta[reading].unit;
      }
    }

    if(this.state.open){
      return <ListItem primaryText={Readings.meta[reading].title}
        secondaryText={secondaryText}
        onTouchTap={this.toggle} >
        <div style={styles.ChartContainerStyle}>
          <ReadingHistoryChart machine={this.props.machine} reading={reading} />
        </div>
      </ListItem>;
    }else{
      return <ListItem primaryText={Readings.meta[reading].title}
        secondaryText={secondaryText}
        onTouchTap={this.toggle} >
      </ListItem>;

    }
  }
});

export default MachineStatusTab = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    StateCalculator.subscribe(this.props.machine.machineId, ViewTime.time);
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time)
    }
  },
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
  sendSetting(){
    Meteor.call("sendMachineSetting", this.props.machine.machineId);
  },
  goHistoryPage(reading){
    FlowRouter.go('readingHistory', { machineId: this.props.machine.machineId, reading: reading });
  },
  render(){
    var self = this;
    var listItems = Readings.availableReadings.map(function(reading){
      return <ReadingChartListItem machine={self.props.machine} reading={reading} value={self.data.state[reading]} key={reading}/>;
    });
    return <div style={styles.TopContainer}>
      <MediaQuery query='(min-width: 700px)'>
        <div style={styles.MapContainerLeft}>
          <SingleMachineMap machineId={this.props.machine.machineId} style={styles.LeftMap}/>
        </div>
      </MediaQuery>
      <div style={styles.StatusContainer}>
        <MediaQuery query='(max-width: 700px)'>
          <SingleMachineMap machineId={this.props.machine.machineId} style={styles.TopMap}/>
        </MediaQuery>
        <RaisedButton style={styles.ButtonWithMargin} label="Send Setting" onClick={this.sendSetting} disabled={!this.props.machine.online}/>
        <RaisedButton style={styles.ButtonWithMargin} label="Delete" onClick={this.delete}/>
        <RaisedButton style={styles.ButtonWithMargin} label="Edit" onClick={this.edit}/>
        <List>
          <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
          {listItems}
        </List>
        <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
      </div>
    </div>;
  }
});
