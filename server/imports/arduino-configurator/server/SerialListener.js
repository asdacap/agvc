import serialjs from 'serialport-js';
import GlobalStates from '../../global-state/GlobalStates';
import ServerConfiguration from '../../server-configuration/ServerConfiguration';

let startSerialListener = function(){
  // For checking port existance
  Meteor.setInterval(function(){
    serialjs.find(Meteor.bindEnvironment(function(lists){
      GlobalStates.upsert({ name: "SerialList"}, {
        $set: {
          name: "SerialList",
          list: lists
        }
      });
    }));
  }, 1000);

  // For listening configure command
  let query = GlobalStates.find({ name: 'ConfigureArduino' });

  // Actual configuration
  let runConfiguration = function(confObj){
    GlobalStates.remove(confObj._id);
    let conf = ServerConfiguration.get();

    function start(port){
      function doCommand(){
        console.log('Configuring for arduino in port '+confObj.port);
        port.send('wifiSSID:'+conf.wifiSSID);
        port.send('wifiPassphrase:'+conf.wifiPassphrase);
        port.send('serverHost:'+conf.serverHost);
        port.send('serverPort:'+conf.serverPort);
        port.send('tcpConnectDelay:'+conf.tcpConnectDelay);
        port.send('machineId:'+confObj.machineId);
        port.send('save');
        setTimeout(function(){
          console.log("Command sent");
          port.close();
        },2000);
      }

      function startWait(data){
        console.log("Finding 'Looping' keyword -> "+data);
        // Must wait for looping first
        if(data.trim() == 'Looping'){
          doCommand();
          port.removeListener('data', startWait);
        }
      }

      port.on('data', startWait);
      port.on('error', function(e){
        console.warn("Got port error "+e.toString());
      });
      port.on('close', function(e){
        console.log("port closed");
      });
    }

    console.log("Port is "+confObj.port);
    serialjs.open(
      confObj.port,
      start,
      '\n'
    );
  }

  // Actual listening
  if(query.count() > 0){
    query.fetch().forEach(function(confObj){
      runConfiguration(confObj);
    });
  }

  query.observe({
    added(confObj){
      runConfiguration(confObj);
    }
  });
};

export { startSerialListener };
