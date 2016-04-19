#include "settings.h"

#ifndef MOTOR_CONTROL
#define MOTOR_CONTROL

namespace MotorControl{
  int RightEn = 5;
  int RightDir= 4;
  int LeftEn  = 6;
  int LeftDir = 7;             //pin initialization for motor driver

  void setup(){
    pinMode(RightEn , OUTPUT);
    pinMode(RightDir, OUTPUT);
    pinMode(LeftEn  , OUTPUT);
    pinMode(LeftDir , OUTPUT);            //declare pins as OUTPUT for motor driver
  }

  // Offset
  void SmarterForward(int pwm_left,int pwm_right){
    int RIGHT_OFFSET = 0;
    int LEFT_OFFSET = 0;

    if(Settings.motorLROffset > 0){
      RIGHT_OFFSET += Settings.motorLROffset;
    }else{
      LEFT_OFFSET -= Settings.motorLROffset;
    }

    if(pwm_left > 0) pwm_left += RIGHT_OFFSET;
    else pwm_left -= RIGHT_OFFSET;

    if(pwm_right > 0) pwm_right += LEFT_OFFSET;
    else pwm_right -= LEFT_OFFSET;

    digitalWrite(RightDir, pwm_right > 0 ? LOW : HIGH);
    digitalWrite(LeftDir , pwm_left > 0 ? LOW : HIGH);
    analogWrite (RightEn , abs(pwm_right));   //PWM Speed Control
    analogWrite (LeftEn  , abs(pwm_left));
  }

}

#endif
