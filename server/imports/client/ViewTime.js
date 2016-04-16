import GlobalStates from '../global-state/GlobalStates';

class ViewTimeClass {
  constructor(){
    this.rtime = ReactiveVar(new Date());
    this.rmode = ReactiveVar("live");
    this.live();
  }
  live(){
    this.intervalHandle = Meteor.setInterval(_ => {
      this.time = GlobalStates.getServerTime();
    }, 200);
    this.rmode.set("live");
  }
  replay(){
    Meteor.clearInterval(this.intervalHandle);
    this.rmode.set("replay");
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
}

let ViewTime = new ViewTimeClass();

export default ViewTime;
