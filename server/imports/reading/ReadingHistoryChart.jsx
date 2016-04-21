import React from 'react';
import ReactDOM from 'react-dom';
import { AppCanvas,
    AppBar,
    Tabs,
    Tab,
    CircularProgress,
    Table,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableBody,
    TableRowColumn,
    List,
    ListItem,
    FlatButton,
    RaisedButton
  } from 'material-ui';
import d3 from 'd3';
import moment from 'moment';
import Dimensions from 'react-dimensions';
import Color from 'color';
import ViewTime from '../client/ViewTime';
import { FasterViewTime } from '../client/ViewTime';

// Generate data suitable to be used in the d3 chart
// Also used to calculate average
let dataInRangeCalculator = function(fromTime, toTime, reading, machine){

  let machineId = machine.machineId;
  let readings = Readings[reading].find({
    machineId: machineId,
    createdAt: {
      $gte: fromTime,
      $lte: toTime
    }
  }, {
    sort: { createdAt: 1 }
  }).fetch();

  // Convert the data to a data/value array
  let data = readings.map(d => [d.createdAt, d.value]);
  data = data.filter(d => d[0].getTime() <= toTime.getTime() && d[0].getTime() >= fromTime.getTime() );

  // Calculate first and last value
  let lastVal = machine[reading];
  let lastTime = toTime;

  // The log after the to time
  let nextLog = Readings[reading].findOne({
    machineId: machine.machineId,
    createdAt: { $gte: toTime }
  }, {
    sort: { createdAt: 1 },
    limit: 1
  });
  if(nextLog !== undefined){
    lastVal = nextLog.value;
    lastTime = nextLog.createdAt;
  }

  let firstVal = Readings.meta[reading].defaultValue;
  let firstTime = fromTime;

  // The log before the from time
  let lastLog = Readings[reading].findOne({
    machineId: machine.machineId,
    createdAt: { $lte: fromTime }
  }, {
    sort: { createdAt: -1 },
    limit: 1
  });

  if(lastLog !== undefined){
    firstVal = lastLog.value;
    firstTime = lastLog.createdAt;
  }

  data.push([lastTime, lastVal]);
  data.unshift([firstTime, firstVal]);

  // Interpolate the values to get the boundary value
  if(data[0][0].getTime() < fromTime.getTime()){
    if(data.length == 1){
      data[0][0] = fromTime;
    }else{
      let before = data[0];
      let later = data[1];
      let timeRange = later[0].getTime() - before[0].getTime();
      let progress = (fromTime.getTime() - before[0].getTime())/timeRange;

      let newValue = d3.interpolate(before[1],later[1])(progress);
      if(Readings.meta[reading].type == Boolean){
        newValue = before[1];
      }

      data[0][1] = newValue;
      data[0][0] = fromTime;
    }
  }

  let lastidx = data.length-1;
  if(data[lastidx][0].getTime() > toTime.getTime()){
    if(data.length == 1){
      data[lastidx][0] = fromTime;
    }else{
      let before = data[lastidx-1];
      let later = data[lastidx];
      let timeRange = later[0].getTime() - before[0].getTime();
      let progress = (toTime.getTime() - before[0].getTime())/timeRange;

      let newValue = d3.interpolate(before[1],later[1])(progress);
      if(Readings.meta[reading].type == Boolean){
        newValue = before[1];
      }

      data[lastidx][1] = newValue;
      data[lastidx][0] = toTime;
    }
  }

  return data;
}

// Inefficient... but works
let averageInRangeCalculator = function(fromTime, toTime, reading, machine){
  let data = dataInRangeCalculator(fromTime, toTime, reading, machine);
  let total = 0;
  data.forEach(d => total = total + d[1]);
  return total/data.length;
}

