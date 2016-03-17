
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
  Serial.println(F("Sending registration..."));
  wifly.print(F("machineId:"));
  wifly.println(MACHINE_ID);
}

template <class SerialType>
void ConnectionManager<SerialType>::listenReceive(){
  if(!connected()) return;
  if(wifly.available()) {
    String data = wifly.readStringUntil('\n');
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
