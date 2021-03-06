import React from 'react';
import GlobalStates from '../global-state/GlobalStates';
import Machines from '../machine/Machines';
import LocationLogs from './LocationLogs';
import Map from './Map';
import MachineView from './MachineView';
import ViewTime from '../client/ViewTime';
import { FasterViewTime } from '../client/ViewTime';
import MapView from './MapView';

// Draw the map along with all the machines
export default SingleMachineMap = React.createClass({
  propTypes: {
    machineId: React.PropTypes.string.isRequired
  },
  mixins: [ReactMeteorData],
  getInitialState(){
    return {};
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machine", this.props.machineId);

    return {
      machine: Machines.findOne({ machineId: this.props.machineId }, { reactive: false })
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
        <MachineView machine={this.data.machine} scale={2} />
      </g>
    </svg>;
  }
});
