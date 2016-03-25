
//#include <SoftwareSerial.h>
#include "wifi_hq/WiFlyHQ.h"
#include "ConnectionManager.h"
#include "wiflyConfigurator.h"
#include "lineFollowing.h"

//SoftwareSerial wifiSerial(8,9);
HardwareSerial &wifiSerial = Serial1;
//ConnectionManager<SoftwareSerial> cManager;
ConnectionManager<HardwareSerial> cManager;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Setting up..."));
  // Just in case
  for(int i=0; i<14; i++){
    pinMode(i, INPUT);
  }
  pinMode(LED, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(CONNECT_INPUT, INPUT);
  digitalWrite(CONNECT_INPUT, LOW);

  configureWifly(wifiSerial);

  cManager.setup(&wifiSerial);
  Serial.println(F("Setup done"));

  rfidSetup();
  lineSetup();
}

int prevButton = HIGH;

void checkButton(){
  int buttonVal = digitalRead(BUTTON);
  if(buttonVal != prevButton && buttonVal == LOW){
    cManager.sendData("button");
  }
  prevButton = buttonVal;
}

int mCount = 0;
void loop() {
  int nmCount = millis()/1000;
  if(nmCount != mCount){
    Serial.println(F("Looping"));
    mCount = nmCount;
  }

  checkButton();
  cManager.loop();

  digitalWrite(LED, (millis()/50)%2 ? HIGH : LOW);
  digitalWrite(LED2, digitalRead(CONNECT_INPUT));

  rfidLoop();
  lineLoop();
}


#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         40          // Configurable, see typical pin layout above
#define SS_PIN          53         // Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

void rfidSetup() {
  Serial.begin(9600);		// Initialize serial communications with the PC
  while (!Serial);		// Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
  SPI.begin();			// Init SPI bus
  mfrc522.PCD_Init();		// Init MFRC522
  mfrc522.PCD_DumpVersionToSerial();	// Show details of PCD - MFRC522 Card Reader details
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));
}

void rfidLoop() {
  // Look for new cards
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  Serial.println("RFID detected");
  String rfid = String(byteHexToString(mfrc522.uid.uidByte, mfrc522.uid.size));
  String it = "rfid:"+rfid;
  Serial.println(it);
  cManager.sendData(it);
}

/**
 * Helper routine to dump a byte array as hex values to a String.
 */
String byteHexToString(byte *buffer, byte bufferSize) {
  String str="";
  for (byte i = 0; i < bufferSize; i++) {
    str.concat(String(buffer[i] < 0x10 ? " 0" : " "));
    str.concat(String(buffer[i], HEX));
  }
  return str;
}
