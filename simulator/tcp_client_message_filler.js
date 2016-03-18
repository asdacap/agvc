
var net = require('net');
var frame = require('frame-stream');

var socket = net.connect(10000);
var outFrame = frame.encode();
outFrame.pipe(socket);

var num = 1;
setInterval(function(){
    console.log("Sending number "+num);
    outFrame.write("Sending number "+num+"\n");
    num++;
},1000);

socket.write("machineId:ABC\n");
