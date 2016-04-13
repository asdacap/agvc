import React from 'react';

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
      return <g></g>; // Nothing
    }

    var point = this.getLocationPoint();
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
