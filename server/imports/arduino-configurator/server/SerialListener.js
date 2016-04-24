import serialjs from 'serialport-js';
import split from 'split';
import GlobalStates from '../../global-state/GlobalStates';
import ServerConfiguration from '../../server-configuration/ServerConfiguration';
import Promise from 'promise';

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
      let splitted = split();
      let status = 'waiting';

      function sendCommand(command){
        function doIt(){
          console.log('Doing it');
          let promise = new Promise((resolve, reject) => {
            console.log("Sending command:"+command);
            port.send(command+'\n');
            setTimeout(function(){
              resolve();
            }, 500);
          });

          return promise;
        }
        return doIt;
      }

      function doCommand(){
        status = 'configuring';
        let promise = sendCommand('wifiSSID:'+conf.wifiSSID)()
          .then(sendCommand('wifiPassphrase:'+conf.wifiPassphrase))
          .then(sendCommand('serverHost:'+conf.serverHost))
          .then(sendCommand('serverPort:'+conf.serverPort))
          .then(sendCommand('tcpConnectDelay:'+conf.tcpConnectDelay))
          .then(sendCommand('machineId:'+confObj.machineId))
          .then(sendCommand('save'))
          .then(sendCommand('dump'))
          .then(sendCommand('reconfigure'))
          .then(function(){
            console.log('Command sent');
            splitted.removeListener('data', startWait);
            port.close();
          }, function(){
            console.warn('failed to send command');
            splitted.removeListener('data', startWait);
            port.close();
          });
      }

      function startWait(data){
        if(status == 'waiting'){
          console.log("Finding 'Looping' keyword -> "+data);
          // Must wait for looping first
          if(data.trim() == 'Looping'){
            doCommand();
          }
        }else if(status == 'configuring'){
          console.log("Configuring -> "+data);
        }
      }

      function sendToSplit(data){
        splitted.write(data);
      }

      port.on('data', sendToSplit);
      splitted.on('data', startWait);
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
      ''
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
