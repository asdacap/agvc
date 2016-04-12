import React from 'react';
var { AppCanvas, AppBar } = require('material-ui');

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
