
#include <SoftwareSerial.h>

#include "wifi_hq/WiFlyHQ.h"

int WIFI_SERIAL_RX = 8;
int WIFI_SERIAL_TX = 9;
//String WIFI_SSID = "localhost.localdomain";
//String WIFI_PASSPHRASE = "hgMTc01e";
String WIFI_SSID = "amirul-Z97-HD3";
String WIFI_PASSPHRASE = "8hAOrVND";
//String WIFI_SSID = "asdacap";
//String WIFI_PASSPHRASE = "mypassqwer";
String SERVER_IP = "10.42.0.2";
int SERVER_PORT = 10000;
const int BUFFER_SIZE = 128;

int LED = 4;
int LED2 = 6;
int BUTTON = 5;

WiFly wifly;
SoftwareSerial wifiSerial(WIFI_SERIAL_RX, WIFI_SERIAL_TX);

// For namespace
class ConnectionManager{

public:
  void wifiSetup(){
    Serial.println(F("Setting up wifi..."));
    wifiSerial.begin(9600);
    wifly.begin(&wifiSerial, &Serial);

    wifly.dbgBegin(512);
    wifly.setSSID(WIFI_SSID.c_str());
    wifly.setPassphrase(WIFI_PASSPHRASE.c_str());
    // Explicit set
    //wifly.setopt(PSTR("set wlan auth 3"));
    wifly.enableDHCP();

    Serial.println(F("Joining wifi"));
    if(wifly.join()){
      Serial.println(F("Joined"));
    }else{
      Serial.println(F("Failed"));
    }

    wifly.dbgDump();

    char SERVER_IP[10] = "127.0.0.1";
    if(wifly.getGateway(SERVER_IP,10) != SERVER_IP){
      Serial.println(F("Fail to obtain gateway"));
    }

    // Now connect...
    Serial.print(F("Connecting to "));
    Serial.print(SERVER_IP);
    Serial.print(F(" port "));
    Serial.print(SERVER_PORT);
    Serial.println();
    //if(wifly.open(serverIp, SERVER_PORT)){
    if(wifly.open(SERVER_IP, SERVER_PORT)){
      Serial.println(F("Server connected."));
    }else{
      Serial.println(F("Fail to connect to server."));
    }
  }

  // This is where it send new data
  // Also, it prefix it with 4 byte length
  void sendData(String data){
    if(wifly.isConnected()){

      // Prefix the string with length char and send it away
      long length = (long)(data.length());
      char *lengthChar = (char*)&length;
      char buffer[BUFFER_SIZE];
      if(length > BUFFER_SIZE-4){
        Serial.println(F("ERROR: buffer overflow"));
      }else{
        Serial.print(F("Sending : "));
        Serial.print(data);

        // WARNING: Big/Little endian may be a problem here
        for(int i=0;i<4;i++){
          buffer[i] = lengthChar[3-i];
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

  char receiveBuff[BUFFER_SIZE];
  long toReceiveLength = -1;
  long receivedBuffLength = 0;

  char receiveLengthBuff[4];
  int receiveLengthBuffLength = 0;

  void listenReceive(){
    while(wifly.available()){
      if(receiveLengthBuffLength < 4){
        receiveLengthBuff[receiveLengthBuffLength] = (char)wifly.read();
        receiveLengthBuffLength++;
        // If its full, assign it toReceiveLength
        if(receiveLengthBuffLength == 4){
          char *buffLength = (char*)&toReceiveLength;
          for(int i=0;i<4;i++){
            buffLength[i] = receiveLengthBuff[3-i];
          }

          if(toReceiveLength > BUFFER_SIZE-1){
            Serial.print(F("ERROR: Message to large. Message size: "));
            Serial.print(toReceiveLength);
            Serial.print(F(" Buffer size: "));
            Serial.println(BUFFER_SIZE);
          }
        }
      }else{
        receiveBuff[receivedBuffLength] = (char)wifly.read();
        receivedBuffLength++;

        if(receivedBuffLength == toReceiveLength){
          receiveBuff[receivedBuffLength] = '\0';
          doRead(receiveBuff, toReceiveLength);
          clearReceiveBuff();
        }
      }
    }
  }

  void clearReceiveBuff(){
    toReceiveLength = -1;
    receivedBuffLength = 0;
    receiveLengthBuffLength = 0;
  }

  bool ledON = true;
  void doRead(char* message, long length){
    Serial.println(F("Reading Message"));
    Serial.println(message);

    ledON = !ledON;
  }

  void loop(){
    listenReceive();
    digitalWrite(LED2, ledON ? HIGH : LOW);
  }
};

ConnectionManager cManager;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Setting up..."));
  // Just in case
  for(int i=0; i<14; i++){
    pinMode(i, INPUT);
  }
  pinMode(LED, OUTPUT);
  pinMode(LED2, OUTPUT);

  cManager.wifiSetup();
}

int prevButton = LOW;

void checkButton(){
  int buttonVal = digitalRead(BUTTON);
  if(buttonVal != prevButton && buttonVal == HIGH){
    cManager.sendData("button");
  }
  prevButton = buttonVal;
}

void loop() {
  checkButton();
  cManager.loop();

  digitalWrite(LED, (millis()/500)%2 ? HIGH : LOW);
}
