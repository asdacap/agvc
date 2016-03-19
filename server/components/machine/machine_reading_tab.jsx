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
    this.handle = Meteor.subscribe("machine", this.props.machineId);
    this.handle2 = Meteor.subscribe("readings", this.props.machineId, this.props.reading, moment().subtract(1, 'hours').toDate());
    return {};
  },
  getMeteorData(){
    return {
      ready: (this.handle.ready() && this.handle2.ready()),
      machine: Machines.findOne({ machineId: this.props.machineId }),
      readings: Readings.find({ machineId: this.props.machineId, type: this.props.reading, createdAt: { $gt: moment().subtract(1, 'hours').toDate() } }).fetch()
    }
  },
  toggleNav(){
    this.refs.navPage.toggleNav();
  },
  render(){
    var self = this;

    if(this.data.ready){
      var values = this.data.readings.map(function(reading){
        return <li>{reading.reading.toString()}</li>;
      });
    }

    return <AppCanvas>
        <SideNavPage ref="navPage">
          <div>
            <AppBar title={this.props.machineId} onLeftIconButtonTouchTap={this.toggleNav}/>
            {
              !this.data.ready ? <div style={styles.MachineLoading}>
                <CircularProgress size={2}/>
              </div> :  <div>
                History of {this.props.machineId} : {this.props.reading}
                <ul>
                  {values}
                </ul>
              </div>
            }
          </div>
        </SideNavPage>
      </AppCanvas>;
  }
});
