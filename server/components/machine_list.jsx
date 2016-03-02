
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

var ContentAdd = MUI.Libs.SvgIcons.ContentAdd;

var styles = {
  AddMachineFloatingButton: {
    position: "absolute",
    right: "0",
    bottom: "0"
  }
}

MachineList = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    var handle = Meteor.subscribe("machines");
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
      <div style={ { position: "relative" } }>
        <h2>Machine Lists</h2>
        <div class="machines">
          { this.data.machines.map(function(item){ return <MachineListItem machine={item} key={item._id}/>; }) }
        </div>
        <FloatingActionButton onClick={this.toggleForm} style={styles.AddMachineFloatingButton}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <CreateMachineForm open={this.data.openForm} toggleForm={this.toggleForm}></CreateMachineForm>
    </div>;
  }
});

CreateMachineForm = React.createClass({
  getInitialState(){
    return {
      machineId: ""
    };
  },
  addMachine(e){
    e.preventDefault();

    if(!this.checkValid()) return;

    var machineId = React.findDOMNode(this.refs.machineIdInput).value.trim();
    Meteor.call("addMachine",{
      machineId: machineId
    });

    this.close();
  },
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
  render(){

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.props.toggleForm}
        />,
      <FlatButton
        label="Submit"
        primary={true}
        onClick={this.addMachine}
        />
    ];

    return <Dialog
          title="Add Machine"
          open={this.props.openForm}
          onRequestClose={this.props.toggleForm}
          actions={actions}
          open={this.props.open}
        >
        <form onSubmit={this.addMachine}>
          <TextField value={this.state.machineId} onChange={this.onMachineIdChange} errorText={this.state.machineIdErrorText} floatingLabelText="Machine ID"/>
        </form>
      </Dialog>
  }
});
