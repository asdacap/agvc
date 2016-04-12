import '../commonBoot';
import '../location/server/boot';
import '../reading/server/boot';
import { startMachineTCPListener } from '../machine-interface/server/TCPInterface'

Meteor.startup(function(){
  startMachineTCPListener();
  //startMachineWebSocketListener();
});
