
template <class SerialType>
void ConnectionManager<SerialType>::setup(SerialType *serial){
  Serial.println(F("Starting serial"));
  this->serial = serial;
  Serial.println(F("Assigned"));
  serial->begin(9600);
  Serial.println(F("Begin"));
  wifly.begin(serial, &Serial);
  Serial.println(F("Done"));

  webSocketClient.path = "/machine_websocket";
  webSocketClient.host = serverHost;
}

// Run each loop to check tcp connectivity stuff.
template <class SerialType>
void ConnectionManager<SerialType>::loopTCPConnectivityCheck(){

  // Async handshake. Not working for some reason.
  /*
  if(!wasConnected && connected()){
    Serial.println(F("Starting handshake"));
    webSocketClient.handshake(*this, false);
    handshaking = true;
  }
  if(handshaking){
    int resp = webSocketClient.handshake(*this, false);
    Serial.print(F("Respond is : "));
    Serial.println(resp);
    if(resp < 0){
      Serial.println(F("Error completing websocket handshake"));
      handshaking = false;
    }else if(resp == 2){
      Serial.println(F("Handshake successful"));
      onWebSocketConnected();
      handshaking = false;
    }
  }
  */

  // Sync handshake. May cause delay.
  if(!wasConnected && connected()){
    Serial.println(F("Starting handshake"));
    if(webSocketClient.handshake(*this, true)){
      Serial.println(F("Handshake successful"));
      onWebSocketConnected();
    }else{
      Serial.println(F("Handshake failed"));
    }
  }

  wasConnected = connected();
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
