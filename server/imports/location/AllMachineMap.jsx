import React from 'react';
import GlobalStates from '../global-state/GlobalStates';
import Machines from '../machine/Machines';
import LocationLogs from './LocationLogs';
import Map from './Map';
import MachineView from './MachineView';
import ViewTime from '../client/ViewTime';
import { FasterViewTime } from '../client/ViewTime';
import NoRerenderContainer from '../components/NoRerenderContainer';
import MapView from './MapView';

// Draw the map along with all the machines
export default AllMachineMap = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    return {};
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machines");
    var atTime = ViewTime.time;

    return {
      machines: Machines.find({}).fetch(),
      time: atTime
    }
  },
  render(){
    return <svg width="100%" height="500px" viewBox="0 0 1200 900">
      <rect x="-10000" y="-10000" width="30000" height="30000" fill="#d6d6d6" />
      <rect x="0" y="0" width="1200" height="900" fill="#EEEEEE" />
        <MapView />
      <g>
        { this.data.machines.map( m => <MachineView machine={m} atTime={this.data.time} key={m._id}/> ) }
      </g>
    </svg>;
  }
})
