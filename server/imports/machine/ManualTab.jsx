import React from 'react';
import {
  RaisedButton
} from 'material-ui';

export default ManualTab = React.createClass({
  enterManual(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    Meteor.call('enterManualMode', this.props.machine.machineId);
  },
  exitManual(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    Meteor.call('exitManualMode', this.props.machine.machineId);
  },
  forward(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    this.commandHandle = Meteor.setInterval(_ => {
      Meteor.call('manualForward', this.props.machine.machineId);
    }, 500);
  },
  backward(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    this.commandHandle = Meteor.setInterval(_ => {
      Meteor.call('manualBackward', this.props.machine.machineId);
    }, 500);
  },
  left(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    this.commandHandle = Meteor.setInterval(_ => {
      Meteor.call('manualLeft', this.props.machine.machineId);
    }, 500);
  },
  right(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    this.commandHandle = Meteor.setInterval(_ => {
      Meteor.call('manualRight', this.props.machine.machineId);
    }, 500);
  },
  stop(e){
    e.preventDefault();
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    Meteor.call('manualStop', this.props.machine.machineId);
  },
  componentWillUnmount(){
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
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
