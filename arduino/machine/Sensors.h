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


  void loop(){
    loopBatterySensor();
  }

  void setup(){
  }

}

#endif
