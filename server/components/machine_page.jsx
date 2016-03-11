var { AppCanvas,
    AppBar,
    Tabs,
    Tab,
    CircularProgress,
    Table,
    TableBody,
    TableRow,
    TableRowColumn,
    FlatButton } = MUI;

var styles = {
  MachineLoading: {
    textAlign: "center"
  }
}

MachinePage = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machineId: React.PropTypes.string
  },
  getMeteorData(){
    var handle = Meteor.subscribe("machine", this.props.machineId);
    return {
      ready: handle.ready(),
      machine: Machines.findOne({ machineId: this.props.machineId })
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title={this.props.machineId} onLeftIconButtonTouchTap={this.toggleNav}/>
            {
              !this.data.ready ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> : <Tabs>
                <Tab label="Status">
                  <MachineStatusTab machine={this.data.machine} />
                </Tab>
                <Tab label="Readings">
                  <MachineReadingsTab machine={this.data.machine} />
                </Tab>
                <Tab label="Command Queue">
                  <MachineCommandQueueTab machine={this.data.machine} />
                </Tab>
              </Tabs>
            }
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

var MachineStatusTab = React.createClass({
  getInitialState(){
    return {
      openForm: false
    };
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
    return <div>
      JSON: {JSON.stringify(this.props.machine)}
      <FlatButton label="Delete" onClick={this.delete}/>
      <FlatButton label="Edit" onClick={this.edit}/>
      <EditMachineForm machine={this.props.machine} open={this.state.openForm} close={this.closeEdit}/>
    </div>;
  }
});

var MachineReadingsTab = React.createClass({
  render(){
    return <div>"Machine Readings tab"</div>;
  }
});

var MachineCommandQueueTab = React.createClass({
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  render(){
    return (
      <div>
        <FlatButton label="Ping" onClick={this.ping}/>
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            { this.props.machine.commandQueue.map(function(command, idx){
              return <TableRow key={idx}>
                <TableRowColumn>{command.command}</TableRowColumn>
              </TableRow>;
              }) }
          </TableBody>
        </Table>
      </div>
    );
  }
});
