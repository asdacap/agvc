import React from 'react';
import StateCalculator from '../machine/StateCalculator';
import NoRerenderContainer from '../components/NoRerenderContainer';

let styles = {
  container: {
  },
  AGVStyle: {
    fill: "#FFFFFF",
    stroke: "#8d8d8d",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  StatusIcon: {
    offline: {
      fill: "#fc3b3b"
    },
    outOfCircuit: {
      fill: "#fc3b3b"
    },
    obstructed: {
      fill: "#fc3b3b"
    },
    manualMode: {
      fill: "#007dff"
    },
  },
  MachineName: {
    normal: {
      fill: "green"
    },
    offline: {
      fill: "#fc3b3b",
    },
    outOfCircuit: {
      fill: "#fc3b3b",
    },
    obstructed: {
      fill: "#fc3b3b",
    },
    manualMode: {
      fill: "#007dff",
    }
  },
  BlinkingColor: {
    offline: "#fc3b3b",
    outOfCircuit: "#fc3b3b",
    obstructed: "#fc3b3b"
  }
}

let icons = {
  offline: <g>
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>
  </g>,
  manualMode: <path d="M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z"/>,
  outOfCircuit: <g>
    <path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none"/>
    <path d="M10 6.35V4.26c-.8.21-1.55.54-2.23.96l1.46 1.46c.25-.12.5-.24.77-.33zm-7.14-.94l2.36 2.36C4.45 8.99 4 10.44 4 12c0 2.21.91 4.2 2.36 5.64L4 20h6v-6l-2.24 2.24C6.68 15.15 6 13.66 6 12c0-1 .25-1.94.68-2.77l8.08 8.08c-.25.13-.5.25-.77.34v2.09c.8-.21 1.55-.54 2.23-.96l2.36 2.36 1.27-1.27L4.14 4.14 2.86 5.41zM20 4h-6v6l2.24-2.24C17.32 8.85 18 10.34 18 12c0 1-.25 1.94-.68 2.77l1.46 1.46C19.55 15.01 20 13.56 20 12c0-2.21-.91-4.2-2.36-5.64L20 4z"/>
  </g>,
  obstructed: <g>
    <path d="M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </g>
};

let RobotDrawing = React.createClass({
  render(){

    let robotStyle = _.extend({}, styles.AGVStyle);
    if(this.props.fill !== undefined){
      robotStyle.fill = this.props.fill;
    }

    return <g>
      <rect
        style={ robotStyle }
        id="rect4181"
        width="12.678572"
        height="23.035715"
        x="21.964285"
        y="-11.477083" />
      <circle
        style={ robotStyle }
        id="path4138"
        cx="-11.492928"
        cy="25"
        r="10" />
      <circle
        style={ robotStyle }
        id="path4138-9"
        cx="11.964286"
        cy="25"
        r="10" />
      <rect
        style={ robotStyle }
        id="rect3336"
        width="50"
        height="50"
        x="-25"
        y="-25" />
      <path
        style={ robotStyle }
        d="m 30.223216,-16.730847 c 8.942189,0 16.191265,7.4289614 16.191265,16.59304994 0,9.16408816 -7.249076,16.59305006 -16.191265,16.59305006 z"
        id="path4138-9-2" />
    </g>; // Something

  }
});

let MachineViewAnimator = React.createClass({
  propTypes: {
    machine: React.PropTypes.object.isRequired,
    machineState: React.PropTypes.object.isRequired
  },
  componentDidMount(){
    this.stillAlive = true;
    let container = this.refs.container;
    let repositionContainer = _ => {
      let position = this.calculatePosition();
      if(position != undefined){
        container.setAttribute("transform", "translate("+position.x+","+position.y+")");
      }
      if(this.stillAlive){
        setTimeout(repositionContainer, Settings.machine_view_render_timeout);
      }
    }
    setTimeout(repositionContainer, Settings.machine_view_render_timeout);
  },
  componentWillUnmount(){
    this.stillAlive = false;
  },
  calculatePosition(){
    let position = undefined;

    if(this.oldPosition !== undefined){
      let elapsed = new Date().getTime() - this.updatedAt.getTime();
      let duration = 200.0;
      if(this.previousUpdateAt !== undefined){
        // Smoother duration
        duration = this.updatedAt.getTime() - this.previousUpdateAt.getTime();
        if(duration > 500){
          duration = 500;
        }
      }
      let progress = elapsed/duration;
      if(progress > 1) progress = 1;
      let newX = this.oldPosition.x + (this.props.machineState.position.x - this.oldPosition.x)*progress;
      let newY = this.oldPosition.y + (this.props.machineState.position.y - this.oldPosition.y)*progress;
      position = {
        x: newX,
        y: newY
      };
    }else{
      position = this.props.machineState.position;
    }

    return position;
  },
  componentWillReceiveProps(){
    this.oldPosition = this.calculatePosition();
    this.previousUpdateAt = this.updatedAt;
    this.updatedAt = new Date();
  },
  render(){

    let position = this.calculatePosition();
    let extraIcon = null; // Nothing

    if(this.props.machineState.status != "normal"){
      let icon = null;
      if(this.props.machineState.status == "offline"){
        icon = icons.offline;
      }else if(this.props.machineState.status == "outOfCircuit"){
        icon = icons.outOfCircuit;
      }else if(this.props.machineState.status == "obstructed"){
        icon = icons.obstructed;
      }else if(this.props.machineState.status == "manualMode"){
        icon = icons.manualMode;
      }

      extraIcon = <g transform="scale(2,2),translate(-10,-40)" style={styles.StatusIcon[this.props.machineState.status]}>
        {icon}
      </g>;
    }

    let robotFill = undefined;
    let blinkingColor = styles.BlinkingColor[this.props.machineState.status];
    if(blinkingColor !== undefined){
      if(Math.floor(new Date().getTime()/1000)%2){
        robotFill = blinkingColor;
      }
    }

    return <g style={styles.container} ref="container" transform={ "translate("+position.x+","+position.y+")" }>
      <NoRerenderContainer fill={robotFill}>
        <RobotDrawing/>
      </NoRerenderContainer>

      <text fontFamily="Arial" fontSize="30" y="65" style={styles.MachineName[this.props.machineState.status]} textAnchor="middle">{this.props.machine.machineId}</text>
      {extraIcon}
    </g>; // Something

  }
});

export default MachineView = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object.isRequired,
    atTime: React.PropTypes.any.isRequired // Actually date. But can't seems to find react type for it
  },
  getMeteorData(){
    let ready = StateCalculator.subscribe(this.props.machine.machineId, this.props.atTime);

    if(ready){
      this.machineState = StateCalculator.calculate(this.props.machine.machineId, this.props.atTime);
    }

    return {
      ready: ready,
      state: this.machineState
    }
  },
  render(){

    if(this.machineState === undefined || this.machineState.position === undefined){
      return <g></g>; // Nothing
    }else{
      return <MachineViewAnimator machine={this.props.machine}
              machineState={this.data.state} />
    }
  }
});
