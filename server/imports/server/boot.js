import '../commonBoot';
import '../location/server/boot';
import '../reading/server/boot';
import '../arduino-configurator/server/boot';
import { startMachineTCPListener } from '../machine-interface/server/TCPInterface'
import { startSerialListener } from '../arduino-configurator/server/SerialListener';
import { startOfflineSweeper } from '../machine-interface/server/AGVMachineHandler';

Meteor.startup(function(){
  startMachineTCPListener();
  startSerialListener();
  startOfflineSweeper();
  //startMachineWebSocketListener();
});
