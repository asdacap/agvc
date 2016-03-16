
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connect', function(connection){
  console.log("Connection established");

  connection.send("machineId:ABC")

  var num = 0;
  setInterval(function(){
    num++;
    console.log("Sending number "+num);
    connection.send("Sending number "+num);
  }, 1000);
});

client.on('connectFailed', function(error){
  console.log("Connect failed "+error);
});

console.log("connecting");
client.connect('ws://127.0.0.1:8080/machine_websocket', null);
