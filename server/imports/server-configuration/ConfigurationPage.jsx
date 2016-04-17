import React from 'react';
import { AppCanvas,
  AppBar,
  Tabs,
  Tab,
  List,
  ListItem,
  RaisedButton,
  Dialog,
  FlatButton,
  MenuItem,
  TextField,
  CircularProgress,
  SelectField
 } from 'material-ui';
import SideNavPage from '../components/SideNavPage';
import SystemConfiguration from './ServerConfiguration';
import SerialList from '../arduino-configurator/SerialList';
import Machines from '../machine/Machines';
import ResponseTimeIndicator from '../client-response-time/ResponseTimeIndicator';

let styles = {
  arduinoConfiguration: {
    CircularProgressContainer: {
      textAlign: "center",
    }
  }
};

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

let ConfigureArduinoDialog = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    return {
      selectedMachine: "",
      configuring: false
    };
  },
  getMeteorData(){
    Meteor.subscribe("machines");
    return {
      machines: Machines.find({}).fetch()
    }
  },
  close(){
    this.props.close();
  },
  configure(){
    if(this.state.selectedMachine == ""){
      alert("Please select a machine");
      return;
    }

    let self = this;
    this.setState({ configuring: true });
    Meteor.call("configureArduino", this.props.port, this.state.selectedMachine);
    Meteor.setTimeout(function(){
      self.setState({ configuring: false });
      self.close();
    }, 10000);
  },
  selectedMachineChanged(e, idx, value){
    this.setState({ selectedMachine: value });
  },
  render(){
    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        disable={this.state.configuring}
        onClick={this.close}
        />,
      <FlatButton
        label="Configure"
        primary={true}
        disable={this.state.configuring}
        onClick={this.configure}
        />
    ];

    return <Dialog
      title={"Configure Arduino at port "+this.props.port}
      onRequestClose={this.props.close}
      actions={actions}
      autoDetectWindowHeight={false}
      open={this.props.open}
      >
      { this.state.configuring ?
        <div style={styles.arduinoConfiguration.CircularProgressContainer}>
          <CircularProgress size={2}/>
        </div>
        :
        <SelectField value={this.state.selectedMachine}
           onChange={this.selectedMachineChanged}
           floatingLabelText="Configure for machine" >
          { this.data.machines.map(function(machine){
            return <MenuItem value={machine.machineId} primaryText={machine.machineId} />
          })}
        </SelectField> }
    </Dialog>;
  }
});

export default ConfigurationPage = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    return {
      openForm: false,
      openConfigureArduino: false,
      selectedPort: ""
    }
  },
  getMeteorData(){
    return {
      serialList: SerialList.get(),
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
  openConfigureArduino(){
    this.setState({ openConfigureArduino: true });
  },
  closeConfigureArduino(){
    this.setState({ openConfigureArduino: false });
  },
  render() {
    let self = this;
    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title="Configuration" onLeftIconButtonTouchTap={this.toggleNav}/>
            <Tabs>
              <Tab label="Server Configuration">
                <List>
                  <ListItem primaryText="Wifi SSID" secondaryText={ this.data.serverConfiguration.wifiSSID } />
                  <ListItem primaryText="Wifi Passphrase" secondaryText={ this.data.serverConfiguration.wifiPassphrase } />
                  <ListItem primaryText="Server Host" secondaryText={ this.data.serverConfiguration.serverHost } />
                  <ListItem primaryText="Server Port" secondaryText={ this.data.serverConfiguration.serverPort } />
                  <ListItem primaryText="TCP Connect Delay" secondaryText={ this.data.serverConfiguration.tcpConnectDelay } />
                </List>
                <RaisedButton label="Edit" onTouchTap={this.openForm} />
              </Tab>
              <Tab label="Configure Arduino">
                <List>
                  { this.data.serialList.map(function(sl){
                    function onTouch(){
                      self.setState({selectedPort: sl.port}, self.openConfigureArduino);
                    }
                    return <ListItem primaryText={sl.port} secondaryText={sl.info} onTouchTap={onTouch}/>
                  }) }
                </List>
                <ConfigureArduinoDialog open={this.state.openConfigureArduino} close={this.closeConfigureArduino} port={self.state.selectedPort}/>
              </Tab>
            </Tabs>
            <ServerConfigurationForm open={this.state.openForm} close={this.closeForm} />
            <ResponseTimeIndicator />
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});
