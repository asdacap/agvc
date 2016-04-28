
TrackerUpdateLimiter = function(func, delay){
  let dep = new Tracker.Dependency;
  let changed = false;

  dep.depend();
  Tracker.autorun(function(c){
    // No need to run again. It will be run again later
    if(changed) return;
    func();
    if(!c.firstRun){
      Meteor.setTimeout(_ => {
        dep.changed();
      }, delay);
    }
  });
}

export default TrackerUpdateLimiter;
