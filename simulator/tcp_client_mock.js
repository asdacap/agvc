
var net = require('net');
var frame = require('frame-stream');
var prompt = require('prompt');

var socket = net.connect(10000);
var outFrame = frame.encode();
outFrame.pipe(socket);

prompt.start();

function getMessage(){
  prompt.get(['message'], function(err, result){
    var message = result.message;
    console.log("Sending message "+message);
    outFrame.write(message);
    getMessage();
  });
}

getMessage();
