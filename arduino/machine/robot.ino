
//#include <SoftwareSerial.h>
#include "wifi_hq/WiFlyHQ.h"
#include "altsoftserial/AltSoftSerial.h"
#include "ConnectionManager.h"

//SoftwareSerial wifiSerial(8,9);
AltSoftSerial wifiSerial;
//ConnectionManager<SoftwareSerial> cManager;
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
  Serial.flush();
  checkButton();
  cManager.loop();

  digitalWrite(LED, (millis()/100)%2 ? HIGH : LOW);
}
