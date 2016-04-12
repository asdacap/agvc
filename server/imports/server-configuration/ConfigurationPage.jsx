import React from 'react';
import { AppCanvas, AppBar, List, ListItem, RaisedButton, Dialog, FlatButton, TextField } from 'material-ui';
import SideNavPage from '../components/SideNavPage';
import SystemConfiguration from './ServerConfiguration';

let ServerConfigurationForm = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      invalidKeys: this.validationContext.invalidKeys()
    }
  },
  reset(){
    this.setState(_.extend({}, SystemConfiguration.get()));
  },
  getInitialState(){
    this.schema = new SimpleSchema(SystemConfiguration.schema);
    this.validationContext = this.schema.namedContext("configuration-form");
    return _.extend({}, SystemConfiguration.get());
  },
  validate(){
    var obj = _.extend({}, this.state);
    this.schema.clean(obj);
    this.validationContext.validate(obj);
  },
  onFieldChange(fieldName){
    let self = this;
    return function(e){
      let newState = {};
      newState[fieldName] = e.target.value;
      self.setState(newState, _ => self.validate());
    };
  },
  close(){
    this.reset();
    this.props.close();
  },
  onSubmit(){
    this.reset();
    if(this.validationContext.isValid()){
      Meteor.call("setServerConfiguration", _.pick(this.state,
        "wifiSSID",
        "wifiPassphrase",
        "serverHost",
        "serverPort",
        "tcpConnectDelay"
      ));
      this.close();
    }
  },
  render(){

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.close}
        />,
      <FlatButton
        label="Save"
        primary={true}
        onClick={this.onSubmit}
        />
    ];

    return <Dialog
      title="Edit Server Configuration"
      onRequestClose={this.props.close}
      actions={actions}
      open={this.props.open}
      >
      <form onSubmit={this.onSubmit} >
        <TextField onChange={this.onFieldChange("wifiSSID")}
          errorText={this.validationContext.keyErrorMessage("wifiSSID")}
          value={this.state.wifiSSID}
          floatingLabelText="Wifi SSID" />
        <br />
        <TextField onChange={this.onFieldChange("wifiPassphrase")}
          errorText={this.validationContext.keyErrorMessage("wifiPassphrase")}
          value={this.state.wifiPassphrase}
          floatingLabelText="Wifi Passphrase" />
        <br />
        <TextField onChange={this.onFieldChange("serverHost")}
          errorText={this.validationContext.keyErrorMessage("serverHost")}
          value={this.state.serverHost}
          floatingLabelText="Server Host" />
        <br />
        <TextField onChange={this.onFieldChange("serverPort")}
          errorText={this.validationContext.keyErrorMessage("serverPort")}
          value={this.state.serverPort}
          floatingLabelText="Server Port" />
        <br />
        <TextField onChange={this.onFieldChange("tcpConnectDelay")}
          errorText={this.validationContext.keyErrorMessage("tcpConnectDelay")}
          value={this.state.tcpConnectDelay}
          floatingLabelText="TCP Connect Delay" />
      </form>
    </Dialog>
  }
});

export default ConfigurationPage = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    return {
      openForm: false
    }
  },
  getMeteorData(){
    return {
      serverConfiguration: ServerConfiguration.get()
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  openForm(){
    this.setState({ openForm: true });
  },
  closeForm(){
    this.setState({ openForm: false });
  },
  render() {
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Configuration" onLeftIconButtonTouchTap={this.toggleNav}/>
            <List>
              <ListItem primaryText="Wifi SSID" secondaryText={ this.data.serverConfiguration.wifiSSID } />
              <ListItem primaryText="Wifi Passphrase" secondaryText={ this.data.serverConfiguration.wifiPassphrase } />
              <ListItem primaryText="Server Host" secondaryText={ this.data.serverConfiguration.serverHost } />
              <ListItem primaryText="Server Port" secondaryText={ this.data.serverConfiguration.serverPort } />
              <ListItem primaryText="TCP Connect Delay" secondaryText={ this.data.serverConfiguration.tcpConnectDelay } />
            </List>
            <RaisedButton label="Edit" onTouchTap={this.openForm} />
            <ServerConfigurationForm open={this.state.openForm} close={this.closeForm} />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});
