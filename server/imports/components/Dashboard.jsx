import React from 'react';
import { AppCanvas,
   AppBar,
   FlatButton,
   RaisedButton,
   TextField,
   TimePicker,
   DatePicker,
   Toolbar,
   ToolbarTitle,
   ToolbarGroup
  } from 'material-ui';
import SideNavPage from './SideNavPage';
import MenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import MachineListStatus from '../machine/MachineListStatus';
import MachineListChart from '../machine/MachineListChart';
import AllMachineMap from '../location/AllMachineMap';
import ViewTime from '../client/ViewTime';
import ViewTimeToolbar from './ViewTimeToolbar';
import ResponseTimeIndicator from '../client-response-time/ResponseTimeIndicator';
import moment from 'moment';

Dashboard = React.createClass({
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  getDefaultProps(){
    return {
      page: "status"
    };
  },
  render() {

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <ViewTimeToolbar title="Dashboard" toggleNav={this.toggleNav} />
            <AllMachineMap />
            {this.props.page == "chart" ? <MachineListChart reading={this.props.reading}/> : <MachineListStatus />}
            <ResponseTimeIndicator />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

export default Dashboard;
