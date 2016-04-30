import React from 'react';
import ReactDOM from 'react-dom';
import {
  RaisedButton,
  FloatingActionButton
} from 'material-ui';
import { ReadingList } from './MachineStatusTab';
import MediaQuery from 'react-responsive';
import VibrateOnTouch from '../components/VibrateOnTouch';

import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import HardwareKeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

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
    top: '1em',
    marginTop: '0',
    marginLeft: '-150px',
    width: '300px',
    height: '400px',
    textAlign: 'center'
  },
  LeftBox: {
    flex: '0 0 500px'
  },
  RightBox: {
    flex: '1 0 auto',
    position: 'relative',
    width: '300px',
    minHeight: '410px',
    backgroundColor: '#CCCCCC'
  },

  Buttons: {
    TopGroup: {
      marginTop: '1ex'
    },
    ManualToggle: {
      marginTop: '1ex'
    },
    AnalogToggle: {
      position: 'absolute',
      top: '350px',
      left: '100px',
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
  getInitialState(){
    return {
      beingPressed: false
    }
  },
  getCursorPosition(event) {
    let el = this.refs.svgEl;
    let rect = el.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y };
  },
  getTouchPosition(event){
    let x = 0;
    let y = 0;

    let el = this.refs.svgEl;
    let rect = el.getBoundingClientRect();
    _.each(event.targetTouches,touch => {
      x = x + touch.clientX - rect.left;
      y = y + touch.clientY - rect.top;
    });

    x = x / event.targetTouches.length;
    y = y / event.targetTouches.length;

    return { x, y };
  },
  positionChanged(pos){
    pos.x = pos.x - 150;
    pos.y = pos.y - 150;
    if(Math.sqrt(pos.x*pos.x + pos.y*pos.y) > 120){
      let angle = Math.atan2(pos.y, pos.x);
      pos.x = Math.cos(angle)*120;
      pos.y = Math.sin(angle)*120;
    }
    pos.x = pos.x / 120;
    pos.y = pos.y / 120;
    this.props.setPos(pos);
  },
  onMouseMove(e){
    if(this.state.beingPressed){
      let pos = this.getCursorPosition(e);
      this.positionChanged(pos);
    }
  },
  onMouseDown(e){
    let pos = this.getCursorPosition(e);
    this.setState({ beingPressed: true });
    this.positionChanged(pos);
  },
  onMouseUp(e){
    let pos = this.getCursorPosition(e);
    this.setState({ beingPressed: false });
    this.positionChanged({ x: 150, y: 150 });
  },
  onTouchMove(e){
    e.preventDefault();
    if(this.state.beingPressed){
      let pos = this.getTouchPosition(e);
      this.positionChanged(pos);
    }
  },
  onTouchStart(e){
    e.preventDefault();
    this.vibrate();
    let pos = this.getTouchPosition(e);
    this.setState({ beingPressed: true });
    this.positionChanged(pos);
  },
  onTouchEnd(e){
    e.preventDefault();
    this.vibrate();
    let pos = this.getTouchPosition(e);
    this.setState({ beingPressed: false });
    this.positionChanged({ x: 150, y: 150 });
  },
  vibrate(){
    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if("vibrate" in navigator){
      navigator.vibrate(50);
    }
    return false;
  },
  render(){

    let centerX = this.props.x*120;
    let centerY = this.props.y*120;

    centerX = centerX + 150;
    centerY = centerY + 150;

    let centerFill = "#CCCCCC";
    if(this.state.beingPressed){
      centerFill = "#AAAAAA";
    }

    return <svg width="300" height="300" ref="svgEl"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        onMouseUp={this.onMouseUp}>
      <circle cx="150" cy="150" r="120"
        stroke="black"
        fill="#DDDDDD" />
      <circle cx={centerX} cy={centerY} r="50" stroke="black" fill={centerFill}/>
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
  calculateMotorValues(){
    let baseSpeed = 150;

    let forwardBack = baseSpeed;
    forwardBack = forwardBack * -this.state.dirY;

    let motorL = forwardBack;
    let motorR = forwardBack;
    motorL = motorL + this.state.dirX*baseSpeed;
    motorR = motorR - this.state.dirX*baseSpeed;

    motorL = Math.min(motorL, baseSpeed);
    motorR = Math.min(motorR, baseSpeed);
    motorL = Math.max(motorL, -baseSpeed);
    motorR = Math.max(motorR, -baseSpeed);
    motorL = Math.floor(motorL);
    motorR = Math.floor(motorR);

    return { motorL, motorR };
  },
  setPos(pos){
    if(pos.x == 0 && pos.y == 0){
      this.stop();
      this.setState({ dirX: pos.x, dirY: pos.y });
      return;
    }

    // Limit the call rate
    if(this.lastCall !== undefined && new Date().getTime() - this.lastCall.getTime() < 50){
      return;
    }
    this.lastCall = new Date();

    if(this.commandHandle === undefined){
      this.commandHandle = Meteor.setInterval(_ => {
        Meteor.call('manualAnalog', this.props.machine.machineId, this.calculateMotorValues());
      }, 500);
    }

    this.setState({ dirX: pos.x, dirY: pos.y }, _ => {
      Meteor.call('manualAnalog', this.props.machine.machineId, this.calculateMotorValues());
    });
  },
  stop(e){
    if(e !== undefined){
      e.preventDefault();
    }
    if(this.commandHandle !== undefined){
      Meteor.clearInterval(this.commandHandle);
      this.commandHandle = undefined;
    }
    Meteor.call('manualStop', this.props.machine.machineId);
  },
  getInitialState(){
    return {
      analog: false,
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
  toggleAnalog(e){
    e.preventDefault();
    this.setState({ analog: !this.state.analog });
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

    if(!this.props.machine.online){
      innerBox = <div style={styles.InnerBox}>
        <div style={styles.OfflineNotice}>Machine is offline</div>
      </div>;
    }else if(manual){
      if(this.state.analog){
        innerBox = <div style={styles.InnerBox}>
          <div style={styles.Buttons.TopGroup}>
            <VRaisedButton label='Manual On' onTouchTap={this.exitManual} />
            <VRaisedButton label='Analog On' onTouchTap={this.toggleAnalog} />
          </div>
          <AnalogCircle x={this.state.dirX} y={this.state.dirY} setPos={this.setPos}/>
        </div>;
      }else{
        innerBox = <div style={styles.InnerBox}>
          <div style={styles.Buttons.TopGroup}>
            <VRaisedButton label='Manual On' onTouchTap={this.exitManual} />
            <VRaisedButton label='Analog Off' onTouchTap={this.toggleAnalog} />
          </div>

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
        </div>;
      }
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
