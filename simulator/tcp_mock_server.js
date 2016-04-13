
// Plans for TCP is scrapped in favour of websocket

var net = require('net');
var frame = require('frame-stream');
var _ = require('underscore');

var allSockets = [];

// Handle listening to port
var TCPListener = function(){
  this.server = net.Server();
  this.server.on('connection',_.bind(this.onConnect, this));
}

_.extend(TCPListener.prototype,{
  start(){
    console.log("Starting tcp server on port "+10000+"...");
    this.server.listen(10000);
  },
  onConnect(socket){
    console.log("Incoming connection...");
    new SocketHandler(socket);
  }
});

// Handle per-connection message
var SocketHandler = function(socket){
  var self = this;
  this.socket = socket;
  this.socket.setKeepAlive(true, 10000);
  this.socket.setNoDelay(true);
  this.socket.on('close', this.onClose);
  this.socket.on('error', this.onError);
  this.socket.on('data', function(data){
    console.log("data received "+data.toString());
  });
  this.outMessage = frame.encode();
  this.outMessage.pipe(this.socket);
  this.socket.setTimeout(5000, this.onTimeout);

  allSockets.push(this);

  var num = 0;
  setInterval(function(){
    console.log("Countdown "+num);
    num++;
  }, 1000);
}

_.extend(SocketHandler.prototype,{
  onClose(){
    var idx = allSockets.indexOf(this);
    allSockets.splice(idx, 1);
    console.log("connection closed");
  },
  onError(){
    console.log("connection error");
  },
  onTimeout(){
    console.log("On timeout");
    this.socket.end();
  }
});

var listener = new TCPListener();
listener.start();
