
#include <SoftwareSerial.h>
#include "wifi_hq/WiFlyHQ.h"

int WIFI_SERIAL_RX = 12;
int WIFI_SERIAL_TX = 13;
String WIFI_SSID = "localhost.localdomain";
String WIFI_PASSPHRASE = "hgMTc01e";
int LED = 4;

WiFly wifly;
SoftwareSerial wifiSerial(WIFI_SERIAL_RX, WIFI_SERIAL_TX);

// For namespace
class ConnectionManager{
  int BUFFER_SIZE = 128;

public:
  void wifiSetup(){
    Serial.println(F("Setting up wifi..."));
    wifiSerial.begin(9600);
    wifly.begin(&wifiSerial);

    wifly.setSSID(WIFI_SSID.c_str());
    wifly.setPassphrase(WIFI_PASSPHRASE.c_str());
    wifly.enableDHCP();
    Serial.println(F("Joining wifi"));
    if(wifly.join()){
      Serial.println(F("Joined"));
    }else{
      Serial.println(F("Failed"));
    }
    Serial.println(F("Wifi setted-up..."));
  }

  // This is where it send new data
  // Also, it prefix it with 4 byte length
  void sendData(String data){
    if(wifly.isConnected()){

      // Prefix the string with length char and send it away
      long length = (long)(data.length());
      char *length_char = (char*)&length;
      char buffer[BUFFER_SIZE];
      if(length > BUFFER_SIZE-4){
        Serial.println(F("ERROR: buffer overflow"));
      }else{
        // WARNING: Big/Little endian may be a problem here
        for(int i=0;i<4;i++){
          buffer[i] = length_char[i];
        }
        for(int i=0;i<length;i++){
          buffer[i+4] = data.charAt(i);
        }
        wifly.write(buffer, length+4);
      }

    }else{
      Serial.println(F("WARNING: Attempting to send data with no TCP connection!"));
    }
  }


  // This is where it listen for incoming data
  void loop(){

  }
}

ConnectionManager c_manager;

void setup() {
  Serial.begin(9600);
  Serial.println("Setting up...");
  // Just in case
  for(int i=0; i<14; i++){
    pinMode(i, INPUT);
  }
  pinMode(4, OUTPUT);

  c_manager.wifiSetup();
}

int on = true;

void loop() {
  delay(300);
  on = !on;
  digitalWrite(4, on ? HIGH : LOW);

  c_manager.loop();
}
