
template <class SerialType>
void ConnectionManager<SerialType>::setup(SerialType *serial){
  Serial.println(F("Starting serial"));
  this->serial = serial;
  Serial.println(F("Assigned"));
  serial->begin(9600);
  Serial.println(F("Begin"));
  wifly.begin(serial, &Serial);
  Serial.println(F("Done"));
}

// Run each loop to check tcp connectivity stuff.
template <class SerialType>
void ConnectionManager<SerialType>::loopTCPConnectivityCheck(){
  if(!wasConnected && connected()){
    onTCPConnected();
  }
  wasConnected = connected();
}

template <class SerialType>
void ConnectionManager<SerialType>::onTCPConnected(){
  Serial.println(F("onTCPConnected"));
  webSocketClient.path = "/machine_websocket";
  webSocketClient.host = serverHost;
  if (webSocketClient.handshake(*this)) {
    Serial.println(F("Handshake successful"));
    onWebSocketConnected();
  } else {
    Serial.println(F("Handshake failed"));
  }
}

template <class SerialType>
void ConnectionManager<SerialType>::onWebSocketConnected(){
  webSocketClient.sendData("machineId:"+MACHINE_ID);
}

template <class SerialType>
void ConnectionManager<SerialType>::listenReceive(){
  String data;
  if (webSocketClient.getData(data)) {
    if (data.length() > 0) {
      Serial.print(F("Receive data: "));
      Serial.println(data);
    }
  }
}

template <class SerialType>
void ConnectionManager<SerialType>::loop(){

  int ccount = millis()/500;

  if (loopcount != ccount) {
    loopcount = ccount;
    loopTCPConnectivityCheck();
  }

  //listenReceive();
  digitalWrite(LED2, ledON ? HIGH : LOW);
}
