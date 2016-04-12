import React from 'react';
import GlobalStates from '../global-state/GlobalStates';
import Machines from '../machine/Machines';
import LocationLogs from './LocationLogs';
import Map from './Map';

// Draw the map along with all the machines
export default AllMachineMap = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    var handle = Meteor.subscribe("machines");
    var atTime = GlobalStates.getServerTime();
    Chronos.liveUpdate(200);

    return {
      machines: Machines.find({}).fetch(),
      time: atTime
    }
  },
  render(){
    return <svg width="100%" height="500px" viewBox="0 0 1000 1000">
      <rect x="-10000" y="-10000" width="30000" height="30000" fill="#EEEEEE" />
      <g>
        { this.data.machines.map( m => <MachineView machine={m} atTime={this.data.time} /> ) }
      </g>
      <MapView />
    </svg>;
  }
})

// Draw the map
var MapView = function(){
  return <g>
    <g>{ Map.paths.map(p => <path d={p.svgPathD} stroke="black" strokeWidth="5" fill="none"/>) }</g>
  </g>;
};

var MachineView = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object.isRequired,
    atTime: React.PropTypes.any.isRequired // Actually date. But can't seems to find react type for it
  },
  getMeteorData(){

    Meteor.subscribe("location_logs", this.props.machine.machineId, this.props.atTime);

    // Find the first log before at that time
    var locationLog = LocationLogs.findOne({
      machineId: this.props.machine.machineId,
      createdAt: { $lte: this.props.atTime }
    }, {
      sort: { createdAt: -1 },
      limit: 1
    });

    return {
      locationLog
    }
  },
  getLocationPoint(){
    if(this.data.locationLog.type === 'point'){
      var point = Map.getPoint(this.data.locationLog.pointId);
      if(point === undefined){
        console.error("Error point "+this.data.locationLog.pointId+" is not defined");
        return {
          x: 0,
          y: 0
        }
      }
      return {
        x: point.visualX,
        y: point.visualY
      };
    }else if(this.data.locationLog.type === 'path'){
      var path = Map.getPath(this.data.locationLog.pathId);
      if(path === undefined){
        console.error("Error path "+this.data.locationLog.pathId+" is not defined");
        return {
          x: 0,
          y: 0
        }
      }

      var pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", path.svgPathD);

      var length = pathEl.getTotalLength();
      var speed = path.machineSpeed;
      var timePassed = (this.props.atTime.getTime() - this.data.locationLog.createdAt.getTime());
      timePassed /= 1000.0;
      var lengthPassed = timePassed*speed;
      var progress = this.data.locationLog.pathProgress + (lengthPassed/length);
      if(progress > 1){
        progress = 1;
      }
      if(progress < 0){
        progress = 0;
      }

      var point = pathEl.getPointAtLength(length*progress);

      return {
        x: point.x,
        y: point.y
      };
    }else{
      console.error("ERROR: unknown location log type "+this.data.locationLog.type);
      return {
        x: 0,
        y: 0
      };
    }
  },
  render(){

    if(this.data.locationLog === undefined){
      return <g>
        <text fontFamily="Arial" fontSize="30" y="15" stroke="red" textAnchor="middle">{this.props.machine.machineId + "no position"}</text>
      </g>; // Nothing
    }

    var point = this.getLocationPoint();
    return <g transform={ "translate("+point.x+","+point.y+")" }>
      <text fontFamily="Arial" fontSize="30" y="15" stroke="green" textAnchor="middle">{this.props.machine.machineId}</text>
    </g>; // Something
  }
});
