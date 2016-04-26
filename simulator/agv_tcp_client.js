
var settings = {
  machineId: "ABC",
  tcpPort: 10000
}

if(process.argv.length > 2){
  settings.machineId = process.argv[2];
}

var net = require('net');
var split = require('split');
var prompt = require('prompt');

var socket = net.connect(settings.tcpPort);
socket.setNoDelay(true);
var splitted = socket.pipe(split());

function sendMessage(message){
  socket.write(message+"\n");
}

splitted.on("data", function(data){
  data = data.toString();
  console.log("Got data "+data);
  if(data.indexOf("p:") == 0){
    sendMessage(data);
  }else if(data.indexOf("cP:") == 0){
    sendMessage(data);
  }
});

sendMessage("machineId:"+settings.machineId);

var rfids = [
  "04 8e a1 c2 d7 38 81",
  "04 46 9e c2 d7 38 81",
  "04 49 9f c2 d7 38 81",
  "04 81 a5 c2 d7 38 81"
]

setInterval(function(){
  sendMessage("temperature:"+(Math.floor(Math.random()*100)));
  sendMessage("battery:"+(Math.floor(Math.random()*500)));
  sendMessage("loopInterval:"+(Math.floor(Math.random()*10)));
}, 1000);

var rfidnum = 0;
setInterval(function(){
  sendMessage("rfid:"+rfids[rfidnum]);

  rfidnum++;
  rfidnum = rfidnum%rfids.length;
}, 5000);
