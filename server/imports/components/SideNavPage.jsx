import React from 'react';
import { LeftNav, MenuItem } from 'material-ui';

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
        <LeftNav
          docked={false}
          onRequestChange={open => this.setState({open})}
          open={this.state.open}>
          <MenuItem onTouchTap={ _ => FlowRouter.go("dashboard") }>Dashboard</MenuItem>
          <MenuItem onTouchTap={ _ => FlowRouter.go("message_logs") }>Message Logs</MenuItem>
          <MenuItem onTouchTap={ _ => FlowRouter.go("configurations") }>Configurations</MenuItem>
        </LeftNav>
        {React.cloneElement(this.props.children, { toggleNav: this.toggleNav })}
      </div>
    );
  }
});

export default SideNavPage;
