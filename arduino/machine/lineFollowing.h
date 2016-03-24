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

int count = 0;    //setting the initial value of count equal to 0

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void Forward(int pwm_left,int pwm_right){
  digitalWrite(RightDir, LOW);
  digitalWrite(LeftDir , LOW);
  analogWrite (RightEn , pwm_right);   //PWM Speed Control
  analogWrite (LeftEn  , pwm_left);
}
void Backward(int pwm_left,int pwm_right){
  digitalWrite(RightDir, HIGH);
  digitalWrite(LeftDir , HIGH);
  analogWrite (RightEn , pwm_right);   //PWM Speed Control
  analogWrite (LeftEn  , pwm_left);        //control speed motor
}
void right(int pwm_left,int pwm_right){
  digitalWrite(RightDir, HIGH);
  digitalWrite(LeftDir , LOW);
  analogWrite (RightEn , pwm_right);   //PWM Speed Control
  analogWrite (LeftEn  , pwm_left);
}
void left(int pwm_left,int pwm_right){
  digitalWrite(RightDir, LOW);
  digitalWrite(LeftDir , HIGH);
  analogWrite (RightEn , pwm_right);   //PWM Speed Control
  analogWrite (LeftEn  , pwm_left);
}
void stopp()
{
  digitalWrite(RightDir, LOW);
  digitalWrite(LeftDir , LOW);
  analogWrite (RightEn , 0);   //PWM Speed Control
  analogWrite (LeftEn  , 0);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
void followline(){

  if (DS_1 == 1 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){       // 1  0  0  0  0
    left (100, 100);
    Serial.print("LEFT");
    Serial.println();
  }

  else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 0 && DS_4 == 0 && DS_5 == 0){  // 1  1  0  0  0
    left (100, 110);
    Serial.print("LEFT");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 0&& DS_4 == 0 && DS_5 == 0){  // 0  1  0  0  0
    Forward (125, 160);
    Serial.print("FOWARD");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 1 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  1  1  0  0
    Forward (125, 165);
    Serial.print("FOWARD");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 0 && DS_5 == 0){  // 0  0  1  0  0
    Forward (145, 120);
    Serial.print("FOWARD");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 1 && DS_4 == 1 && DS_5 == 0){  // 0  0  1  1  0
    Forward (140, 150);
    Serial.print("FOWARD");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 0){  // 0  0  0  1  0
    Forward (135, 150);
    Serial.print("FOWARD");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 ==0 && DS_3 == 0 && DS_4 == 1 && DS_5 == 1){  // 0  0  0  1  1
    right (100, 100);
    Serial.print("RIGHT");
    Serial.println();
  }

  else if (DS_1 == 0 && DS_2 == 0 && DS_3 == 0 && DS_4 == 0 && DS_5 == 1){  // 0  0  0  0  1
    right (100, 100);
    Serial.print("RIGHT");
    Serial.println();
  }
  else if (DS_1 == 1 && DS_2 == 1 && DS_3 == 1 && DS_4 == 1 && DS_5 == 1){  // 1  1  1  1  1
    Forward (145, 120);
    Serial.print("FOWARD");
    Serial.println();
  }
  else
  {
    Serial.print("No combination found");
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void lineSetup()
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

  Forward(100,100);
}

void lineLoop()
{
  Serial.println("Line loop");
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
