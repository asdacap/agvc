import React from 'react';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { CreateMachineForm } from './MachineForm';
import MachineListItem from './MachineListItem';
import Machines from './Machines';
import Settings from '../Settings';

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
  },
  MachineListPanel: {
    padding: "1ex"
  }
}

export default MachineListStatus = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machines");
    return {
      ready: handle.ready(),
      machines: Machines.find({}, {
        skip: this.props.page*Settings.per_page_machine_count,
        limit: Settings.per_page_machine_count,
        reactive: false
      }).fetch(),
      count: Machines.find({}).count(),
      openForm: this.state.openForm.get()
    }
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  goToCharts(){
    FlowRouter.go("dashboardChart")
  },
  render(){

    let pages = [];
    for(let i = 0;i*Settings.per_page_machine_count<this.data.count;i++){
      pages.push(i);
    }

    return <div className="machine-lists">
      <div style={styles.MachineListPanel}>
        <RaisedButton label="Reading Charts" style={{ marginRight: "1ex" }} onTouchTap={this.goToCharts}/>
        {pages.map(page_num => {
          return <RaisedButton label={"Page "+(page_num+1)}
            disabled={this.props.page == page_num}
            key={page_num}
            onTouchTap={_ => FlowRouter.go("dashboard", {}, {page: page_num}) }/>
        })}
      </div>
      <div style={styles.MachineListBox}>
        <div className="machines row">
          { this.data.machines.map(function(item){
            return <div className="col-lg-3 col-md-4 col-xs-12" key={item._id}>
              <MachineListItem machine={item}/>
            </div>;
          }) }
        </div>
        <FloatingActionButton onTouchTap={this.toggleForm} style={styles.AddMachineFloatingButton}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <CreateMachineForm open={this.data.openForm} close={this.toggleForm}></CreateMachineForm>
    </div>;
  }
});
