
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
  FloatingActionButton
 } = MUI;

 var ContentAdd = MUI.Libs.SvgIcons.ContentAdd;

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
      <h2>Machine Lists</h2>
      <div class="machines">
        { this.data.machines.map(function(item){ return <MachineListItem machine={item} key={item._id}/>; }) }
      </div>
      { this.data.openForm ? <MachineForm toggleForm={this.toggleForm} /> : <FloatingActionButton onClick={this.toggleForm}>
        <ContentAdd />
      </FloatingActionButton> }
    </div>;
  }
});

MachineListItem = React.createClass({
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  render(){
    return <Card style={ { width: "300px", display: "inline-block", marginRight: "1em" } }>
      <CardTitle title={this.props.machine.machineId} subtitle={this.props.machine.online ? "Online" : "Offline"}/>
      <CardText>
        Command Queue:
        <Table selectable={false} height="200px">
          <TableBody displayRowCheckbox={false}>
            { this.props.machine.commandQueue.map(function(command){
              return <TableRow>
                <TableRowColumn>{command.command}</TableRowColumn>
              </TableRow>;
              }) }
          </TableBody>
        </Table>
      </CardText>
      <CardActions>
        <FlatButton label="Ping" onClick={this.ping}/>
      </CardActions>
    </Card>;
  }
});

MachineForm = React.createClass({
  getInitialState(){
    return { open: true };
  },
  addMachine(e){
    e.preventDefault();

    var machineId = React.findDOMNode(this.refs.machineIdInput).value.trim();
    Meteor.call("addMachine",{
      machineId: machineId
    });

    this.close();
  },
  close(){
    var that = this;
    this.setState({open: false}, function(){
      setTimeout(function(){
        that.props.toggleForm();
      },500);
    });
  },
  render(){
    return <Dialog
          title="Machine Form"
          open={this.state.open}
          onRequestClose={this.props.toggleForm}
        >
      <h3>Machine FOrm</h3>
      <form onSubmit={this.addMachine}>
        <input type="text" ref="machineIdInput" placeholder="Type new machine id" />
        <button className="btn">Save</button>
        <a className="btn" onClick={this.close}>Close</a>
      </form>
    </Dialog>;
  }
});
