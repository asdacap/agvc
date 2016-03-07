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

MachineListItem = React.createClass({
  getInitialState(){
    return {
      openForm: false
    };
  },
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  delete(){
    Meteor.call("deleteMachine", this.props.machine.machineId);
  },
  edit(){
    this.setState({ openForm: true });
  },
  closeEdit(){
    this.setState({ openForm: false });
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
        <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
      </CardText>
      <CardActions>
        <FlatButton label="Ping" onClick={this.ping}/>
        <FlatButton label="Delete" onClick={this.delete}/>
        <FlatButton label="Edit" onClick={this.edit}/>
      </CardActions>
    </Card>;
  }
});
