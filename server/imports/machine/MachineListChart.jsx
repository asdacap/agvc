import React from 'react';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import { CreateMachineForm } from './MachineForm';
import MachineListChartItem from './MachineListChartItem';
import Machines from './Machines';
import Readings from '../reading/Readings';

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
  SelectField,
  MenuItem,
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
  },
  StatusButton: {
  },
  SelectReadingField: {
    marginLeft: "1ex",
    marginBottom: "-8px",
    verticalAlign: "bottom"
  }
}

export default MachineListStatus = React.createClass({
  mixins: [ReactMeteorData],
  getDefaultProps(){
    return {
      reading: Readings.availableReadings[0]
    };
  },
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return {
      openForm,
    };
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machines");
    return {
      machines: Machines.find({}).fetch(),
      openForm: this.state.openForm.get()
    };
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  goToCharts(){
    FlowRouter.go("dashboard")
  },
  handleReadingChange(e, idx, value){
    FlowRouter.go("dashboardChart", { reading: value });
  },
  render(){
    let self = this;
    return <div className="machine-lists">
      <div style={styles.MachineListPanel}>
        <RaisedButton label="Statuses" onTouchTap={this.goToCharts} style={styles.StatusButton}/>
        <SelectField value={this.props.reading}
          onChange={this.handleReadingChange}
          style={styles.SelectReadingField}>
          {
            Readings.availableReadings.map(reading => {
              return <MenuItem value={reading} primaryText={Readings.meta[reading].title} key={reading}/>;
            })
          }
        </SelectField>
      </div>
      <div style={styles.MachineListBox}>
        <div className="machines row">
          { this.data.machines.map(function(item){
            return <div className="col-lg-3 col-md-4 col-xs-12" key={item._id}>
              <MachineListChartItem machine={item} reading={self.props.reading}/>
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
