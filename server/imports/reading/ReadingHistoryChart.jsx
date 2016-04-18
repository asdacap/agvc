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

let ReadingHistoryChart = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object,
    reading: React.PropTypes.string
  },
  getInitialState(){
    var self = this;
    self.subFromDate = moment().subtract(1, 'minutes');
    return {
      chartWidth: 200
    }
  },
  getMeteorData(){
    var self = this;
    Chronos.liveUpdate(100);

    var newSubFromDate = moment().subtract(1, 'minutes');
    if(newSubFromDate.diff(self.subFromDate, 'minutes') > 10){
      self.subFromDate = newSubFromDate;
    }
    self.handle = Meteor.subscribe("Readings.fromDate",
      self.props.machine.machineId,
      self.props.reading,
      self.subFromDate.toDate());

    return {
      fromTime: moment().subtract(1, 'minutes'),
      ready: self.handle.ready(),
      readings: Readings.find({
        machineId: this.props.machine.machineId,
        type: this.props.reading,
        createdAt: { $gt: self.subFromDate.toDate() }
      }).fetch()
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
    return 40;
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
  drawD3Chart(){
    if(this.data.ready){
      var data = this.data.readings.map(d => [d.createdAt, d.reading]);
      var lastval = this.props.machine[this.props.reading];
      var firstval = (data[0] !== undefined ? data[0][1] : lastval);
      var toTime = moment();
      data.unshift([this.data.fromTime.toDate(), firstval]);
      data.push([toTime.toDate(), lastval]);

      var values = data.map(d => d[1]);
      var timeDomain = [this.data.fromTime.toDate(), toTime.toDate()];

      var x = d3.time.scale()
        .clamp(true)
        .domain(timeDomain)
        .range([0, this.getChartWidth()]);

      var y = d3.scale.linear()
        .clamp(true)
        .domain([0, _.max(values)])
        .range([this.getChartHeight(), 0]);

      /*
      var area = d3Shape.area()
      .x0(d => x(d.createdAt))
      .x1(d => x(d.createdAt))
      .y0(_ => 1000)
      .y1(d => y(d.reading));
      */

      var area = d3.svg.area()
        .x0(d => x(d[0]))
        .x1(d => x(d[0]))
        .y0(_ => this.getChartHeight())
        .y1(d => y(d[1]));

      var line = d3.svg.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

      if(Readings.meta[this.props.reading].type == Boolean){
        area = area.interpolate('step-after');
        lin = lin.interpolate('step-after');
      }

      d3.select(this.refs.area)
        .datum(data)
        .attr("d", area);

      d3.select(this.refs.line)
        .datum(data)
        .attr("d", line);

      var xAxis = d3.svg.axis()
        .scale(x);

      d3.select(this.refs.xAxis)
        .call(xAxis);

      var yAxis = d3.svg.axis()
        .orient("right")
        .scale(y);

      if(Readings.meta[this.props.reading].type == Boolean){
        yAxis = yAxis.ticks(1);
      }

      d3.select(this.refs.yAxis)
        .call(yAxis);
    }
  },
  getStyles(){
    var styles = {
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
        strokeWidth: "3px"
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
        <g className="readingChartAxis" ref="xAxis" style={styles.AxisStyle} transform={"translate(0,"+(this.getChartHeight()+this.getTopMargin())+")"} />
        <g className="readingChartAxis" ref="yAxis" style={styles.AxisStyle} transform={"translate("+this.getChartWidth()+","+this.getTopMargin()+")"} />
      </svg>;
    }else{
      return <CircularProgress size={2}/>
    }

  }
});

export default Dimensions()(ReadingHistoryChart);
