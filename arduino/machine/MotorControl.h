
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
  int RIGHT_OFFSET = 40;
  int LEFT_OFFSET = 0;
  void SmarterForward(int pwm_left,int pwm_right){

    if(pwm_left == 0 && pwm_right == 0){
    }else{
      pwm_left += LEFT_OFFSET;
      pwm_right += RIGHT_OFFSET;
    }
    digitalWrite(RightDir, pwm_right > 0 ? LOW : HIGH);
    digitalWrite(LeftDir , pwm_left > 0 ? LOW : HIGH);
    analogWrite (RightEn , abs(pwm_right));   //PWM Speed Control
    analogWrite (LeftEn  , abs(pwm_left));
  }

}

#endif
