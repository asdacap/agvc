import React from 'react';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import { CreateMachineForm } from './MachineForm';
import MachineListItem from './MachineListItem';
import Machines from './Machines';

import {
  Dialog,
  Card,
  CardText,
  CardHeader,
  CardActions,
  CardTitle,
  FlatButton,
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableRowColumn,
  TextField,
  FloatingActionButton
} from 'material-ui';

var styles = {
  AddMachineFloatingButton: {
    position: "fixed",
    right: "10px",
    bottom: "10px"
  },
  MachineListBox: {
    padding: "10px"
  }
}

export default MachineList = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machines");
    return {
      machines: Machines.find({}).fetch(),
      openForm: this.state.openForm.get()
    }
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  render(){
    return <div className="machine-lists">
      <div style={styles.MachineListBox}>
        <div className="machines row">
          { this.data.machines.map(function(item){
            return <div className="col-lg-3 col-md-4 col-xs-12" key={item._id}>
              <MachineListItem machine={item}/>
            </div>;
          }) }
        </div>
        <FloatingActionButton onClick={this.toggleForm} style={styles.AddMachineFloatingButton}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <CreateMachineForm open={this.data.openForm} close={this.toggleForm}></CreateMachineForm>
    </div>;
  }
});
