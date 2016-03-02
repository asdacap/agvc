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
