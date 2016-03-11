var { AppCanvas, AppBar } = MUI;

Dashboard = React.createClass({

  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Dashboard" onLeftIconButtonTouchTap={this.toggleNav}/>
            <MachineList />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});
