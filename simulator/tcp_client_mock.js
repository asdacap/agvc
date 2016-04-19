
var net = require('net');
var split = require('split');
var prompt = require('prompt');

var socket = net.connect(10000);
var splitted = socket.pipe(split());

socket.write("machineId:ABC\n");

splitted.on("data", function(data){
  console.log("Got data "+data);
  socket.write(data+"\n");
});


prompt.start();

function getMessage(){
  prompt.get(['message'], function(err, result){
    var message = result.message;
    if(message !== undefined){
      console.log("Sending message "+message);
      socket.write(message+"\n");
    }
    getMessage();
  });
}

getMessage();
