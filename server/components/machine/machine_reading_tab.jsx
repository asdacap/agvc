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
      self.fromDate = Chronos.liveMoment().subtract(1, 'minutes');
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
    var title = this.props.machineId +": "+this.props.reading;

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title={title} onLeftIconButtonTouchTap={this.toggleNav}/>
            {
              this.data.machine === undefined ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> :  <div>
                History of {self.props.machineId}
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
  render(){
    var data = this.props.readings.map(d => [d.createdAt, d.reading]);
    var lastval = this.props.machine[this.props.reading];
    var firstval = (data[0] !== undefined ? data[0][1] : lastval);
    var toTime = moment();
    data.unshift([this.data.fromTime.toDate(), firstval]);
    data.push([toTime.toDate(), lastval]);

    var values = data.map(d => d[1]);
    var timeDomain = [this.data.fromTime.toDate(), toTime.toDate()];

    var x = d3Scale.scaleTime()
      .clamp(true)
      .domain(timeDomain)
      .range([0, 1000]);

    var y = d3Scale.scaleLinear()
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

    var area = d3Shape.area()
      .x0(d => x(d[0]))
      .x1(d => x(d[0]))
      .y0(_ => 1000)
      .y1(d => y(d[1]));

    return <svg width="100%" height={300} viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <path d={area(data)} fill="green"/>
    </svg>
  }
});
