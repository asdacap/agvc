import '../commonBoot';
import '../location/server/boot';
import '../reading/server/boot';
import '../machine/server/boot';
import '../client-response-time/server/boot';
import '../arduino-configurator/server/boot';
import '../client-machine-response-time/server/boot';
import { startMachineTCPListener } from '../machine-interface/server/TCPInterface'
import { startUDPListener } from '../machine-interface/server/UDPInterface'
import { startSerialListener } from '../arduino-configurator/server/SerialListener';
import { startOfflineSweeper } from '../machine-interface/server/AGVMachineHandler';
import Settings from '../Settings';

if(Settings.master){
  Meteor.startup(function(){
    startMachineTCPListener();
    startSerialListener();
    startOfflineSweeper();
    startUDPListener();
    //startMachineWebSocketListener();
  });
}
