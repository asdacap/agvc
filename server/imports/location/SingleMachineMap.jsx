import React from 'react';
import GlobalStates from '../global-state/GlobalStates';
import Machines from '../machine/Machines';
import LocationLogs from './LocationLogs';
import Map from './Map';
import MachineView from './MachineView';
import ViewTime from '../client/ViewTime';
import { FasterViewTime } from '../client/ViewTime';

// Draw the map along with all the machines
export default SingleMachineMap = React.createClass({
  propTypes: {
    machineId: React.PropTypes.string.isRequired
  },
  mixins: [ReactMeteorData],
  getInitialState(){
    this.fasterViewTime = new FasterViewTime(100);
    return {};
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machine", this.props.machineId);
    var atTime = this.fasterViewTime.time;

    return {
      machine: Machines.findOne({ machineId: this.props.machineId }),
      time: atTime
    }
  },
  render(){

    let style = this.props.style;
    if(style === undefined) style = {};

    return <svg viewBox="0 0 1200 900" style={style}>
      <rect x="-10000" y="-10000" width="30000" height="30000" fill="#d6d6d6" />
      <rect x="0" y="0" width="1200" height="900" fill="#EEEEEE" />
      <MapView />
      <g>
        <MachineView machine={this.data.machine} atTime={this.data.time} />
      </g>
    </svg>;
  }
})

// Draw the map
var MapView = function(){
  return <g>
    <g>{ Map.paths.map((p,idx) => <path d={p.svgPathD} stroke="black" strokeWidth="5" fill="none" key={idx} />) }</g>
  </g>;
};
