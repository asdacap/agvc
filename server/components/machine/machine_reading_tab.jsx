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
      self.handle = Meteor.subscribe("machine", self.props.machineId);
    })
    return {};
  },
  getMeteorData(){
    var self = this;

    return {
      ready: (self.handle.ready()),
      machine: Machines.findOne({ machineId: this.props.machineId }),
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
                <HistoryChart reading={this.props.reading} machine={this.data.machine} />
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
