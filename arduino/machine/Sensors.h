#include "RateLimiter.h"
#include "ConnectionManager.h"

#ifndef SENSORS
#define SENSORS

namespace Sensors{

  int BATTERY_SENSOR = 0;
  RateLimiter batteryRateLimiter(1000);

  void loopBatterySensor(){
    if(batteryRateLimiter.isItOK()){
      int value = analogRead(BATTERY_SENSOR);
      ConnectionManager::sendData("battery:"+String(value));
    }
  }

  int TEMPERATURE_SENSOR = 1;
  RateLimiter temperatureRateLimiter(1000);

  void loopTemperatureSensor(){
    if(temperatureRateLimiter.isItOK()){
      int value = analogRead(TEMPERATURE_SENSOR);
      ConnectionManager::sendData("temperature:"+String(value));
    }
  }

  void loop(){
    loopBatterySensor();
    loopTemperatureSensor();
  }

  void setup(){
  }

}

#endif
