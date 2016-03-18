var { AppCanvas,
    AppBar,
    Tabs,
    Tab,
    CircularProgress,
    Table,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableBody,
    TableRowColumn,
    List,
    ListItem,
    FlatButton,
    RaisedButton
   } = MUI;

var styles = {
  MachineLoading: {
    textAlign: "center"
  },
  ButtonWithMargin: {
    marginLeft: "0.5em"
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
                <Tab label="Message Logs">
                  <MachineMessageLogTab machine={this.data.machine} />
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
    if(confirm("Are you sure?")){
      Meteor.call("deleteMachine", this.props.machine.machineId);
      FlowRouter.go('dashboard');
    }
  },
  edit(){
    this.setState({ openForm: true });
  },
  closeEdit(){
    this.setState({ openForm: false });
  },
  render(){
    return <div>
      <List>
        <ListItem primaryText="Machine Id" secondaryText={this.props.machine.machineId} />
        <ListItem primaryText="Online Status" secondaryText={<MachineOnlineText machine={this.props.machine} />} />
        <ListItem primaryText="JSON" secondaryText={JSON.stringify(this.props.machine)} />
      </List>
      <RaisedButton style={styles.ButtonWithMargin} label="Delete" onClick={this.delete}/>
      <RaisedButton style={styles.ButtonWithMargin} label="Edit" onClick={this.edit}/>
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
        <RaisedButton label="Ping" onClick={this.ping}/>
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

var MachineMessageLogTab = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    this.limit = new ReactiveVar(50);
    return {};
  },
  getMeteorData(){
    Meteor.subscribe("machineMessages", this.props.machine.machineId, this.limit.get());
    return {
      messages: MessageLogs.find({ fromMachineId: this.props.machine.machineId }, { sort: { createdAt: -1 } }).fetch()
    }
  },
  addMessageLog(){
    Meteor.call("addMessageLog", "Lalalal", this.props.machine.machineId);
  },
  clearMessageLog(){
    Meteor.call("clearMessageLog", this.props.machine.machineId);
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  onListScroll(e){
    var obj = document.body;
    console.log("on scroll "+(obj.scrollTop+window.innerHeight)+" and "+obj.scrollHeight);
    if((obj.scrollTop+window.innerHeight)+5 >= obj.scrollHeight){
      console.log("passes");
      if(this.limit.get() <= this.data.messages.length){
        this.limit.set(this.limit.get()+50);
      }
    }
  },
  componentDidMount(){
    var obj = document;
    obj.addEventListener("scroll", this.onListScroll);
  },
  componentWillUnmount(){
    var obj = document;
    obj.removeEventListener("scroll", this.onListScroll);
  },
  render(){
    return (
          <div>
            <FlatButton onClick={this.clearMessageLog} label="Clear" />&nbsp;
            <FlatButton onClick={this.addMessageLog} label="Click to add" />&nbsp;
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>Message</TableHeaderColumn>
                  <TableHeaderColumn>Created At</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} ref="table_body">
                {this.data.messages.map(function(message){
                   return <TableRow key={message.id}>
                     <TableRowColumn>
                       {message.text}
                     </TableRowColumn>
                     <TableRowColumn>
                       {message.createdAt.toString()}
                     </TableRowColumn>
                   </TableRow>;
                 })}
              </TableBody>
            </Table>
          </div>
    );
  }
});