var {
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
} = MUI;

var MachineFormCommon = {
  onMachineIdChange(e){
    this.setState({ machineId: e.target.value }, this.checkValid);
  },
  checkValid(){
    this.setState({ machineIdErrorText: ""});

    var valid = true;
    if(this.state.machineId.trim() === ""){
      this.setState({ machineIdErrorText: "machineId must be specified"});
      valid = false;
    }

    return valid;
  },
  renderForm(){
    return <form onSubmit={this.onSubmit}>
      <TextField value={this.state.machineId} onChange={this.onMachineIdChange} errorText={this.state.machineIdErrorText} floatingLabelText="Machine ID"/>
    </form>;
  },
  render(){

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.props.close}
        />,
      <FlatButton
        label="Submit"
        primary={true}
        onClick={this.onSubmit}
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

EditMachineForm = React.createClass(_.extend({
  getInitialState(){
    return {
      machineId: this.props.machine.machineId
    };
  },
  onSubmit(e){
    e.preventDefault();

    if(!this.checkValid()) return;

    Meteor.call("editMachine",{
      _id: this.props.machine._id,
      machineId: this.state.machineId
    });

    this.props.close();
  },
  formTitle(){
    return "Edit Machine";
  }
}, MachineFormCommon));

CreateMachineForm = React.createClass(_.extend({
  getInitialState(){
    return {
      machineId: ""
    };
  },
  onSubmit(e){
    e.preventDefault();

    if(!this.checkValid()) return;

    Meteor.call("addMachine",{
      machineId: this.state.machineId
    });

    this.props.close();
  },
  formTitle(){
    return "Create Machine";
  }
}, MachineFormCommon));
