
import React from 'react';
import {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableBody,
  TableRowColumn,
  FlatButton,
} from 'material-ui';
import SideNavPage from '../components/SideNavPage';

export default MachineCommandQueueTab = React.createClass({
  render(){
    return (
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          { this.props.machine.commandQueue.map(function(command, idx){
            return <TableRow key={idx}>
              <TableRowColumn>{command.command}</TableRowColumn>
            </TableRow>;
          }) }
        </TableBody>
      </Table>
    );
  }
});
