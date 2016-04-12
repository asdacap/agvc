import React from 'react';
import { AppCanvas, AppBar } from 'material-ui';
import SideNavPage from './SideNavPage';
import MachineList from './machine/MachineList';
import AllMachineMap from '../location/AllMachineMap';

Dashboard = React.createClass({

  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Dashboard" onLeftIconButtonTouchTap={this.toggleNav}/>
            <AllMachineMap />
            <MachineList />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

export default Dashboard;
