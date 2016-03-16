var {
  AppCanvas,
  AppBar,
  FlatButton,
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn
} = MUI;

var styles = {
  AppBar: {
    marginBottom: "10px"
  }
}

MessageLogPage = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      messages: MessageLogs.find({}, { sort: { createdAt: -1 } }).fetch()
    }
  },
  addMessageLog(){
    Meteor.call("addMessageLog","Lalalal");
  },
  clearMessageLog(){
    Meteor.call("clearMessageLog");
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render(){
    return (
      <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Message Logs" onLeftIconButtonTouchTap={this.toggleNav} style={styles.AppBar}/>
            <FlatButton onClick={this.clearMessageLog} label="Clear" />&nbsp;
            <FlatButton onClick={this.addMessageLog} label="Click to add" />&nbsp;
            <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>Message</TableHeaderColumn>
                  <TableHeaderColumn>Created At</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
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
        </SideNavPage>
      </AppCanvas>
    );
  }
});

if(Meteor.isClient){
  Meteor.subscribe("messages");
}
