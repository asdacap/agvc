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
import SideNavPage from '../components/SideNavPage';
import AllMachineMap from './AllMachineMap';
import ViewTime from '../client/ViewTime';
import ViewTimeToolbar from '../components/ViewTimeToolbar';
import ResponseTimeIndicator from '../client-response-time/ResponseTimeIndicator';

let AllMachineMapPage = React.createClass({
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  getDefaultProps(){
    return {
      page: "status"
    };
  },
  updateDimensions: function() {
    this.setState({height: window.innerHeight});
  },
  componentWillMount: function() {
    this.updateDimensions();
  },
  componentDidMount: function() {
    window.addEventListener("resize", this.updateDimensions);
  },
  componentWillUnmount: function() {
    window.removeEventListener("resize", this.updateDimensions);
  },
  render() {

    let containerStyle = {
      height: this.state.height,
      display: "flex",
      flexDirection: "column"
    };

    let mapStyle = {
      flex: "1 0 400px"
    };

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div style={containerStyle}>
            <ViewTimeToolbar title="Map" toggleNav={this.toggleNav} />
            <AllMachineMap style={mapStyle} scale={0.5} alwaysShow={true}/>
            <ResponseTimeIndicator />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

export default AllMachineMapPage;
