#include "WString.h"
#include <EEPROM.h>

#ifndef SETTING_DEFINED
#define SETTING_DEFINED
  //String WIFI_SSID = "localhost.localdomain";
  //String WIFI_PASSPHRASE = "hgMTc01e";
  //extern String WIFI_SSID;
  //extern String WIFI_PASSPHRASE;
  //String WIFI_SSID = "asdacap";
  //String WIFI_PASSPHRASE = "mypassqwer";
  //extern String SERVER_IP;
  //extern String SERVER_PORT;
  //extern String TCP_CONNECT_DELAY; // Delay between tcp connection attempt.
  int LED = 22;
  int LED2 = 23;
  int LED3 = 24;
  int LED4 = 25;
  int BUTTON = 26;


  struct{
    char wifiSSID[51];
    char wifiPassphrase[51];
    char serverHost[51];
    char machineId[51];
    int serverPort;
    int tcpConnectDelay;
    int motorBaseSpeed;
    int motorLROffset;
    float motorPIDMultiplierRatio;
    int motorVoltageCompensation;
    int motorDiffRange;
    double PID_Kp;
    double PID_Ki;
    double PID_Kd;
    int version;
  } Settings;

extern void reconfigure();
extern String MACHINE_ID;

namespace Setting{

  int MAGIC_VERSION = 123;

  void saveSettings(){
    Serial.println("Saving settings...");
    Settings.version = MAGIC_VERSION;
    EEPROM.put(0, Settings);
  }

  void loadSettings(){
    Serial.println("Loading settings...");
    EEPROM.get(0, Settings);
    if(Settings.version != MAGIC_VERSION){
      Serial.println("Invalid settings found. Setting default.");
      strcpy(Settings.wifiSSID, "localhost.localdomain");
      strcpy(Settings.wifiPassphrase, "hgMTc01e");
      strcpy(Settings.serverHost, "10.42.0.2");
      strcpy(Settings.machineId, "ABC");
      Settings.serverPort = 10000;
      Settings.tcpConnectDelay = 5;
      Settings.motorBaseSpeed = 100;
      Settings.motorLROffset = 0;
      Settings.motorPIDMultiplierRatio = 0.3;
      Settings.motorVoltageCompensation = 30;
      Settings.motorDiffRange = 200;
      Settings.PID_Kp = 0.95;
      Settings.PID_Ki = 0.1;
      Settings.PID_Kd = 0.05;
      Settings.version = MAGIC_VERSION;
      saveSettings();
    }
  }

  void loopCommand(){
    if(!Serial.available()) return;

    String command = Serial.readStringUntil('\n');
    if(command == F("save")){
      saveSettings();
    }else if(command == F("reconfigure")){
      reconfigure();
    }else if(command == F("load")){
      loadSettings();
    }else if(command == F("dump")){
      Serial.println(F("Dumping configuration.."));
      Serial.println(String(F("wifiSSID:")) + String(Settings.wifiSSID));
      Serial.println(String(F("wifiPassphrase:")) + String(Settings.wifiPassphrase));
      Serial.println(String(F("serverHost:")) + String(Settings.serverHost));
      Serial.println(String(F("serverPort:")) + String(Settings.serverPort));
      Serial.println(String(F("tcpConnectDelay:")) + String(Settings.tcpConnectDelay));
      Serial.println(String(F("machineId:")) + String(Settings.machineId));

      Serial.println(String(F("motorBaseSpeed:")) + String(Settings.motorBaseSpeed));
      Serial.println(String(F("motorLROffset:")) + String(Settings.motorLROffset));
      Serial.println(String(F("motorPIDMultiplierRatio:")) + String(Settings.motorPIDMultiplierRatio));
      Serial.println(String(F("motorVoltageCompensation:")) + String(Settings.motorVoltageCompensation));
      Serial.println(String(F("motorDiffRange:")) + String(Settings.motorDiffRange));
      Serial.println(String(F("PID_Kp:")) + String(Settings.PID_Kp));
      Serial.println(String(F("PID_Ki:")) + String(Settings.PID_Ki));
      Serial.println(String(F("PID_Kd:")) + String(Settings.PID_Kd));

      Serial.println(String(F("version:")) + String(Settings.version));
    }else if(command.startsWith(F("wifiSSID:"))){
      String value = command.substring(9);
      strcpy(Settings.wifiSSID, value.c_str());
      Serial.println(F("ack"));
    }else if(command.startsWith(F("wifiPassphrase:"))){
      String value = command.substring(15);
      strcpy(Settings.wifiPassphrase, value.c_str());
      Serial.println(F("ack"));
    }else if(command.startsWith(F("serverHost:"))){
      String value = command.substring(11);
      strcpy(Settings.serverHost, value.c_str());
      Serial.println(F("ack"));
    }else if(command.startsWith(F("machineId:"))){
      String value = command.substring(10);
      strcpy(Settings.machineId, value.c_str());
      Serial.println(F("ack"));
    }else if(command.startsWith(F("serverPort:"))){
      Settings.serverPort = command.substring(11).toInt();
      Serial.println(F("ack"));
    }else if(command.startsWith(F("tcpConnectDelay:"))){
      Settings.tcpConnectDelay = command.substring(16).toInt();
      Serial.println(F("ack"));
    }else{
      Serial.println(String(F("Unknown command "))+command);
    }
  }

  bool onWifiCommand(String command){
    if(command == F("saveSettings")){
      saveSettings();
      return true;
    }else if(command.startsWith(F("motorBaseSpeed:"))){
      Settings.motorBaseSpeed = command.substring(15).toInt();
      return true;
    }else if(command.startsWith(F("motorLROffset:"))){
      Settings.motorLROffset = command.substring(14).toInt();
      return true;
    }else if(command.startsWith(F("motorPIDMultiplierRatio:"))){
      Settings.motorPIDMultiplierRatio = command.substring(24).toFloat();
      return true;
    }else if(command.startsWith(F("motorVoltageCompensation:"))){
      Settings.motorVoltageCompensation = command.substring(25).toInt();
      return true;
    }else if(command.startsWith(F("motorDiffRange:"))){
      Settings.motorDiffRange = command.substring(15).toInt();
      return true;
    }else if(command.startsWith(F("PID_Kp:"))){
      Settings.PID_Kp = command.substring(7).toFloat();
      return true;
    }else if(command.startsWith(F("PID_Ki:"))){
      Settings.PID_Ki = command.substring(7).toFloat();
      return true;
    }else if(command.startsWith(F("PID_Kd:"))){
      Settings.PID_Kd = command.substring(7).toFloat();
      return true;
    }
    return false;
  }
}

#endif
