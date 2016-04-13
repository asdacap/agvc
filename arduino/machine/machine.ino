#include "wifi_hq/WiFlyHQ.h"
#include "ConnectionManager.h"
#include "wiflyConfigurator.h"
#include "lineFollowing.h"
#include "rfid.h"
#include "debounce.h"

HardwareSerial &wifiSerial = Serial1;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Setting up..."));
  loadSettings();
  // Just in case
  for(int i=0; i<14; i++){
    pinMode(i, INPUT);
  }
  pinMode(LED, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);

  configureWifly(wifiSerial);

  ConnectionManager::setup(&wifiSerial);
  Serial.println(F("Setup done"));

  RFID::setup();
  LineFollowing::setup();
}

void reconfigure(){
  configureWifly(wifiSerial);
}

int mCount = 0;
void loop() {
  // Blinking. Useful to detect hangs
  digitalWrite(LED, (millis()/50)%2 ? HIGH : LOW);

  // A debug for checking if it is looping
  int nmCount = millis()/5000;
  if(nmCount != mCount){
    Serial.println(F("Looping"));
    mCount = nmCount;
  }

  ConnectionManager::loop();
  RFID::loop();
  LineFollowing::loop();
  loopCommand();
}
