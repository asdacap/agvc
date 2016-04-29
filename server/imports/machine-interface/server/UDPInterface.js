import dgram from 'dgram';
import split from 'split';
import AGVMachineHandler from './AGVMachineHandler'
import Settings from '../../Settings';

// A mapping of ip:port and UDPHandler
let udpConnections = {};
let socket = undefined;
let socketAvailable = false;

let bindAllFunction = function(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};

class UDPHandler {
  constructor(address, port){
    console.log("Creating new UDP Handler");
    bindAllFunction(this);
    this.address = address;
    this.port = port;
    this.key = this.address+":"+this.port;
    this.machineHandler = new AGVMachineHandler(this);
    this.splitted = split();
    this.splitted.on('data', this.machineHandler.onData);
  }

  incomingMessage(message){
    this.splitted.write(message.toString());
  }

  close(){
    console.log("Closing connection");
    udpConnections[this.key] = undefined;
    this.machineHandler.onClose();
  }

  sendMessage(message){
    message = new Buffer(message+"\n");
    if(socketAvailable){
      socket.send(message, 0, message.length, this.port, this.address);
    }else{
      console.warn("UDP Socket unavailable. Message "+message+" not sent.");
    }
  }
}


let startUDPListener = function(){
  if(socket !== undefined){
    console.warn("UDP Socket already started");
    return;
  }

  let bind = Meteor.bindEnvironment;

  socket = dgram.createSocket('udp4');

  socket.on('error', (err) => {
    console.warn("UDP Socket error "+err.stack);
  });

  socket.on('message', bind((msg, rinfo) => {
    let key = rinfo.address+":"+rinfo.port;
    if(udpConnections[key] === undefined){
      udpConnections[key] = new UDPHandler(rinfo.address, rinfo.port);
    }

    udpConnections[key].incomingMessage(msg);
  }));

  socket.on('listening', bind(() => {
    console.log("Listening on UDP socket");
    socketAvailable = true;
  }));

  socket.on('close', bind(() => {
    console.log("UDP socket closed");
    socketAvailable = false;
  }));

  socket.bind(Settings.udp_listen_port);
}

export { startUDPListener };
