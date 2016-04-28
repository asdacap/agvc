let timestamps = [];

export default nextMachineTimestamp = function(machineId){
  if(timestamps[machineId] === undefined){
    return new Date();
  }

  let newDate = new Date();
  if(newDate.getTime() > timestamps[machineId]){
    timestamps[machineId] = newDate.getTime();
    return newDate;
  }else{
    timestamps[machineId]++;
    return new Date(timestamps[machineId]);
  }
}
