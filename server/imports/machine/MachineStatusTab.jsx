import React from 'react';
import {
    List,
    ListItem,
    FlatButton,
    RaisedButton
  } from 'material-ui';
import { EditMachineForm } from './MachineForm'

var styles = {
  ButtonWithMargin: {
    marginTop: "0.5em",
    marginLeft: "0.5em"
  }
}

export default MachineStatusTab = React.createClass({
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
      var secondaryText = "";
      if(self.props.machine[reading] !== undefined){
        secondaryText = self.props.machine[reading].toString();
      }
      return <ListItem key={reading}
          primaryText={Readings.meta[reading].title} secondaryText={secondaryText} />;
    });

    return <div>
      <RaisedButton style={styles.ButtonWithMargin} label="Send Setting" onClick={this.sendSetting} disabled={!this.props.machine.online}/>
      <RaisedButton style={styles.ButtonWithMargin} label="Delete" onClick={this.delete}/>
      <RaisedButton style={styles.ButtonWithMargin} label="Edit" onClick={this.edit}/>
      <List>
        <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
        {listItems}
        <ListItem primaryText="JSON" secondaryText={JSON.stringify(this.props.machine)} />
      </List>
      <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
    </div>;
  }
});
