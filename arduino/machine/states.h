#include "ConnectionManager.h"
#include "debounce.h"

#ifndef STATES
#define STATES

namespace States{
  bool outOfCircuit = false;

  Debounce<String> outOfCircuitDebouncer(ConnectionManager::sendData, 10000);
  void sendOutOfCircuitStatus(){
    if(outOfCircuit){
      outOfCircuitDebouncer.call("outOfCircuit:1", 2);
    }else{
      outOfCircuitDebouncer.call("outOfCircuit:0", 1);
    }
  }

  void setOutOfCircuit(){
    outOfCircuit = true;
    sendOutOfCircuitStatus();
  }

  void clearOutOfCircuit(){
    outOfCircuit = false;
    sendOutOfCircuitStatus();
  }


  bool obstructed = false;
  int OBSTACLE_SENSOR = 24;

  Debounce<String> obstructedDebouncer(ConnectionManager::sendData, 10000);
  void sendObstructedStatus(){
    if(obstructed){
      obstructedDebouncer.call("obstructed:1", 2);
    }else{
      obstructedDebouncer.call("obstructed:0", 1);
    }
  }

  void setObstructed(){
    obstructed = true;
    sendObstructedStatus();
  }

  void clearObstructed(){
    obstructed = false;
    sendObstructedStatus();
  }

  void loopObstacleSensor(){
    if(digitalRead(OBSTACLE_SENSOR) == LOW){
      States::setObstructed();
    }else if(obstructed){
      States::clearObstructed();
    }
  }

  void onConnect(){
    sendOutOfCircuitStatus();
    sendObstructedStatus();
  }

  void loop(){
    loopObstacleSensor();
  }

  void setup(){
    pinMode(OBSTACLE_SENSOR, INPUT);
  }
}

#endif
