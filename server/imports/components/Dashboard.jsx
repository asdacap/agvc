import React from 'react';
import { AppCanvas,
   AppBar,
   FlatButton,
   RaisedButton,
   Toolbar,
   ToolbarTitle,
   ToolbarGroup
  } from 'material-ui';
import SideNavPage from './SideNavPage';
import MenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import MachineList from '../machine/MachineList';
import AllMachineMap from '../location/AllMachineMap';
import ViewTime from '../client/ViewTime';
import moment from 'moment';

Dashboard = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      mode: ViewTime.mode,
      viewTime: ViewTime.time
    }
  },
  toggleMode(){
    if(ViewTime.mode == "live"){
      ViewTime.replay();
    }else{
      ViewTime.live();
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Dashboard" onLeftIconButtonTouchTap={this.toggleNav}/>
            <Toolbar>
              <ToolbarGroup float="left" />
              <ToolbarGroup float="right">
                <ToolbarTitle text={moment(this.data.viewTime).format('l LTS')} />
                <RaisedButton label={this.data.mode} onTouchTap={this.toggleMode} />
              </ToolbarGroup>
            </Toolbar>
            <AllMachineMap />
            <MachineList />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

export default Dashboard;
