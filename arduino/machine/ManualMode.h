#include "ConnectionManager.h"
#include "MotorControl.h"
#include "RateLimiter.h"

#ifndef MANUAL_MODE
#define MANUAL_MODE

namespace ManualMode{
  bool manualMode = false;
  long lastMoveCommand = 0;
  int motorL = 0;
  int motorR = 0;

  void sendManualModeStatus(){
    if(manualMode){
      ConnectionManager::sendData("manualMode:1");
    }else{
      ConnectionManager::sendData("manualMode:0");
    }
  }

  void enterManual(){
    motorL = 0;
    motorR = 0;
    manualMode = true;
    sendManualModeStatus();
  }

  void exitManual(){
    motorL = 0;
    motorR = 0;
    manualMode = false;
    sendManualModeStatus();
  }

  void forward(){
    lastMoveCommand = millis();
    motorL = 150;
    motorR = 150;
  }

  void backward(){
    lastMoveCommand = millis();
    motorL = -150;
    motorR = -150;
  }

  void left(){
    lastMoveCommand = millis();
    motorL = -150;
    motorR = +150;
  }

  void right(){
    lastMoveCommand = millis();
    motorL = +150;
    motorR = -150;
  }

  void manualLeft(int leftValue){
    lastMoveCommand = millis();
    motorL = leftValue;
  }

  void manualRight(int rightValue){
    lastMoveCommand = millis();
    motorR = rightValue;
  }

  void stop(){
    lastMoveCommand = millis();
    motorL = 0;
    motorR = 0;
  }

  RateLimiter logger(1000);

  void loop(){

    if(logger.isItOK()){
      Serial.print("Direction is ");
      Serial.print(motorL);
      Serial.print(":");
      Serial.println(motorR);
    }
    // Stop it if no command in 1 second
    if(millis() - lastMoveCommand > 1000){
      motorL = 0;
      motorR = 0;
    }

    MotorControl::SmarterForward(motorL,motorR);
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
      }else if(command.startsWith(F("manualMotorL:"))){
        manualLeft(command.substring(13).toInt());
        return true;
      }else if(command.startsWith(F("manualMotorR:"))){
        manualRight(command.substring(13).toInt());
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
