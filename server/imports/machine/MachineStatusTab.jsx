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
import MediaQuery from 'react-responsive';
import Readings from '../reading/Readings'

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
        <ListItem primaryText={Readings.meta[reading].title}
          style={listItemStyle}
          secondaryText={secondaryText}
          onTouchTap={this.toggle} >
        </ListItem>
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
      return <ListItem primaryText={Readings.meta[reading].title}
        style={listItemStyle}
        secondaryText={secondaryText}
        onTouchTap={this.toggle} >
      </ListItem>;

    }
  }
});

let ReadingList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    StateCalculator.subscribe(this.props.machine.machineId, ViewTime.time);
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, ViewTime.time)
    }
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
        reading={reading}
        expandable={self.props.expandable}
        value={self.data.state[reading]}
        key={reading}/>;
    });
    return <List>
      {listItems}
    </List>;
  }
});

export default MachineStatusTab = React.createClass({
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
  sendSetting(){
    Meteor.call("sendMachineSetting", this.props.machine.machineId);
  },
  render(){
    var self = this;
    return <div style={styles.TopContainer}>
      {
        this.state.showMap ? <MediaQuery query='(min-width: 700px)'>
          <div style={styles.MapContainerLeft} onClick={this.toggleAllMachineMap}>
            <SingleMachineMap machineId={this.props.machine.machineId} style={styles.LeftMap}/>
          </div>
        </MediaQuery> : <span></span>
      }
      <div style={styles.StatusContainer}>
        {
          this.state.showMap ? <div onClick={this.toggleAllMachineMap}>
            <MediaQuery query='(max-width: 700px)'>
              <SingleMachineMap machineId={this.props.machine.machineId} style={styles.TopMap}/>
            </MediaQuery>
          </div> : <RaisedButton style={styles.ButtonWithMargin} label="Show Map"
          onClick={this.toggleAllMachineMap}/>
        }
        <RaisedButton style={styles.ButtonWithMargin} label="Send Setting"
          onClick={this.sendSetting} disabled={!this.props.machine.online}/>
        <RaisedButton style={styles.ButtonWithMargin} label="Delete" onClick={this.delete}/>
        <RaisedButton style={styles.ButtonWithMargin} label="Edit" onClick={this.edit}/>
        <List>
          <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
        </List>
        <ReadingList machine={this.props.machine} />
        <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
      </div>
    </div>;
  }
});

export { ReadingList };
