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

let ReadingHistoryChart = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object,
    reading: React.PropTypes.string
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

    let currentTime = self.fasterViewTime.time;
    let fromTime = moment(currentTime).subtract(1, 'minutes');
    let toTime = moment(currentTime);

    let subFromTime = new Date(fromTime.toDate().getTime());
    let subToTime = new Date(moment(toTime).add(1, 'minutes').toDate().getTime());
    subFromTime.setSeconds(0,0);
    subToTime.setSeconds(0,0);

    self.handle = Meteor.subscribe("Readings.createdAtRange",
      self.props.machine.machineId,
      self.props.reading,
      subFromTime,
      subToTime);

    return {
      fromTime: fromTime,
      toTime: toTime,
      ready: self.handle.ready(),
      readings: Readings[self.props.reading].find({
        machineId: this.props.machine.machineId,
        createdAt: {
          $gte: fromTime.toDate(),
          $lte: toTime.toDate()
        }
      }, {
        sort: { createdAt: 1 }
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
  drawD3Chart(){
    if(this.data.ready){
      let fromTime = this.data.fromTime;
      let toTime = this.data.toTime;

      let data = this.data.readings.map(d => [d.createdAt, d.value]);
      data = data.filter(d => d[0].getTime() <= toTime.toDate().getTime() && d[0].getTime() >= fromTime.toDate().getTime() );

      let lastval = this.props.machine[this.props.reading];
      if(data.length > 0){
        lastval = data[data.length-1][1];
      }
      let firstval = (data[0] !== undefined ? data[0][1] : lastval);
      data.unshift([this.data.fromTime.toDate(), firstval]);
      data.push([toTime.toDate(), lastval]);

      let values = data.map(d => d[1]);
      let timeDomain = [fromTime.toDate(), toTime.toDate()];

      let x = d3.time.scale()
        .clamp(true)
        .domain(timeDomain)
        .range([0, this.getChartWidth()]);

      let y = d3.scale.linear()
        .clamp(true)
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
        <g className="readingChartAxis" ref="xAxis" style={styles.AxisStyle} transform={"translate(0,"+(this.getChartHeight()+this.getTopMargin())+")"} />
        <g className="readingChartAxis" ref="yAxis" style={styles.AxisStyle} transform={"translate("+this.getChartWidth()+","+this.getTopMargin()+")"} />
      </svg>;
    }else{
      return <CircularProgress size={2}/>
    }

  }
});

export default Dimensions()(ReadingHistoryChart);
