#include "ConnectionManager.h"
#include "debounce.h"

#ifndef STATES
#define STATES

namespace States{
  bool outOfCircuit = false;


  void sendOutOfCircuitStatus(){
    if(outOfCircuit){
      ConnectionManager::sendData("outOfCircuit:1");
    }else{
      ConnectionManager::sendData("outOfCircuit:0");
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

  Debounce<String> obstructedDebouncer(ConnectionManager::sendData, 1000);
  void sendObstructedStatus(){
    if(obstructed){
      obstructedDebouncer.call("obstructed:1");
    }else{
      obstructedDebouncer.call("obstructed:0");
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

  void onConnect(){
    sendOutOfCircuitStatus();
    sendObstructedStatus();
  }
}

#endif
