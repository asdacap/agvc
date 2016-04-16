import React from 'react';
import {
  RaisedButton
} from 'material-ui';

export default ManualTab = React.createClass({
  enterManual(e){
    e.preventDefault();
    Meteor.call('enterManualMode', this.props.machine.machineId);
  },
  exitManual(e){
    e.preventDefault();
    Meteor.call('exitManualMode', this.props.machine.machineId);
  },
  forward(e){
    e.preventDefault();
    Meteor.call('manualForward', this.props.machine.machineId);
  },
  backward(e){
    e.preventDefault();
    Meteor.call('manualBackward', this.props.machine.machineId);
  },
  left(e){
    e.preventDefault();
    Meteor.call('manualLeft', this.props.machine.machineId);
  },
  right(e){
    e.preventDefault();
    Meteor.call('manualRight', this.props.machine.machineId);
  },
  stop(e){
    e.preventDefault();
    Meteor.call('manualStop', this.props.machine.machineId);
  },
  render(){
    let manual = this.props.machine.manualMode;
    let machineId = this.props.machine.machineId;

    if(!this.props.machine.online){
      return <span>Machine is offline</span>;
    }
    if(manual){
      return <div>
        <RaisedButton label="Manual On" onTouchTap={this.exitManual} />
        <RaisedButton label="Up" onMouseDown={this.forward} onMouseUp={this.stop} onTouchStart={this.forward} onTouchEnd={this.stop}/>
        <RaisedButton label="Down" onMouseDown={this.backward} onMouseUp={this.stop} onTouchStart={this.backward} onTouchEnd={this.stop}/>
        <RaisedButton label="Right" onMouseDown={this.right} onMouseUp={this.stop} onTouchStart={this.right} onTouchEnd={this.stop}/>
        <RaisedButton label="Left" onMouseDown={this.left} onMouseUp={this.stop} onTouchStart={this.left} onTouchEnd={this.stop}/>
      </div>
    }else{
      return <div>
        <RaisedButton label="Manual Off" onTouchTap={_ => Meteor.call('enterManualMode', machineId)} />
      </div>
    }
  }
});
