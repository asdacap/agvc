// Place where initial stuff lives

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

if(Meteor.isServer){
  Meteor.startup(function(){
    startMachineTCPListener();
    startMachineWebSocketListener();
  });
}