let ReadingHistoryChart = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object,
    reading: React.PropTypes.string
  },
  getDefaultProps(){
    return {
      range: "minute"
    };
  },
  getInitialState(){
    let self = this;
    self.subFromDate = moment().subtract(1, 'minutes');
    self.fasterViewTime = new FasterViewTime(50);
    return {
      chartWidth: 200
    }
  },
  getMeteorData(){
    let self = this;

    let currentTime = "";
    if(this.props.range == "minute"){
      currentTime = self.fasterViewTime.time;
    }else{
      // The rest have a too high resolution for this to see any difference
      currentTime = ViewTime.time;
    }
    let fromTime = moment(currentTime);

    if(this.props.range == "minute"){
      fromTime = fromTime.subtract(1, 'minutes');
    }else if(this.props.range == "10minute"){
      fromTime = fromTime.subtract(10, 'minutes');
    }else if(this.props.range == "hour"){
      fromTime = fromTime.subtract(1, 'hours');
    }

    let toTime = moment(currentTime);

    let subFromTime = new Date(fromTime.toDate().getTime());
    let subToTime = new Date(moment(toTime).add(1, 'minutes').toDate().getTime());
    subFromTime.setSeconds(0,0);
    subToTime.setSeconds(0,0);

    self.handle = Meteor.subscribe("Readings.createdAtRange",
      self.props.machine.machineId,
      subFromTime,
      subToTime,
      self.props.reading);
    Meteor.subscribe("Readings.last",
      self.props.machine.machineId,
      fromTime.toDate(),
      self.props.reading);
    Meteor.subscribe("Readings.first",
      self.props.machine.machineId,
      toTime.toDate(),
      self.props.reading);

    let data = [];

    if(self.handle.ready()){
      data = dataInRangeCalculator(
        fromTime.toDate(),
        toTime.toDate(),
        this.props.reading,
        this.props.machine
      )
    }

    return {
      fromTime: fromTime,
      data: data,
      toTime: toTime,
      ready: self.handle.ready()
    }
  },
  componentDidMount(){
    this.drawD3Chart();
  },
  componentDidUpdate(){
    this.drawD3Chart();
  },
  componentWillUnmount(){
    window.removeEventListener('resize', this.resize);
  },
  getWidth(){
    return this.props.containerWidth;
  },
  getHeight(){
    return 300;
  },
  getRightMargin(){
    return 60;
  },
  getBottomMargin(){
    return 20;
  },
  getTopMargin(){
    return 20;
  },
  getChartWidth(){
    return this.getWidth() - this.getRightMargin();
  },
  getChartHeight(){
    return this.getHeight() - this.getBottomMargin() - this.getTopMargin();
  },
  formatAverage(average){
    let reading = this.props.reading;
    if(Readings.meta[reading].formatter !== undefined){
      average = Readings.meta[reading].formatter(average);
    }else if(Readings.meta[reading].type == Boolean){
      average = d3.format(".2f")(average);
    }else{
      average = d3.format(".2f")(average);
    }

    average = average.toString();
    if(Readings.meta[reading].unit !== undefined){
      average = average + " " + Readings.meta[reading].unit;
    }else if(Readings.meta[reading].type == Boolean){
      average = average + "%";
    }

    return average;
  },
  drawD3Chart(){
    if(this.data.ready){
      let fromTime = this.data.fromTime.toDate();
      let toTime = this.data.toTime.toDate();

      let data = this.data.data;
      let total = 0;
      data.forEach(d => total = total+d[1]);
      let average = total/data.length;

      d3.select(this.refs.average).text("Average : "+this.formatAverage(average));

      let values = data.map(d => d[1]);
      let timeDomain = [fromTime, toTime];

      let x = d3.time.scale()
        .clamp(false)
        .domain(timeDomain)
        .range([0, this.getChartWidth()]);

      let y = d3.scale.linear()
        .clamp(false)
        .domain([0, _.max(values)])
        .range([this.getChartHeight(), 0]);

      /*
      let area = d3Shape.area()
      .x0(d => x(d.createdAt))
      .x1(d => x(d.createdAt))
      .y0(_ => 1000)
      .y1(d => y(d.reading));
      */

      let area = d3.svg.area()
        .x(d => x(d[0]))
        .y0(_ => this.getChartHeight())
        .y1(d => y(d[1]));

      let line = d3.svg.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

      if(Readings.meta[this.props.reading].type == Boolean){
        area = area.interpolate('step-after');
        line = line.interpolate('step-after');
      }

      d3.select(this.refs.area)
        .datum(data)
        .attr("d", area);

      d3.select(this.refs.line)
        .datum(data)
        .attr("d", line);

      let xAxis = d3.svg.axis()
        .scale(x);

      d3.select(this.refs.xAxis)
        .call(xAxis);

      let yAxis = d3.svg.axis()
        .orient("right")
        .scale(y);

      if(Readings.meta[this.props.reading].unit !== undefined){
        let yAxisFormat = y.tickFormat(10);
        yAxis.tickFormat(num => yAxisFormat(num)+" "+Readings.meta[this.props.reading].unit);
      }

      if(Readings.meta[this.props.reading].type == Boolean){
        yAxis = yAxis.ticks(1);
        yAxis.tickFormat(num => {
          if(num == 1){
            return "true";
          }else{
            return "false";
          }
        });
      }

      d3.select(this.refs.yAxis)
        .call(yAxis);
    }
  },
  getStyles(){
    let styles = {
      MachineLoading: {
        textAlign: "center"
      },
      AxisStyle: {
        fontSize: "100%"
      },
      Area: {
        fill: "#ff6262"
      },
      Line: {
        stroke: "#ff6262",
        strokeWidth: "2px",
        fill: "transparent"
      }
    };

    let color = new Color(styles.Area.fill);
    color = color.darken('0.5');
    styles.Line.stroke = color.rgbString();


    return styles;
  },
  render(){

    let styles = this.getStyles();

    if(this.data.ready){
      return <svg ref="svg" height={300} width="100%">
        <g transform={"translate(0,"+this.getTopMargin()+")"}>
          <path ref="area" style={styles.Area}></path>
          <path ref="line" style={styles.Line}></path>
        </g>
        <text fontFamily="Arial" fontSize="15" y="40" x="10" ref="average"></text>
        <g className="readingChartAxis" ref="xAxis" style={styles.AxisStyle} transform={"translate(0,"+(this.getChartHeight()+this.getTopMargin())+")"} />
        <g className="readingChartAxis" ref="yAxis" style={styles.AxisStyle} transform={"translate("+this.getChartWidth()+","+this.getTopMargin()+")"} />
      </svg>;
    }else{
      return <CircularProgress size={2}/>
    }

  }
});

export default Dimensions()(ReadingHistoryChart);
