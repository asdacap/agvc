var net = Meteor.npmRequire('net');
var frame = Meteor.npmRequire('frame-stream');

// Handle listening to port
var TCPListener = function(){
  this.server = net.Server();
  this.server.on('connection',Meteor.bindEnvironment(_.bind(this.onConnect, this)));
}

_.extend(TCPListener.prototype,{
  start(){
    console.log("starting tcp server...");
    this.server.listen(Settings.tcp_listen_port);
  },
  onConnect(socket){
    console.log("incoming connection...");
    new SocketHandler(socket);
  }
});

// Handle per-connection message
var SocketHandler = function(socket){
  this.socket = socket;
  this.socket.on('close', this.onClose);
  this.socket.on('error', this.onError);
  this.framed = this.socket.pipe(frame.decode());
  this.framed.on('data',this.onMessage);
  this.outMessage = frame.encode();
  this.outMessage.pipe(this.socket);
}

_.extend(SocketHandler.prototype,{
  onMessage: Meteor.bindEnvironment(function(message){
    console.log("new message "+message);
    Items.insert({text: message.toString()});
  }),
  onClose(){
    console.log("connection closed");
  },
  onError(){
    console.log("connection error");
  },
  sendMessage(message){
    this.outMessage.write(message);
  }
});

Meteor.startup(function(){
  var listener = new TCPListener();
  listener.start();
});
