var {
  FlatButton,
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn
} = MUI;

MessageList = React.createClass({
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
  render(){
    return <div>
        <hr />
        <h2>Message Lists</h2>
        <FlatButton onClick={this.clearMessageLog} label="Clear" />&nbsp;
        <FlatButton onClick={this.addMessageLog} label="Click to add" />&nbsp;
        <Table height="300px">
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
      </div>;
  }
});

if(Meteor.isClient){
  Meteor.subscribe("messages");
}
