import React from 'react';
import { Drawer, MenuItem } from 'material-ui';

var SideNavPage = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },

  getInitialState(){
    return {
      open: false
    }
  },

  toggleNav(){
    this.setState({ open: !this.state.open });
  },

  render: function(){
    return (
      <div>
        <Drawer
          docked={false}
          onRequestChange={open => this.setState({open})}
          open={this.state.open}>
          <MenuItem onTouchTap={ _ => FlowRouter.go("dashboard") }>Dashboard</MenuItem>
          <MenuItem onTouchTap={ _ => FlowRouter.go("allMachineMap") }>Map</MenuItem>
          <MenuItem onTouchTap={ _ => FlowRouter.go("message_logs") }>Message Logs</MenuItem>
          <MenuItem onTouchTap={ _ => FlowRouter.go("configurations") }>Configurations</MenuItem>
        </Drawer>
        {React.cloneElement(this.props.children, { toggleNav: this.toggleNav })}
      </div>
    );
  }
});

export default SideNavPage;
