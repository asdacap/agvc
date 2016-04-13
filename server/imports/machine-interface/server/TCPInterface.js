
import net from 'net';
import split from 'split';
import AGVMachineHandler from './AGVMachineHandler'

// Handle listening to port
var TCPListener = function(){
  this.server = net.Server();
  this.server.on('connection',Meteor.bindEnvironment(_.bind(this.onConnect, this)));
}

_.extend(TCPListener.prototype,{
  start(){
    console.log("Starting tcp server on port "+Settings.tcp_listen_port+"...");
    this.server.listen(Settings.tcp_listen_port);
  },
  onConnect(socket){
    console.log("Incoming connection...");
    new SocketHandler(socket);
  }
});


// Handle per-connection message
var SocketHandler = function(socket){
  bindAllFunction(this);
  this.socket = socket;
  this.socket.on('error', this.onError);
  this.splitted = this.socket.pipe(split());
  this.machineHandler = new AGVMachineHandler(this);
  this.splitted.on('data', this.machineHandler.onData);
  this.socket.on('close', this.onClose);
  this.socket.on('end', this.onEnd);
}

_.extend(SocketHandler.prototype, {
  close(){
    this.socket.end();
  },
  onClose(){
    console.log("Socket close");
    this.machineHandler.onClose();
  },
  onEnd(){
    console.log("Socket end");
    this.machineHandler.onClose();
  },
  onError(){
    console.log("connection error");
  },
  sendMessage(message){
    this.socket.write(message+"\n");
  },
  getName(){
    return 'tcp';
  }
});

function bindAllFunction(obj){
  _.each(_.functions(obj), function(func_name){
    obj[func_name] = Meteor.bindEnvironment(_.bind(obj[func_name], obj));
  });
  return obj;
};

startMachineTCPListener = function(){
  var listener = new TCPListener();
  listener.start();
}

export { startMachineTCPListener, TCPListener };
