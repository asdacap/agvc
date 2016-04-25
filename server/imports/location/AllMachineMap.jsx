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
    return {
      showMap: true
    };
  },
  toggleAllMachineMap(){
    this.setState({ showMap: !this.state.showMap });
  },
  getMeteorData(){
    var handle = Meteor.subscribe("Machines");

    return {
      machines: Machines.find({}, { fields: { _id: 1, machineId: 1 } }).fetch()
    }
  },
  render(){
    if(this.state.showMap){
      return <svg width="100%" height="500px" viewBox="0 0 1200 900" onTouchTap={this.toggleAllMachineMap}>
        <rect x="-10000" y="-10000" width="30000" height="30000" fill="#d6d6d6" />
        <rect x="0" y="0" width="1200" height="900" fill="#EEEEEE" />
        <MapView />
        <g>
          { this.data.machines.map( m => <MachineView machine={m} key={m._id}/> ) }
        </g>
      </svg>;
    }else{
      return <svg width="100%" height="50px" viewBox="0 0 500 50" onTouchTap={this.toggleAllMachineMap}>
        <rect x="-10000" y="-10000" width="30000" height="30000" fill="#d6d6d6" />
        <text fontFamily="Arial" fontSize="25px" x="250" y="35"  textAnchor="middle">Map Hidden</text>
      </svg>;
    }
  }
})
