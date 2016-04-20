import React from 'react';
import {
  RaisedButton,
  FloatingActionButton
} from 'material-ui';
import { ReadingList } from './MachineStatusTab';
import MediaQuery from 'react-responsive';

import HardwareKeyboardArrowDown from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down';
import HardwareKeyboardArrowUp from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up';
import HardwareKeyboardArrowLeft from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-left';
import HardwareKeyboardArrowRight from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-right';

let styles = {
  OfflineNotice: {
    marginTop: '100px',
    fontSize: '200%'
  },

  ContainerBox: {
    display: 'flex'
  },
  InnerBox: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: '-150px',
    marginLeft: '-150px',
    width: '300px',
    height: '300px',
    textAlign: 'center'
  },
  LeftBox: {
    flex: '0 0 500px'
  },
  RightBox: {
    flex: '1 0 auto',
    position: 'relative',
    width: '300px',
    minHeight: '300px',
    backgroundColor: '#CCCCCC'
  },

  Buttons: {
    ManualToggle: {
      marginTop: '1ex'
    },
    Up: {
      position: 'absolute',
      top: '70px',
      left: '125px'
    },
    Down: {
      position: 'absolute',
      top: '200px',
      left: '125px'
    },
    Left: {
      position: 'absolute',
      top: '135px',
      left: '50px'
    },
    Right: {
      position: 'absolute',
      top: '135px',
      left: '200px'
    },
  }
};

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

    let innerBox = null;

    if(!this.props.machine.online){
      innerBox = <div style={styles.InnerBox}>
        <div style={styles.OfflineNotice}>Machine is offline</div>
      </div>;
    }else if(manual){
      innerBox = <div style={styles.InnerBox}>
        <RaisedButton style={styles.Buttons.ManualToggle} label='Manual On' onTouchTap={this.exitManual} />
        <FloatingActionButton label='Up' style={styles.Buttons.Up}
          onMouseDown={this.forward} onMouseUp={this.stop}
          onTouchStart={this.forward} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowUp />
        </FloatingActionButton>
        <FloatingActionButton label='Down' style={styles.Buttons.Down}
          onMouseDown={this.backward} onMouseUp={this.stop}
          onTouchStart={this.backward} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowDown />
        </FloatingActionButton>
        <FloatingActionButton label='Right' style={styles.Buttons.Right}
          onMouseDown={this.right} onMouseUp={this.stop}
          onTouchStart={this.right} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowRight />
        </FloatingActionButton>
        <FloatingActionButton label='Left' style={styles.Buttons.Left}
          onMouseDown={this.left} onMouseUp={this.stop}
          onTouchStart={this.left} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowLeft />
        </FloatingActionButton>
      </div>;
    }else{
      innerBox = <div style={styles.InnerBox}>
        <RaisedButton style={styles.Buttons.ManualToggle} label='Manual Off' onTouchTap={_ => Meteor.call('enterManualMode', machineId)} />
      </div>;
    }

    return <div style={styles.ContainerBox}>
      <MediaQuery query='(min-width: 800px)'>
        <div style={styles.LeftBox}>
          <SingleMachineMap machineId={this.props.machine.machineId} style={styles.LeftMap}/>
          <ReadingList machine={this.props.machine} expandable={false}/>
        </div>
      </MediaQuery>
      <div style={styles.RightBox}>
        {innerBox}
      </div>
    </div>;
  }
});
