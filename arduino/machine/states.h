#include "ConnectionManager.h"

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

  void onConnect(){
    sendOutOfCircuitStatus();
  }
}

#endif
