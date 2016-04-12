import React from 'react';

var styles={
  MachineOnlineText: {
    textWeight: "bold",
    color: "rgb(0, 128, 0)"
  },
  MachineOfflineText: {
    color: "rgba(0, 0, 0, 0.54)"
  }
}

var MachineOnlineText = function(props){
  if(props.machine.online){
    return <span style={styles.MachineOnlineText}>Online</span>;
  }else{
    return <span style={styles.MachineOfflineText}>Offline</span>;
  }
};

export { MachineOnlineText };
