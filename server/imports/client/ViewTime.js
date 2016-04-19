import GlobalStates from '../global-state/GlobalStates';
import Settings from '../Settings';

var updateInterval = Settings.viewtime_update_interval;

// This class handle the viewTime.
// the viewTime store the time the view should be showing right now
// It has two mode, live and replay
// replay can start playing or not
// live will periodically update from GlobalStates
// playing will periodically update starting from a startPlayTime+time before startTime
class ViewTimeClass {
  constructor(){
    this.rtime = ReactiveVar(new Date());
    this.rmode = ReactiveVar("live");
    this.rplaying = ReactiveVar(false);
    this.startPlayTime = new Date();
    this.startTime = new Date();
    this.live();
  }

  // Start live update of serverTime
  live(){
    this.pause();
    this.intervalHandle = Meteor.setInterval(_ => {
      this.time = GlobalStates.getServerTime();
    }, updateInterval);
    this.rmode.set("live");
  }

  // Change the mode to replay
  // By default, pause
  replay(){
    Meteor.clearInterval(this.intervalHandle);
    this.rmode.set("replay");
    this.pause();
  }

  // Start playing
  start(){
    if(this.mode == "replay"){
      if(this.playing) return;

      this.startTime = this.rtime.get();
      this.startPlayTime = new Date();
      this.intervalHandle = Meteor.setInterval(_ => {
        let interval = new Date().getTime() - this.startPlayTime.getTime();
        this.time = new Date(this.startTime.getTime() + interval);
      }, updateInterval);
      this.rplaying.set(true);
    }
  }

  // Stop playing
  pause(){
    if(this.mode == "replay"){
      Meteor.clearInterval(this.intervalHandle);
      this.rplaying.set(false);
    }
  }

  set mode(value){
    if(this.mode == value) return;
    if(this.mode == "live" && value == "replay"){
      this.replay();
      this.rmode.set(value);
    }
    if(this.mode == "replay" && value == "live"){
      this.live();
      this.rmode.set(value);
    }
  }
  get mode(){
    return this.rmode.get();
  }
  set time(value){
    this.rtime.set(value);
  }
  get time(){
    return this.rtime.get();
  }
  get playing(){
    return this.rplaying.get();
  }
}

class FasterViewTime{
  constructor(interval){
    this.interval = interval;
    this.dep = new Tracker.Dependency();
    Meteor.autorun(_ => {
      this.lastUpdate = new Date();
      this.updatedTime = ViewTime.time;
      this.dep.changed();
    });
    Meteor.setInterval(_ => {
      if(ViewTime.mode == "replay" && ViewTime.playing == false) return;
      this.dep.changed();
    }, interval);
  }
  get time(){
    this.dep.depend();
    if(ViewTime.mode == "replay" && ViewTime.playing == false) return this.updatedTime;
    let offset = new Date().getTime() - this.lastUpdate.getTime();
    return new Date(this.updatedTime.getTime()+offset);
  }
}

let ViewTime = new ViewTimeClass();

export default ViewTime;
export { FasterViewTime };
