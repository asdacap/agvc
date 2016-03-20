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


MachineReadingHistoryPage = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machineId: React.PropTypes.string,
    reading: React.PropTypes.string
  },
  getInitialState(){
    var self = this;
    Tracker.autorun(function(){
      self.fromDate = moment(Chronos.currentTime(10000)).subtract(1, 'minutes');
      self.handle = Meteor.subscribe("machine", self.props.machineId);
      self.handle2 = Meteor.subscribe("readings",
        self.props.machineId, self.props.reading, self.fromDate.toDate());
    })
    return {};
  },
  getMeteorData(){
    var self = this;

    return {
      ready: (self.handle.ready() && self.handle2.ready()),
      machine: Machines.findOne({ machineId: this.props.machineId }),
      readings: Readings.find({ machineId: this.props.machineId, type: this.props.reading, createdAt: { $gt: self.fromDate.toDate() } }).fetch()
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render(){
    var self = this;
    var title = this.props.machineId +": "+Readings.readingTitle[this.props.reading];

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title={title} onLeftIconButtonTouchTap={this.toggleNav}/>
            {
              this.data.machine === undefined ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> :  <div>
                <HistoryChart readings={this.data.readings} reading={this.props.reading} machine={this.data.machine} />
              </div>
            }
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});

var HistoryChart = React.createClass({
  mixins: [ReactMeteorData],
  propTypes: {
    machine: React.PropTypes.object,
    reading: React.PropTypes.string,
    readings: React.PropTypes.array
  },
  getMeteorData(){
    Chronos.liveUpdate(100);
    return {
      fromTime: moment().subtract(1, 'minutes')
    }
  },
  getInitialState(){
    return {
      chartWidth: 200
    }
  },
  resize(){
    this.setState({ chartWidth: this.getDOMNode().offsetWidth});
  },
  componentDidMount(){
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  componentWillUnmount(){
    window.removeEventListener('resize', this.resize);
  },
  render(){

    var data = this.props.readings.slice(0);
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
  }
});
