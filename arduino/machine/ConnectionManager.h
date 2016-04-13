#include "settings.h"
#include "wifi_hq/WiFlyHQ.h"

#ifndef CONNECTION_MANAGER
#define CONNECTION_MANAGER
// For namespace

typedef HardwareSerial SerialType;

namespace ConnectionManager{
  char serverHost[50];
  long lastTCPConnectAttempt = -1;
  bool ledON = true;
  bool wasConnected = false;
  bool handshaking = false;
  bool webSocketAvailable = false;
  SerialType *serial;
  WiFly wifly;
  int loopcount = 0;

  bool connected();
  void onTCPConnected();
  void registerMachine();

  void setup(SerialType *serial){
    Serial.println(F("Starting serial"));
    ConnectionManager::serial = serial;
    Serial.println(F("Assigned"));
    serial->begin(9600);
    Serial.println(F("Begin"));
    wifly.begin(serial, &Serial);
    Serial.println(F("Done"));
  }

  void sendData(String data){
    if(connected()){
      Serial.print(F("Sending data "));
      Serial.println(data);
      wifly.println(data);
    }else{
      Serial.print(F("Cannot send due to no connection "));
      Serial.println(data);
    }
  }

  // Things to actually implement
  bool connected(){ return wifly.isConnected(); }
  bool stop(){ return wifly.close(); }

  // Delegates to stream
  size_t write(uint8_t d) { return serial->write(d); }
  int available() { return serial->available(); }
  int read() { return serial->read(); }
  int peek() { return serial->peek(); }
  void flush() { serial->flush(); }

  // Run each loop to check tcp connectivity stuff.
  void loopTCPConnectivityCheck(){
    if(!wasConnected && connected()){
      onTCPConnected();
    }
    wasConnected = connected();
  }

  void onTCPConnected(){
  }

  void listenReceive(){
    if(!connected()) return;
    if(wifly.available()) {
      String data = wifly.readStringUntil('\n');
      if (data.length() > 0) {
        Serial.print(F("Receive data: "));
        Serial.println(data);
        if(data == F("identify") ){
          registerMachine();
        }
      }
    }
  }

  void registerMachine(){
    Serial.println(F("Sending registration..."));
    wifly.print(F("machineId:"));
    wifly.println(Settings.machineId);
  }

  void loop(){
    loopTCPConnectivityCheck();
    listenReceive();
    digitalWrite(LED2, ledON ? HIGH : LOW);

    static int mCount = 0;
    int nmCount = millis()/1000;
    if(mCount != nmCount){
      mCount = nmCount;
    }
  }
}

#endif
