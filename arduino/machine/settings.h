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
  extern char SERVER_IP[];
  extern int SERVER_PORT;
  extern const int BUFFER_SIZE;
  extern long TCP_CONNECT_DELAY; // Delay between tcp connection attempt.

  extern int LED;
  extern int LED2;
  extern int BUTTON;
  extern String MACHINE_ID;
#endif
