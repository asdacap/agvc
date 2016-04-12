import '../commonBoot';
import '../location/server/boot';
import '../reading/server/boot';
import '../arduino-configurator/server/boot';
import { startMachineTCPListener } from '../machine-interface/server/TCPInterface'
import { startSerialListener } from '../arduino-configurator/server/SerialListener';

Meteor.startup(function(){
  startMachineTCPListener();
  startSerialListener();
  //startMachineWebSocketListener();
});
