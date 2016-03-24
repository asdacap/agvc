
var net = require('net');

var socket = net.connect(10000);

setInterval(function(){
    num = Math.random()*100;
    socket.write("temperature:"+num+"\n");
    num++;
},200);

socket.write("machineId:ABC\n");
