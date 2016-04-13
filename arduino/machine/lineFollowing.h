#include "states.h"

namespace LineFollowing{

  int RightEn = 5;
  int RightDir= 4;
  int LeftEn  = 6;
  int LeftDir = 7;             //pin initialization for motor driver

  int pin_1   = A1;
  int pin_2   = A2;
  int pin_3   = A3;
  int pin_4   = A4;
  int pin_5   = A5;
  int pin_cal = 8;  //pin initialization for sensors

  int DS_1 = 0;
  int DS_2 = 0;
  int DS_3 = 0;
  int DS_4 = 0;
  int DS_5 = 0;         //initilize variables for sensor reading

  long lastForward = 0;
  void SmarterForward(int pwm_left,int pwm_right){

    lastForward = millis();
    //Serial.print("Forward! ");
    //Serial.print(pwm_left);
    //Serial.print(" ");
    //Serial.println(pwm_right);

    digitalWrite(RightDir, pwm_right > 0 ? LOW : HIGH);
    digitalWrite(LeftDir , pwm_left > 0 ? LOW : HIGH);
    analogWrite (RightEn , abs(pwm_right));   //PWM Speed Control
    analogWrite (LeftEn  , abs(pwm_left));
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  int S0 = -100;
  int S1 = -50;
  int S2 = 0;
  int S3 = 50;
  int S4 = 100;

  int speedL[10] = {
    S0,
    S1,
    S2,
    S3,
    S4,
    S4,
    S4,
    S4,
    S4,
    S4
  };

  int speedR[10] = {
    S4,
    S4,
    S4,
    S4,
    S4,
    S3,
    S2,
    S1,
    S0,
    S4
  };

  void followline(){

    int curDir = 0;
    if (DS_1 == 1 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){       // 1  0  0  0  0
      curDir = 0;
    }

    else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){  // 1  1  0  0  0
      curDir = 1;
    }

    else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 0&& DS_4 == 0 && DS_5 == 0){  // 0  1  0  0  0
      curDir = 2;
    }

    else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  1  1  0  0
      curDir = 3;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  0  1  0  0
      curDir = 4;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 1 && DS_5 == 0){  // 0  0  1  1  0
      curDir = 5;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 0){  // 0  0  0  1  0
      curDir = 6;
    }

    else if (DS_1 == 0 && DS_2 ==0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 1){  // 0  0  0  1  1
      curDir = 7;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 1){  // 0  0  0  0  1
      curDir = 8;
    }
    else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 1 && DS_4 == 1 && DS_5 == 1){  // 1  1  1  1  1
      curDir = 9;
    }
    else
    {
      static long lastC;
      if(millis() - lastForward > 1000){
        long newC = millis()/1000;
        if(newC!=lastC){
          States::setOutOfCircuit();
        }
        SmarterForward(0,0);
      }
      return;
    }

    if(States::outOfCircuit){
      States::clearOutOfCircuit();
    }

    // Offset
    int RIGHT_OFFSET = 40;
    int LEFT_OFFSET = 0;

    // Apply it
    SmarterForward(speedL[curDir]+LEFT_OFFSET, speedR[curDir]+RIGHT_OFFSET);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  void setup()
  {
    pinMode(RightEn , OUTPUT);
    pinMode(RightDir, OUTPUT);
    pinMode(LeftEn  , OUTPUT);
    pinMode(LeftDir , OUTPUT);            //declare pins as OUTPUT for motor driver
    pinMode(pin_1 , INPUT);
    pinMode(pin_2 , INPUT);
    pinMode(pin_3 , INPUT);
    pinMode(pin_4 , INPUT);
    pinMode(pin_5 , INPUT);         //declare pins as INPUT for sensors
  }

  void loop()
  {
    DS_1 = digitalRead(pin_1);
    DS_2 = digitalRead(pin_2);
    DS_3 = digitalRead(pin_3);
    DS_4 = digitalRead(pin_4);
    DS_5 = digitalRead(pin_5);

    // Serial.print(DS_1);
    //Serial.println();
    // delay(1000);

    followline();
  }

}
