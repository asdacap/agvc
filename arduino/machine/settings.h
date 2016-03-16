#include "WString.h"

#ifndef SETTING_DEFINED
#define SETTING_DEFINED
  extern int WIFI_SERIAL_RX;
  extern int WIFI_SERIAL_TX;
  //String WIFI_SSID = "localhost.localdomain";
  //String WIFI_PASSPHRASE = "hgMTc01e";
  extern String WIFI_SSID;
  extern String WIFI_PASSPHRASE;
  //String WIFI_SSID = "asdacap";
  //String WIFI_PASSPHRASE = "mypassqwer";
  extern String SERVER_IP;
  extern String SERVER_PORT;
  extern const int BUFFER_SIZE;
  extern String TCP_CONNECT_DELAY; // Delay between tcp connection attempt.

  extern int LED;
  extern int LED2;
  extern int LED3;
  extern int LED4;
  extern int BUTTON;
  extern int CONNECT_INPUT;
  extern String MACHINE_ID;
#endif
