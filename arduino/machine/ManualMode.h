#include "ConnectionManager.h"
#include "MotorControl.h"
#include "RateLimiter.h"

#ifndef MANUAL_MODE
#define MANUAL_MODE

namespace ManualMode{
  bool manualMode = false;
  long lastMoveCommand = 0;
  int direction = 0;

  void sendManualModeStatus(){
    if(manualMode){
      ConnectionManager::sendData("manualMode:1");
    }else{
      ConnectionManager::sendData("manualMode:0");
    }
  }

  void enterManual(){
    direction = 0;
    manualMode = true;
    sendManualModeStatus();
  }

  void exitManual(){
    direction = 0;
    manualMode = false;
    sendManualModeStatus();
  }

  void forward(){
    lastMoveCommand = millis();
    direction = 1;
  }

  void backward(){
    lastMoveCommand = millis();
    direction = 2;
  }

  void left(){
    lastMoveCommand = millis();
    direction = 3;
  }

  void right(){
    lastMoveCommand = millis();
    direction = 4;
  }

  void stop(){
    lastMoveCommand = millis();
    direction = 0;
  }

  RateLimiter logger(1000);

  void loop(){

    if(logger.isItOK()){
      Serial.print("Direction is ");
      Serial.println(direction);
    }
    // Stop it if no command in 1 second
    if(millis() - lastMoveCommand > 1000){
      direction = 0;
    }

    if(direction == 0){
      MotorControl::SmarterForward(0,0);
    }else if(direction == 1){
      MotorControl::SmarterForward(150,150);
    }else if(direction == 2){
      MotorControl::SmarterForward(-150,-150);
    }else if(direction == 3){
      MotorControl::SmarterForward(-150,150);
    }else if(direction == 4){
      MotorControl::SmarterForward(150,-150);
    }
  }

  void onConnect(){
    sendManualModeStatus();
  }

  void onDisconnect(){
    stop();
  }

  bool onCommand(String &command){
    if(command == F("enterManual")){
      enterManual();
      return true;
    }else if(manualMode){
      if(command == F("exitManual")){
        exitManual();
        return true;
      }else if(command == F("manualLeft")){
        left();
        return true;
      }else if(command == F("manualRight")){
        right();
        return true;
      }else if(command == F("manualForward")){
        forward();
        return true;
      }else if(command == F("manualBackward")){
        backward();
        return true;
      }else if(command == F("manualStop")){
        stop();
        return true;
      }
    }
    return false;
  }

}

#endif
