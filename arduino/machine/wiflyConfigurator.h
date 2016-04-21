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

  sendAndPrintResult("set ip protocol 2", wifiSerial);
  sendAndPrintResult("set comm remote 0", wifiSerial);
  sendAndPrintResult("set sys sleep 0", wifiSerial);
  sendAndPrintResult("set comm idle 0", wifiSerial);
  sendAndPrintResult("set ip dhcp 1", wifiSerial);
  sendAndPrintResult("set wlan ssid " + String(Settings.wifiSSID), wifiSerial);
  sendAndPrintResult("set wlan phrase " + String(Settings.wifiPassphrase), wifiSerial);
  sendAndPrintResult("set wlan auth 4", wifiSerial);
  sendAndPrintResult("set wlan join 1", wifiSerial);
  sendAndPrintResult("set ip host " + String(Settings.serverHost), wifiSerial);
  sendAndPrintResult("set ip remote " + String(Settings.serverPort), wifiSerial);
  sendAndPrintResult("set sys autoconn "+ String(Settings.tcpConnectDelay), wifiSerial);
  sendAndPrintResult("set ip flags 0x6", wifiSerial);
  sendAndPrintResult("set sys iofunc 0x0", wifiSerial);
  sendAndPrintResult("set comm open 0", wifiSerial);
  sendAndPrintResult("set comm close 0", wifiSerial);
  sendAndPrintResult("set comm match 10", wifiSerial);
  sendAndPrintResult("save", wifiSerial);
  sendAndPrintResult("exit", wifiSerial);

  Serial.println("Done");
}
