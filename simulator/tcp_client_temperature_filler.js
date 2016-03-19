
var net = require('net');
var frame = require('frame-stream');

var socket = net.connect(10000);

setInterval(function(){
    num = Math.random()*100;
    socket.write("temperature:"+num+"\n");
    num++;
},1000);

socket.write("machineId:ABC\n");
