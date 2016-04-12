import '../commonBoot';
import '../location/server/RFIDReader';
import { startMachineTCPListener } from './machine-interface/TCPInterface'
import '../readings/boot';

Meteor.startup(function(){
  startMachineTCPListener();
  //startMachineWebSocketListener();
});
