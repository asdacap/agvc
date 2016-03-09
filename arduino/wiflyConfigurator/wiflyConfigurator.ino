#include "altsoftserial/AltSoftSerial.h"

String WIFI_SSID = "localhost.localdomain";
String WIFI_PASSPHRASE = "hgMTc01e";
//String WIFI_SSID = "amirul-Z97-HD3";
//String WIFI_PASSPHRASE = "8hAOrVND";
//String WIFI_SSID = "asdacap";
//String WIFI_PASSPHRASE = "mypassqwer";

String SERVER_IP = "10.42.0.2";
String SERVER_PORT = "3000";

String TCP_CONNECT_DELAY = "1"; // Delay between tcp connection attempt.

int LED = 4;
int LED2 = 6;
int BUTTON = 3;

AltSoftSerial wifiSerial;

void setup(){
  pinMode(LED, OUTPUT);
  pinMode(LED2, OUTPUT);
  digitalWrite(LED, HIGH);
  digitalWrite(LED2, LOW);

  Serial.begin(9600);
  wifiSerial.begin(9600);
  Serial.println("Starting");
  Serial.flush();
  wifiSerial.print("$$$");
  wifiSerial.setTimeout(1000);
  Serial.println(wifiSerial.readString());

  sendAndPrintResult("set comm remote 0");
  sendAndPrintResult("set ip dhcp 1");
  sendAndPrintResult("set wlan ssid " + WIFI_SSID);
  sendAndPrintResult("set wlan phrase " + WIFI_PASSPHRASE);
  sendAndPrintResult("set wlan auth 4");
  sendAndPrintResult("set wlan join 1");
  sendAndPrintResult("set sys autoconn "+TCP_CONNECT_DELAY);
  sendAndPrintResult("set ip host " + SERVER_IP);
  sendAndPrintResult("set ip remote " + SERVER_PORT);
  sendAndPrintResult("save");
  sendAndPrintResult("exit");

  Serial.println("Done");
}

void sendAndPrintResult(String command){
  Serial.println("command: "+command);
  wifiSerial.println(command);
  Serial.println(wifiSerial.readString());
}

void loop(){
  digitalWrite(LED, (millis()/500)%2 ? HIGH : LOW);
}
