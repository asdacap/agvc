import React from 'react';
import ReactDOM from 'react-dom';
import {
  RaisedButton,
  FloatingActionButton
} from 'material-ui';
import { ReadingList } from './MachineStatusTab';
import MediaQuery from 'react-responsive';
import VibrateOnTouch from '../components/VibrateOnTouch';

import HardwareKeyboardArrowDown from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-down';
import HardwareKeyboardArrowUp from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-up';
import HardwareKeyboardArrowLeft from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-left';
import HardwareKeyboardArrowRight from 'material-ui/lib/svg-icons/hardware/keyboard-arrow-right';

let VRaisedButton = VibrateOnTouch(RaisedButton);
let VFloatingActionButton = VibrateOnTouch(FloatingActionButton, true);

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

let AnalogCircle = React.createClass({
  getCursorPosition(event) {
    let el = this.refs.svgEl;
    let rect = el.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y };
  },
  onMouseDownAndMove(e){
    let pos = this.getCursorPosition(e);
    console.log("button "+e.button);
    console.log("mouse down "+pos.x+" "+pos.y);
  },
  onMouseUp(e){
    console.log("button "+e.button);
    let pos = this.getCursorPosition(e);
    console.log("mouse up "+pos.x+" "+pos.y);
  },
  render(){

    let centerX = this.props.x*120;
    let centerY = this.props.y*120;

    centerX = centerX + 150;
    centerY = centerY + 150;

    return <svg width="300" height="300" ref="svgEl"
        onMouseDown={this.onMouseDownAndMove}
        onMouseMove={this.onMouseDownAndMove}
        onMouseUp={this.onMouseUp}>
      <circle cx="150" cy="150" r="120"
        stroke="black"
        fill="#DDDDDD" />
      <circle cx={centerX} cy={centerY} r="50" stroke="black" fill="#CCCCCC"/>
    </svg>;
  }
});

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
  getInitialState(){
    return {
      dirX: 0,
      dirY: 0
    }
  },
  handleKeyPress(e){
    if(this.keyPressing) return;
    this.keyPressing = true;
    if(e.keyCode == '37'){
      this.left(e);
    }else if(e.keyCode == '38'){
      this.forward(e);
    }else if(e.keyCode == '39'){
      this.right(e);
    }else if(e.keyCode == '40'){
      this.backward(e);
    }else if(e.keyCode == '32'){
      if(this.props.machine.manualMode){
        this.exitManual(e);
      }else{
        this.enterManual(e);
      }
    }
  },
  handleKeyDepress(e){
    this.stop(e);
    this.keyPressing = false;
  },
  componentDidMount(){
    document.addEventListener('keydown', this.handleKeyPress);
    document.addEventListener('keyup', this.handleKeyDepress);
  },
  componentWillUnmount(){
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }

    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('keyup', this.handleKeyDepress);
  },
  render(){
    let manual = this.props.machine.manualMode;
    let machineId = this.props.machine.machineId;

    let innerBox = null;

    if(!this.props.machine.online && false){
      innerBox = <div style={styles.InnerBox}>
        <div style={styles.OfflineNotice}>Machine is offline</div>
      </div>;
    }else if(true){
      innerBox = <div style={styles.InnerBox}>
        <VRaisedButton style={styles.Buttons.ManualToggle} label='Manual On' onTouchTap={this.exitManual} />
        <AnalogCircle x={this.state.dirX} y={this.state.dirY}/>
      </div>;
    }else if(manual){
      innerBox = <div style={styles.InnerBox}>
        <VRaisedButton style={styles.Buttons.ManualToggle} label='Manual On' onTouchTap={this.exitManual} />
        <VFloatingActionButton label='Up' style={styles.Buttons.Up}
          onMouseDown={this.forward} onMouseUp={this.stop}
          onTouchStart={this.forward} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowUp />
        </VFloatingActionButton>
        <VFloatingActionButton label='Down' style={styles.Buttons.Down}
          onMouseDown={this.backward} onMouseUp={this.stop}
          onTouchStart={this.backward} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowDown />
        </VFloatingActionButton>
        <VFloatingActionButton label='Right' style={styles.Buttons.Right}
          onMouseDown={this.right} onMouseUp={this.stop}
          onTouchStart={this.right} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowRight />
        </VFloatingActionButton>
        <VFloatingActionButton label='Left' style={styles.Buttons.Left}
          onMouseDown={this.left} onMouseUp={this.stop}
          onTouchStart={this.left} onTouchEnd={this.stop}>
          <HardwareKeyboardArrowLeft />
        </VFloatingActionButton>
        <AnalogCircle />
      </div>;
    }else{
      innerBox = <div style={styles.InnerBox}>
        <VRaisedButton style={styles.Buttons.ManualToggle} label='Manual Off' onTouchTap={_ => Meteor.call('enterManualMode', machineId)} />
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
