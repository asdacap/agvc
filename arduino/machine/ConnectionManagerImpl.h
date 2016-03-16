
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
  webSocketClient.host = "127.0.0.1";
}

// Run each loop to check tcp connectivity stuff.
template <class SerialType>
void ConnectionManager<SerialType>::loopTCPConnectivityCheck(){

  // Async handshake. Not working for some reason. Not enough buffer it seems.
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
      webSocketAvailable = true;
    }
  }
  */

  // Sync handshake. May cause delay.
  if(!wasConnected && connected()){
    Serial.println(F("Starting handshake"));
    if(webSocketClient.handshake(*this, true)){
      Serial.println(F("Handshake successful"));
      onWebSocketConnected();
      webSocketAvailable = true;
    }else{
      Serial.println(F("Handshake failed"));
      webSocketAvailable = false;
    }
  }

  wasConnected = connected();
  if(!wasConnected){
    webSocketAvailable = false;
  }
}

template <class SerialType>
void ConnectionManager<SerialType>::onWebSocketConnected(){
  webSocketClient.sendData("machineId:"+MACHINE_ID);
}

template <class SerialType>
void ConnectionManager<SerialType>::listenReceive(){
  if(!webSocketAvailable) return;
  String data;
  if (webSocketClient.getData(data)) {
    if (data.length() > 0) {
      Serial.print(F("Receive data: "));
      Serial.println(data);
    }
  }
}

template <class SerialType>
void ConnectionManager<SerialType>::slowLoop(){
  /*
  if(!wifly.isConnected()){
    wifly.open(SERVER_IP.c_str(), 8080, true);
  }
  */
}

template <class SerialType>
void ConnectionManager<SerialType>::loop(){
  loopTCPConnectivityCheck();
  listenReceive();
  digitalWrite(LED2, ledON ? HIGH : LOW);

  static int mCount = 0;
  int nmCount = millis()/1000;
  if(mCount != nmCount){
    slowLoop();
    mCount = nmCount;
  }

}
