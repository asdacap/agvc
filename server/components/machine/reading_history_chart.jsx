var { AppCanvas,
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
   } = MUI;

var styles = {
  MachineLoading: {
    textAlign: "center"
  },
  AxisStyle: {
    fontSize: "200%"
  }
}

ReadingHistoryChart = React.createClass({
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
    self.handle = Meteor.subscribe("readings",
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
  resize(){
    var newWidth = ReactDOM.findDOMNode(this).offsetWidth;
    if(this.state.chartWidth != newWidth){
      this.setState({ chartWidth: newWidth });
    }
  },
  componentDidMount(){
    var self = this;
    self.resize();
    setTimeout(function(){
      self.resize();
    },100);
    window.addEventListener('resize', this.resize);

    this.drawD3Chart();
  },
  componentDidUpdate(){
    var self = this;
    setTimeout(function(){
      self.resize();
    },100);

    this.drawD3Chart();
  },
  componentWillUnmount(){
    window.removeEventListener('resize', this.resize);
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
        .range([0, 1000]);

      var y = d3.scale.linear()
        .clamp(true)
        .domain([0, _.max(values)])
        .range([1000, 0]);

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
        .y0(_ => 1000)
        .y1(d => y(d[1]));

      if(Readings.readingType[this.props.reading] == Boolean){
        area = area.interpolate('step-after');
      }

      d3.select(this.refs.area)
        .datum(data)
        .attr("d", area);

      var xAxis = d3.svg.axis()
        .scale(x);

      d3.select(this.refs.xAxis)
        .call(xAxis);

      var yAxis = d3.svg.axis()
        .orient("left")
        .scale(y);

      if(Readings.readingType[this.props.reading] == Boolean){
        yAxis = yAxis.ticks(1);
      }

      d3.select(this.refs.yAxis)
        .call(yAxis);
    }
  },
  render(){

    if(this.data.ready){
      return <svg ref="svg" svg width="100%" height={300} viewBox="0 0 1050 1070" preserveAspectRatio="none">
        <g transform="translate(50,20)">
          <path ref="area" stroke="#000000" fill="#ff0000"></path>
        </g>
        <g ref="xAxis" style={styles.AxisStyle} transform="translate(50,1020)" />
        <g ref="yAxis" style={styles.AxisStyle} transform="translate(50,20)" />
      </svg>;
    }else{
      return <CircularProgress size={2}/>
    }

  }
});
