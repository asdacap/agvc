#include "ConnectionManager.h"

void ConnectionManager::setup(SerialType *serial){
  Serial.println(F("Starting serial"));
  this->serial = serial;
  Serial.println(F("Assigned"));
  serial->begin(9600);
  Serial.println(F("Begin"));
  wifly.begin(serial, &Serial);
  Serial.println(F("Done"));
}

void ConnectionManager::wifiSetup(){
  Serial.println(F("Setting up wifi..."));
  wifly.setSSID(WIFI_SSID.c_str());
  wifly.setPassphrase(WIFI_PASSPHRASE.c_str());
  // Explicit set
  //wifly.setopt(PSTR("set wlan auth 3"));
  wifly.enableDHCP();
  wifly.dbgBegin(516);

  Serial.println(F("Joining wifi"));
  if (wifly.join()) {
    Serial.println(F("Joined"));
  } else {
    Serial.println(F("Failed"));
  }

  wifly.dbgDump();
}

void ConnectionManager::tcpSetup(){
  if (wifly.status.assoc) {
    // Don't connect if recently attempted
    if (millis() - lastTCPConnectAttempt < TCP_CONNECT_DELAY) {
      return;
    }

    lastTCPConnectAttempt = millis();

    // Use gateway as server... For easier development
    char SERVER_IP[10] = "127.0.0.1";
    if (wifly.getGateway(SERVER_IP, 10) != SERVER_IP) {
      Serial.println(F("Fail to obtain gateway"));
    }

    // Now connect...
    Serial.print(F("Connecting to "));
    Serial.print(SERVER_IP);
    Serial.print(F(" port "));
    Serial.println(SERVER_PORT);

    wifly.dbgBegin();
    String serverHostStr = "";
    serverHostStr.concat(SERVER_IP);
    serverHostStr.concat(":");
    serverHostStr.concat(SERVER_PORT);
    serverHostStr.toCharArray(serverHost, 30);
    // Attempt a non blocking connection
    wifly.open(SERVER_IP, SERVER_PORT, false);
    wifly.dbgDump();
  } else {
    Serial.println(F("WARNING: Attempt to connect TCP without a wifi association."));
  }
}

// Run each loop to check tcp connectivity stuff.
void ConnectionManager::loopTCPConnectivityCheck(){
  //if (wifly.status.assoc && !wifly.isConnected()) {
  //  if (lastTCPConnectAttempt < 0) {
  //    tcpSetup();
  //  }

  //  if (wifly.connecting) {
  //    if (wifly.openComplete()) {
  //      Serial.println(F("Open complete"));
  //      lastTCPConnectAttempt = -1;
  //      if (wifly.isConnected()) {
  //        onTCPConnected();
  //      }
  //    } else {
  //      Serial.println(F("Open not complete"));
  //    }
  //  }
  //}

  if(!wasConnected && connected()){
    onTCPConnected();
  }
  wasConnected = connected();
}

void ConnectionManager::onTCPConnected(){
  Serial.println("onTCPConnected");
  webSocketClient.path = "/machine_websocket";
  webSocketClient.host = serverHost;
  if (webSocketClient.handshake(*this)) {
    Serial.println(F("Handshake successful"));
  } else {
    Serial.println(F("Handshake failed"));
  }
}

void ConnectionManager::listenReceive(){
  String data;
  if (webSocketClient.getData(data)) {
    if (data.length() > 0) {
      Serial.print(F("Receive data: "));
      Serial.print(data);
      Serial.println(data);
    }
  }
}

void ConnectionManager::loop(){

  int ccount = millis()/500;

  if (loopcount != ccount) {
    loopcount = ccount;
    // WARNING: This will block
    //if (!wifly.isAssociated()) {
    //  Serial.println(F("Not associated"));
    //  wifiSetup();
    //} else {
    //  Serial.println(F("Associated"));
    //}

    loopTCPConnectivityCheck();
  }

  //listenReceive();
  digitalWrite(LED2, ledON ? HIGH : LOW);
}
