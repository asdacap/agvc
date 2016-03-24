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
  },
  componentDidUpdate(){
    var self = this;
    setTimeout(function(){
      self.resize();
    },100);
  },
  componentWillUnmount(){
    window.removeEventListener('resize', this.resize);
  },
  render(){

    if(this.data.ready){
      var data = this.data.readings.slice(0);
      var lastval = this.props.machine[this.props.reading];
      var firstval = (data[0] !== undefined ? data[0].reading : lastval);
      var toTime = moment();
      //var fromTime = this.data.fromTime;
      var fromTime = this.data.fromTime;
      data.unshift({
        reading: firstval,
        createdAt: fromTime.toDate()
      });
      data.push({
        reading: lastval,
        createdAt: toTime.toDate()
      });

      var domain = [fromTime.toDate(), toTime.toDate()];

      data = _.filter(data, d => d.createdAt >= fromTime.toDate());

      var chartSeries = [
        {
          field: 'reading',
          name: Readings.readingTitle[this.props.reading],
          color: 'blue'
        }
      ]
      return <AreaChart
        xScale="time"
        width={this.state.chartWidth}
        height={500}
        x={d => d.createdAt}
        data={data}
        domain={domain}
        chartSeries={chartSeries} />;
    }else{
      return <CircularProgress size={2}/>
    }

  }
});
