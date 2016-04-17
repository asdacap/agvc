import React from 'react';
import {
  AppBar,
  FlatButton,
  RaisedButton,
  TextField,
  TimePicker,
  DatePicker,
  Toolbar,
  ToolbarTitle,
  ToolbarGroup
} from 'material-ui';
import MenuIcon from 'material-ui/lib/svg-icons/navigation/menu';
import PlayIcon from 'material-ui/lib/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/lib/svg-icons/av/pause';
import ViewTime from '../client/ViewTime';
import moment from 'moment';

let ViewTimeToolbar = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData(){
    return {
      mode: ViewTime.mode,
      playing: ViewTime.playing,
      viewTime: ViewTime.time
    }
  },
  toggleMode(){
    if(this.data.mode == "live"){
      ViewTime.replay();
    }else{
      ViewTime.live();
    }
  },
  togglePlay(){
    if(this.data.mode == "replay"){
      if(this.data.playing){
        ViewTime.pause();
      }else{
        ViewTime.start();
      }
    }
  },
  toggleNav(){
    this.props.toggleNav();
  },

  getInitialState () {
    return {
      muiTheme: this.context.muiTheme,
    };
  },

  //// For underline color
  contextTypes: {
    muiTheme: React.PropTypes.object,
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },
  //update theme here
  componentWillMount () {
    let newMuiTheme = _.extend({},this.state.muiTheme);
    newMuiTheme.textField = _.extend({},this.state.muiTheme.textField);
    newMuiTheme.textField.borderColor = "#4f4f4f";
    newMuiTheme.textField.textColor = newMuiTheme.appBar.textColor;
    newMuiTheme.toolbar = _.extend({},this.state.muiTheme.toolbar);
    newMuiTheme.toolbar.backgroundColor = newMuiTheme.appBar.color;
    newMuiTheme.toolbar.height = newMuiTheme.appBar.height;
    newMuiTheme.toolbar.iconColor = newMuiTheme.appBar.textColor;

    this.setState({
      muiTheme: newMuiTheme,
    });
  },
  //pass down updated theme to children
  getChildContext () {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  //// Date setter/getter
  setDate(e, newDate){
    ViewTime.time = newDate;
  },
  setTime(e, newTime){
    ViewTime.time = newTime;
  },
  setSecond(e){
    var newSecond = e.target.value;
    if(newSecond == "") newSecond = "0";
    newSecond = parseInt(newSecond, 0);
    if(isNaN(newSecond)) return;
    if(newSecond >= 60) return;
    if(newSecond < 0) return;
    ViewTime.time = moment(ViewTime.time).second(newSecond).toDate();
  },

  getStyles(){
    let styles = {
      PickerRoot: {
        display: "inline-block",
        float: "left",
        height: "56px",
        marginRight: "1ex"
      },
      BaseTextField: {
        fontSize: "130%",
        marginTop: "7px"
      },
      PickerTextField: {
        width: "6em"
      },
      TimeTextField: {
        width: "4em"
      },
      SecondPickerTextField: {
        marginRight: "1ex",
        float: "left",
        width: "2em"
      },
      ToolbarButton: {
        marginRight: 0
      }
    };

    _.extend(styles.PickerTextField, styles.BaseTextField);
    _.extend(styles.TimeTextField, styles.BaseTextField);
    _.extend(styles.SecondPickerTextField, styles.BaseTextField);
    return styles;
  },

  render(){

    let rightGroup = null;
    let styles = this.getStyles();

    if(this.data.mode == "live"){
      rightGroup = <ToolbarGroup float="right">
        <ToolbarTitle text={moment(this.data.viewTime).format('l LTS')} />
        <RaisedButton label={this.data.mode} onTouchTap={this.toggleMode} style={styles.ToolbarButton} primary={true}/>
      </ToolbarGroup>;
    }else{
      if(this.data.playing){
        rightGroup = <ToolbarGroup float="right">
          <ToolbarTitle text={moment(this.data.viewTime).format('l LTS')} />
          <RaisedButton label={this.data.playing ? "Playing" : "Paused"}
            icon={<PlayIcon />}
            onTouchTap={this.togglePlay}
            style={styles.ToolbarButton}/>
          <RaisedButton label={this.data.mode} onTouchTap={this.toggleMode} style={styles.ToolbarButton}/>
        </ToolbarGroup>;
      }else{
        rightGroup = <ToolbarGroup float="right">
          <DatePicker
            style={styles.PickerRoot}
            onChange={this.setDate}
            textFieldStyle={styles.PickerTextField}
            value={this.data.viewTime} />
          <TimePicker
            style={styles.PickerRoot}
            onChange={this.setTime}
            textFieldStyle={styles.TimeTextField}
            defaultTime={this.data.viewTime} />
          <TextField
            style={styles.SecondPickerTextField}
            onChange={this.setSecond}
            value={moment(this.data.viewTime).second()} />
          <RaisedButton label={this.data.playing ? "Playing" : "Paused"}
            icon={<PauseIcon />}
            onTouchTap={this.togglePlay}
            style={styles.ToolbarButton}/>
          <RaisedButton label={this.data.mode} onTouchTap={this.toggleMode} style={styles.ToolbarButton}/>
        </ToolbarGroup>;
      }
    }

    return <AppBar style={{ overflow: "hidden" }} title="Dashboard" onLeftIconButtonTouchTap={this.toggleNav}>
      {rightGroup}
    </AppBar>;
  }
});

export default ViewTimeToolbar;
