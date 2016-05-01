#include <SPI.h>
#include <MFRC522.h>
#include "ConnectionManager.h"
#include "debounce.h"

#define RST_PIN         40          // Configurable, see typical pin layout above
#define SS_PIN          53         // Configurable, see typical pin layout above

namespace RFID{

  MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
  Debounce<String> dbc(ConnectionManager::sendData, 1000);

  void setup() {
    Serial.begin(9600);		// Initialize serial communications with the PC
    while (!Serial);		// Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
    SPI.begin();			// Init SPI bus
    mfrc522.PCD_Init();		// Init MFRC522

    // Reduce timeout
    //mfrc522.PCD_WriteRegister(mfrc522.TReloadRegH, 0x01);
    //mfrc522.PCD_WriteRegister(mfrc522.TReloadRegL, 0xF4);
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

  void loop() {
    // Look for new cards
    if ( ! mfrc522.PICC_IsNewCardPresent()) {
      return;
    }

    // Select one of the cards
    if ( ! mfrc522.PICC_ReadCardSerial()) {
      return;
    }

    String rfid = String(byteHexToString(mfrc522.uid.uidByte, mfrc522.uid.size));
    String it = "rfid:"+rfid;

    // Print and send the data to server
    dbc.call(it);
  }

}
