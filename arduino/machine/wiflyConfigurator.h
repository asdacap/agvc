#include "settings.h"

template<class T>
void sendAndPrintResult(String command,T &wifiSerial){
  Serial.println("command: "+command);
  wifiSerial.println(command);
  Serial.println(wifiSerial.readString());
}

template<class T>
void configureWifly(T &wifiSerial){
  digitalWrite(LED, HIGH);
  digitalWrite(LED2, LOW);

  Serial.begin(9600);
  wifiSerial.begin(9600);
  Serial.println("Starting");
  Serial.flush();
  wifiSerial.print("$$$");
  wifiSerial.setTimeout(300);
  Serial.println(wifiSerial.readString());

  sendAndPrintResult("set sys iofunc 0x00 ", wifiSerial);
  //sendAndPrintResult("set sys iofunc 0x50 ", wifiSerial);
  sendAndPrintResult("set comm remote 0", wifiSerial);
  sendAndPrintResult("set sys sleep 0", wifiSerial);
  sendAndPrintResult("set comm idle 0", wifiSerial);
  sendAndPrintResult("set ip dhcp 1", wifiSerial);
  sendAndPrintResult("set wlan ssid " + WIFI_SSID, wifiSerial);
  sendAndPrintResult("set wlan phrase " + WIFI_PASSPHRASE, wifiSerial);
  sendAndPrintResult("set wlan auth 4", wifiSerial);
  sendAndPrintResult("set wlan join 1", wifiSerial);
  sendAndPrintResult("set ip host " + SERVER_IP, wifiSerial);
  sendAndPrintResult("set ip remote " + SERVER_PORT, wifiSerial);
  sendAndPrintResult("set sys autoconn "+TCP_CONNECT_DELAY, wifiSerial);
  sendAndPrintResult("save", wifiSerial);
  sendAndPrintResult("exit", wifiSerial);

  Serial.println("Done");
}
