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
import AverageReadingIndicator from '../reading/AverageReadingIndicator';
import moment from 'moment';

Dashboard = React.createClass({
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  getDefaultProps(){
    return {
      which_page: "status",
      page: 0
    };
  },
  render() {

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <ViewTimeToolbar title="Dashboard" toggleNav={this.toggleNav} />
            <AllMachineMap page={this.props.page}/>
            {this.props.which_page == "chart" ? <MachineListChart reading={this.props.reading} page={this.props.page}/> : <MachineListStatus page={this.props.page}/>}
            <ResponseTimeIndicator />
            <AverageReadingIndicator />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

export default Dashboard;
