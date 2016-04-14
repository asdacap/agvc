import React from 'react';
import StateCalculator from '../machine/StateCalculator';

let styles = {
  AGVStyle: {
    fill: "#FFFFFF",
    stroke: "#8d8d8d",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
}

export default MachineView = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object.isRequired,
    atTime: React.PropTypes.any.isRequired // Actually date. But can't seems to find react type for it
  },
  getMeteorData(){

    StateCalculator.subscribe(this.props.machine.machineId, this.props.atTime);
    return {
      state: StateCalculator.calculate(this.props.machine.machineId, this.props.atTime)
    }
  },
  render(){

    if(this.data.state.position === undefined){
      return <g></g>; // Nothing
    }

    var point = this.data.state.position;
    return <g transform={ "translate("+point.x+","+point.y+")" }>
      <rect
        style={ styles.AGVStyle }
        id="rect4181"
        width="12.678572"
        height="23.035715"
        x="21.964285"
        y="-11.477083" />
      <circle
        style={ styles.AGVStyle }
        id="path4138"
        cx="-11.492928"
        cy="25"
        r="10" />
      <circle
        style={ styles.AGVStyle }
        id="path4138-9"
        cx="11.964286"
        cy="25"
        r="10" />
      <rect
        style={ styles.AGVStyle }
        id="rect3336"
        width="50"
        height="50"
        x="-25"
        y="-25" />
      <path
        style={ styles.AGVStyle }
        d="m 30.223216,-16.730847 c 8.942189,0 16.191265,7.4289614 16.191265,16.59304994 0,9.16408816 -7.249076,16.59305006 -16.191265,16.59305006 z"
        id="path4138-9-2" />

      <text fontFamily="Arial" fontSize="30" y="65" stroke="green" textAnchor="middle">{this.props.machine.machineId}</text>
    </g>; // Something
  }
});
