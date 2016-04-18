#include "states.h"
#include "MotorControl.h"
#include "PID_v1.h"

namespace LineFollowing{

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

    MotorControl::SmarterForward(pwm_left, pwm_right);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  double curDir = 0;
  double outDir = 0;
  double neutral = 0;
  PID directionPID(&curDir, &outDir, &neutral, 0.95, 0.2, 0.03, DIRECT);

  void followline(){

    if (DS_1 == 1 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){       // 1  0  0  0  0
      curDir = -4;
    }

    else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){  // 1  1  0  0  0
      curDir = -3;
    }

    else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 0&& DS_4 == 0 && DS_5 == 0){  // 0  1  0  0  0
      curDir = -2;
    }

    else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  1  1  0  0
      curDir = -1;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  0  1  0  0
      curDir = 0;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 1 && DS_5 == 0){  // 0  0  1  1  0
      curDir = 1;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 0){  // 0  0  0  1  0
      curDir = 2;
    }

    else if (DS_1 == 0 && DS_2 ==0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 1){  // 0  0  0  1  1
      curDir = 3;
    }

    else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 1){  // 0  0  0  0  1
      curDir = 4;
    }
    else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 1 && DS_4 == 1 && DS_5 == 1){  // 1  1  1  1  1
      curDir = 0;
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

    curDir*=-1;
    directionPID.SetTunings(Settings.PID_Kp, Settings.PID_Ki, Settings.PID_Kd);
    directionPID.Compute();


    int baseL = Settings.motorBaseSpeed;
    int baseR = Settings.motorBaseSpeed;

    int multiplier = Settings.motorPIDMultiplier;
    int diffRange = Settings.motorDiffRange; // Maximum difference in motor speed

    Serial.println("outDir is "+String(outDir));

    if(outDir < 0){
      baseL += outDir*multiplier;
      baseR = min(baseR, baseL+diffRange);
    }else{
      baseR -= outDir*multiplier;
      baseL = min(baseL, baseR+diffRange);
    }

    // Apply it
    SmarterForward(baseL, baseR);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  void setup()
  {
    pinMode(pin_1 , INPUT);
    pinMode(pin_2 , INPUT);
    pinMode(pin_3 , INPUT);
    pinMode(pin_4 , INPUT);
    pinMode(pin_5 , INPUT);         //declare pins as INPUT for sensors

    directionPID.SetMode(AUTOMATIC);
    directionPID.SetSampleTime(25);
    directionPID.SetOutputLimits(-5,5);
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
