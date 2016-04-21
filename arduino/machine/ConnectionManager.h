#include "settings.h"
#include "GlobalListener.h"
#include "RateLimiter.h"

#ifndef CONNECTION_MANAGER
#define CONNECTION_MANAGER
// For namespace

typedef HardwareSerial SerialType;

namespace ConnectionManager{
  SerialType *serial;

  int CONNECTED_IN = 26;
  int CONNECTED_LED = 28;
  bool isConnected = false;
  long lastMessage = 0;

  RateLimiter helloRate(1000);

  bool connected();
  void registerMachine();

  void setup(SerialType *serial){
    Serial.println(F("Starting serial"));
    ConnectionManager::serial = serial;
    Serial.println(F("Assigned"));
    serial->begin(9600);

    pinMode(CONNECTED_IN, INPUT);
    pinMode(CONNECTED_LED, OUTPUT);
  }

  void sendDataL(String data, bool logIt=true){
    if(connected()){
      if(logIt){
        Serial.print(F("Sending data "));
        Serial.println(data);
      }
      serial->println(data);
    }else{
      if(logIt){
        Serial.print(F("Cannot send due to no connection "));
        Serial.println(data);
      }
    }
  }

  void sendData(String data){
    sendDataL(data, true);
  }

  bool connected(){
    return isConnected;
  }

  // Delegates to stream
  size_t write(uint8_t d) { return serial->write(d); }
  int available() { return serial->available(); }
  int read() { return serial->read(); }
  int peek() { return serial->peek(); }
  void flush() { serial->flush(); }

  void listenReceive(){
    if(connected()){
        lastMessage++; // Do something useless
    }
    if(serial->available()){
      String data = serial->readStringUntil('\n');
      if (data.length() > 0) {
        lastMessage = millis();
        isConnected = true;

        if(data == F("identify") ){
          registerMachine();
        }else if(data.startsWith(F("p:"))){
          sendData(data);
        }else{
          Serial.print(F("Receive data: "));
          Serial.println(data);
          GlobalListener::onData(data);
        }
      }
    }
  }

  void registerMachine(){
    Serial.println(F("Sending registration..."));
    serial->print(F("machineId:"));
    serial->println(Settings.machineId);
    GlobalListener::onConnect();
  }

  void loop(){
    if(!isConnected){
      if(helloRate.isItOK()) serial->println(F("hello"));
    }else if(millis() - lastMessage > 5){
      isConnected = false;
    }
    listenReceive();

    digitalWrite(CONNECTED_LED, connected() ? HIGH : LOW);
  }
}

#endif
