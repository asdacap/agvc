#include "settings.h"
#include "wifi_hq/WiFlyHQ.h"

#ifndef CONNECTION_MANAGER
#define CONNECTION_MANAGER
// For namespace
template <class SerialType>
class ConnectionManager{

  public:

    char serverHost[50];
    long lastTCPConnectAttempt = -1;
    bool ledON = true;
    bool wasConnected = false;
    bool handshaking = false;
    bool webSocketAvailable = false;
    SerialType *serial;
    WiFly wifly;
    int loopcount = 0;

    void setup(SerialType *serial);
    void loopTCPConnectivityCheck();
    void onTCPConnected();
    void listenReceive();
    void registerMachine();
    void loop();
    void slowLoop();
    void sendData(String data){
      if(connected()){
        Serial.print(F("Sending data "));
        Serial.println(data);
        wifly.println(data);
      }else{
        Serial.print(F("Cannot send due to no connection "));
        Serial.println(data);
      }
    }

    // Things to actually implement
    virtual bool connected(){ return wifly.isConnected(); }
    virtual bool stop(){ return wifly.close(); }

    // Delegates to stream
    virtual size_t write(uint8_t d) { return serial->write(d); }
    virtual int available() { return serial->available(); }
    virtual int read() { return serial->read(); }
    virtual int peek() { return serial->peek(); }
    virtual void flush() { serial->flush(); }

};

#include "ConnectionManagerImpl.h"
#endif
