#include "ConnectionManager.h"
#include "wiflyConfigurator.h"
#include "lineFollowing.h"
#include "rfid.h"
#include "debounce.h"
#include "states.h"
#include "RateLimiter.h"
#include "ManualMode.h"
#include "MotorControl.h"
#include "Sensors.h"

HardwareSerial &wifiSerial = Serial1;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Setting up..."));
  Setting::loadSettings();
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
  MotorControl::setup();
  Sensors::setup();
  States::setup();
}

void reconfigure(){
  configureWifly(wifiSerial);
}

long totalDuration = 0;
long prevTime = 0;
int loopCount = 0;
RateLimiter loopDurationLimiter(1000);

void calculateLoopInterval(){
  if(prevTime == 0){ // The loop just started
    prevTime = millis();
    return;
  }

  long duration = millis()-prevTime;
  prevTime = millis();
  totalDuration+=duration;
  loopCount++;

  if(loopDurationLimiter.isItOK()){
    if(loopCount == 0) loopCount = 1;
    long loopInterval = totalDuration/loopCount;
    totalDuration = 0;
    loopCount = 0;
    ConnectionManager::sendDataL("loopInterval:"+String(loopInterval), false);
  }
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
  if(ManualMode::manualMode){
    ManualMode::loop();
  }else{
    LineFollowing::loop();
  }
  Setting::loopCommand();
  Sensors::loop();
  States::loop();
  calculateLoopInterval();
}

namespace GlobalListener{
  void onConnect(){
    States::onConnect();
    ManualMode::onConnect();
  }
  void onDisconnect(){
    ManualMode::onDisconnect();
  }
  void onData(String s){
    bool handled = ManualMode::onCommand(s);
    if(!handled) handled = Setting::onWifiCommand(s);
    if(!handled){
      Serial.println("Command not handled : "+s);
    }
  }
}
