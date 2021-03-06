import React from 'react';

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
import { MachineSchema } from './Machines';
import Machines from './Machines';

var MachineFormCommon = {
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      invalidKeys: this.validationContext.invalidKeys()
    }
  },
  reset(){
    this.setState(_.extend({}, this.props.machine));
  },
  validate(){
    let obj = _.extend({}, this.state);
    this.schema.clean(obj);
    return this.validationContext.validate(obj);
  },
  onFieldChange(fieldName){
    let self = this;
    return function(e){
      let newState = {};
      newState[fieldName] = e.target.value;
      self.setState(newState, _ => self.validate());
    };
  },
  close(){
    this.reset();
    this.props.close();
  },
  renderForm(){
    return <form onSubmit={this.onSubmit} style={{ overflow: "auto", height: "300px" }}>
      <div className="row">
        <div className="col-sm-12 col-md-6">
          <TextField value={this.state.machineId}
            onChange={this.onFieldChange("machineId")}
            errorText={this.validationContext.keyErrorMessage("machineId")}
            floatingLabelText="Machine ID"/><br />
          <TextField value={this.state.motorBaseSpeed}
            onChange={this.onFieldChange("motorBaseSpeed")}
            errorText={this.validationContext.keyErrorMessage("motorBaseSpeed")}
            floatingLabelText="Motor Base Speed"/><br />
          <TextField value={this.state.motorLROffset}
            onChange={this.onFieldChange("motorLROffset")}
            errorText={this.validationContext.keyErrorMessage("motorLROffset")}
            floatingLabelText="Motor Left Right Offset"/><br />
          <TextField value={this.state.motorPIDMultiplierRatio}
            onChange={this.onFieldChange("motorPIDMultiplierRatio")}
            errorText={this.validationContext.keyErrorMessage("motorPIDMultiplierRatio")}
            floatingLabelText="Motor PID Multiplier"/><br />
          <TextField value={this.state.motorVoltageCompensation}
            onChange={this.onFieldChange("motorVoltageCompensation")}
            errorText={this.validationContext.keyErrorMessage("motorVoltageCompensation")}
            floatingLabelText="Motor Voltage Compensation"/><br />
        </div>
        <div className="col-sm-12 col-md-6">
          <TextField value={this.state.motorDiffRange}
            onChange={this.onFieldChange("motorDiffRange")}
            errorText={this.validationContext.keyErrorMessage("motorDiffRange")}
            floatingLabelText="Motor Diff Range"/><br />
          <TextField value={this.state.PID_Kp}
            onChange={this.onFieldChange("PID_Kp")}
            errorText={this.validationContext.keyErrorMessage("PID_Kp")}
            floatingLabelText="PID Kp"/><br />
          <TextField value={this.state.PID_Ki}
            onChange={this.onFieldChange("PID_Ki")}
            errorText={this.validationContext.keyErrorMessage("PID_Ki")}
            floatingLabelText="PID Ki"/><br />
          <TextField value={this.state.PID_Kd}
            onChange={this.onFieldChange("PID_Kd")}
            errorText={this.validationContext.keyErrorMessage("PID_Kd")}
            floatingLabelText="PID Kd"/>
        </div>
      </div>
    </form>;
  },
  render(){

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.close}
        />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this.onSubmit}
        />
    ];

    return <Dialog
          title={this.formTitle()}
          onRequestClose={this.props.close}
          actions={actions}
          open={this.props.open}
        >
        {this.renderForm()}
      </Dialog>
  }
}

var EditMachineForm = React.createClass(_.extend({
  getInitialState(){
    this.schema = MachineSchema;
    this.validationContext = this.schema.namedContext("machineFormCommon");
    return _.extend({}, this.props.machine);
  },
  onSubmit(e){
    e.preventDefault();

    if(!this.validate()) return;

    let props = {
      _id: this.props.machine._id
    };

    ["machineId", "motorBaseSpeed", "motorLROffset",
    "motorPIDMultiplierRatio", "motorVoltageCompensation",
    "motorDiffRange", "PID_Kp", "PID_Ki", "PID_Kd"].forEach(field => {
      props[field] = this.state[field];
    });

    Meteor.call("editMachine",props);
    Meteor.call("sendMachineSetting", this.props.machine.machineId);

    this.props.close();
  },
  formTitle(){
    return "Edit Machine";
  }
}, MachineFormCommon));

var CreateMachineForm = React.createClass(_.extend({
  getInitialState(){
    this.schema = MachineSchema;
    this.validationContext = this.schema.namedContext("machineFormCommon");
    return _.extend({}, Machines.defaultValue);
  },
  onSubmit(e){
    e.preventDefault();

    if(!this.validate()) return;

    let props = {};

    ["machineId", "motorBaseSpeed", "motorLROffset",
    "motorPIDMultiplierRatio", "motorVoltageCompensation",
    "motorDiffRange", "PID_Kp", "PID_Ki", "PID_Kd"].forEach(field => {
      props[field] = this.state[field];
    });

    Meteor.call("addMachine",props);

    this.props.close();
  },
  formTitle(){
    return "Create Machine";
  }
}, MachineFormCommon));

export { EditMachineForm, CreateMachineForm };
