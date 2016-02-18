/*


   An example sketch to show how to configure a WiFly RN XV with a Teensy 3.1.

   For this example, the Teensy board was mounted on a breadboard, powered over USB.

   Teensy GND and Vin are wired to + and - on the breadboard.

   Teensy pins 7 and 8 (RX3 and TX3) are connected to the WiFly's pins 2 and 3 (TXD and RXD).

   The WiFly has  breadboard + running  to pin 1 (VDD 3V3) and - to pin 10 (GND).

   This set up was taken from "Setting up the WiFly RN-XV with a Teensy 3.0 "
http://jamesgregson.blogspot.com/2013/03/setting-up-wifly-rn-xv-with-teensy-30.html

A big thanks to James Gregson for his write-up.

One difference here is that this sketch does not use any LCD.  All feed back comes
from the Arduino serial monitor.

The bigger difference is that the WiFly configuration is done via Arduino code
instead of being hand-typed into the serial monitor.

Note that this sketch is NOT using the WiFly in AP mode. Do not wire up WiFly pin 8.

Also note that this sketch assumes the WiFly is running version 4.00 of the WiFly
firmware.  The behavior of a few things is different than what I found described in
older examples using the WiFly.

The goal of this sketch was to see how to set up a WiFly VX RN (AKA RN171XV) to
connect to a local wireless access point and acquire an IP address using DHCP.

There are assorted WiFly demo sketches on the 'Net but they all seemed not-quite-right
for me.  In many cases the demo sketches relied on libraries that wrapped calls to
the WiFly board.  Not only did none of these work for me, but the use of a library
obscured the details of what was actually happening, and I wanted to know just what steps
were needed and how things worked.

In the long run a wrapper library would be a Good Thing, since it abstracts a lot of tedious
stuff as well as making things more robust.  For example, in this example the configuration
commands are sent and then a fixed delay is used to allow time for the command to take effect.

A far better approach (and one used by every WiFly library I saw) would be to send a command
and then watch the return data for the "OK" prompt. Even better, look for  "ERR" and handle
things nicely.

However, the code here is simple, works (for me, at least :) ), and should help illustrate
what you need to do.


A few factoids you may find useful:


 * If you boot the WiFly with pin 8 high (i.e. connected to 3V) then the device goes into soft AP mode.

 * The default IP address is 1.2.3.4 and you can telnet in at port 2000

 * If you find that nothing is behaving as expected you can do a factory reset by toggling power to
 pin 8 five times.  (This is sometimes referred to as GPIO9).  You need to first power up with GPIO9
 set high, then toggle it five times.

 * Make sure you are using the correct user guide for your WiFly model.
 For this example I used "WiFly Command Reference, Advanced Features & Applications User’s Guide"
 "RN-WIFLYCR-UG Version 1.2r 4/30/13"

 This link might work:
http://www.microchip.com/mymicrochip/filehandler.aspx?ddocname=en557989

 * If and when you get your device appearing on your network (or as an AP) the SSID will clue
 you in about the model.

WiFly-GSX-XX for RN131G/C
WiFly-EXZ-XX for RN171
where XX is the last byte of the module’s MAC address


*/

#include <SoftwareSerial.h>

/*

   "settings.h" needs to live in the same folder as this sketch and define two strings:

   String ssid       = "YourAccessPointSSID";
   String passPhrase = "YourCoolSeekretPassword";

 */

int led = 4; // The LED pin on Teensy 3.1
int commandDelay = 5000; // Hacky, yes.

int WIFI_SERIAL_RX = 10;
int WIFI_SERIAL_TX = 11;
SoftwareSerial wifiSerial(WIFI_SERIAL_RX, WIFI_SERIAL_TX);

// Used to buffer Serial stuff
String content = "";
char character;

String content3 = "";
char character3;


// The commands to send to get the WiFly set up.
// The goal was to have a relatively simple
// way to write a list commands that you
// could add to or remove from and not
// have to keep changing some variable tracking
// the number of commands.
// You may have to use a different wlan command depending on
// the security (if any) of your access point.
String cmds[] = {
  "set ip dhcp 1", // 0 means don't get IP form DHCP server. 1 means grab one va DHCP
  "set wlan ssid asdacap",
  "set wlan phrase mypassqwer",
  "set wlan auth 4",
  "set wlan join 1",
  "set sys autoconn 1",
  "join asdacap",
  "exit", // Leave command mode
  "" // Required. Indicates the last item when
};

/************************************************************************/
// Read the String array until an empty string.
// Too hacky? Is there a better way to loop over the array of command strings?
// In any event, it works well enough.
void sendCommands(String cmds[]) {
  Serial.println("Send command strings ...");
  int i = 0;
  while( cmds[i].length()  > 0  ) {
    Serial.println( cmds[i] );
    wifiSerial.println( cmds[i] );
    delay(commandDelay);
    while(wifiSerial.available()) {
      character = wifiSerial.read();
      content.concat(character);
    }
    if (content != "") { Serial.print(content); content = ""; }
    i++;
  }
  Serial.println("Command strings are done.");
}

/************************************************************************/
// Useful to show that at least something is happening in case no text output appears.
// E.g. if you wonder if you fried the board or something.
void blink() {
  delay(100);
  digitalWrite(led, HIGH);
  delay(100);
  digitalWrite(led, LOW);
  delay(100);
}


/************************************************************************/
void setup() {
  pinMode(led, OUTPUT); // THIS IS IMPORTANT, or else you never see the light
  Serial.begin(9600);   // Be sure to set USB serial in the IDE.
  wifiSerial.begin(9600);

  blink();

  // A short delay so you have time to start up the serial monitor
  // and see that the sketch is, in fact, running while not missing
  // any useful info
  delay(5000);
  Serial.println("15");
  delay(5000);
  Serial.println("10");
  delay(5000);
  Serial.println("5");
  delay(5000);
  Serial.println("Are we ready?");
  blink();
  Serial.println("Send money ..");
  wifiSerial.write("$$$"); // Go into command mode.
  delay(250); // The WiFly needs a short delay after the cmd signal
  wifiSerial.println("");
  sendCommands(cmds);
  delay(3000);
}

/************************************************************************/
void loop() {

  //  Copped from http://stackoverflow.com/questions/5697047/convert-serial-read-into-a-useable-string-using-arduino

  String content = "";
  char character;

  String content3 = "";
  char character3;

  while(wifiSerial.available()) {
    character = wifiSerial.read();
    content.concat(character);
  }

  if (content != "") {
    Serial.print(content);
  }

  while(Serial.available()) {
    character3 = Serial.read();
    content3.concat(character3);
  }

  if (content3 != "") {
    wifiSerial.println(content3);
  }

  blink();
}
