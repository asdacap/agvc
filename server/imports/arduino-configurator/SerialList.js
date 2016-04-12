import GlobalStates from '../global-state/GlobalStates';

export default SerialList = {
  get(){
    let record = GlobalStates.findOne({ name: "SerialList" });
    if(record !== undefined) return record.list;
    return [];
  }
};
