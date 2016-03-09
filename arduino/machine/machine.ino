
//#include <SoftwareSerial.h>
#include "wifi_hq/WiFlyHQ.h"
#include "altsoftserial/AltSoftSerial.h"
#include "ConnectionManager.h"

//SoftwareSerial wifiSerial(8,9);
HardwareSerial &wifiSerial = Serial3;
//ConnectionManager<SoftwareSerial> cManager;
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
  pinMode(BUTTON, INPUT_PULLUP);

  cManager.setup(&wifiSerial);
  Serial.println(F("Setup done"));
}

int prevButton = HIGH;

void checkButton(){
  int buttonVal = digitalRead(BUTTON);
  if(buttonVal != prevButton && buttonVal == LOW){
    cManager.sendData("button");
  }
  prevButton = buttonVal;
}

int mCount = 0;
void loop() {
  int nmCount = millis()/1000;
  if(nmCount != mCount){
    Serial.println(F("Looping"));
    mCount = nmCount;
  }

  //checkButton();
  cManager.loop();

  digitalWrite(LED, (millis()/50)%2 ? HIGH : LOW);
}
