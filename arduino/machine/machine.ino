#include "wifi_hq/WiFlyHQ.h"
#include "ConnectionManager.h"
#include "wiflyConfigurator.h"
#include "lineFollowing.h"
#include "rfid.h"

HardwareSerial &wifiSerial = Serial1;
ConnectionManager<HardwareSerial> cManager;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Setting up..."));
  // Just in case
  for(int i=0; i<14; i++){
    pinMode(i, INPUT);
  }
  pinMode(LED, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(CONNECT_INPUT, INPUT);
  digitalWrite(CONNECT_INPUT, LOW);

  configureWifly(wifiSerial);

  cManager.setup(&wifiSerial);
  Serial.println(F("Setup done"));

  RFID::setup();
  LineFollowing::setup();
}

int mCount = 0;
void loop() {
  // A debug for checking if it is looping
  int nmCount = millis()/1000;
  if(nmCount != mCount){
    Serial.println(F("Looping"));
    mCount = nmCount;
  }

  cManager.loop();

  // Blinking. Useful to detect hangs
  digitalWrite(LED, (millis()/50)%2 ? HIGH : LOW);

  RFID::loop(cManager);
  LineFollowing::loop();
}
