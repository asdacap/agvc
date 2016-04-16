import React from 'react';
import {
  RaisedButton
} from 'material-ui';

export default ManualTab = React.createClass({
  render(){
    let manual = this.props.machine.manualMode;
    let machineId = this.props.machine.machineId;

    if(!this.props.machine.online){
      return <span>Machine is offline</span>;
    }
    if(manual){
      return <div>
        <RaisedButton label="Manual On" onTouchTap={_ => Meteor.call('exitManualMode', machineId)} />
        <RaisedButton label="Up" onMouseDown={_ => Meteor.call('manualForward', machineId)} onMouseUp={_ => Meteor.call('manualStop', machineId)}/>
        <RaisedButton label="Down" onMouseDown={_ => Meteor.call('manualBackward', machineId)} onMouseUp={_ => Meteor.call('manualStop', machineId)}/>
        <RaisedButton label="Right" onMouseDown={_ => Meteor.call('manualRight', machineId)} onMouseUp={_ => Meteor.call('manualStop', machineId)}/>
        <RaisedButton label="Left" onMouseDown={_ => Meteor.call('manualLeft', machineId)} onMouseUp={_ => Meteor.call('manualStop', machineId)}/>
      </div>
    }else{
      return <div>
        <RaisedButton label="Manual Off" onTouchTap={_ => Meteor.call('enterManualMode', machineId)} />
      </div>
    }
  }
});
