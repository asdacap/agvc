#include "WebSocketClient.h"
#include "settings.h"
#include "wifi_hq/WiFlyHQ.h"
#include "altsoftserial/AltSoftSerial.h"

typedef AltSoftSerial SerialType;

// For namespace
class ConnectionManager : public SocketInterface {

  public:

    char serverHost[30];
    long lastTCPConnectAttempt = -1;
    bool ledON = true;
    SerialType *serial;
    WiFly wifly;
    WebSocketClient webSocketClient;
    int loopcount = 0;

    void setup(SerialType *serial);
    void wifiSetup();
    void tcpSetup();
    void loopTCPConnectivityCheck();
    void onTCPConnected();
    void listenReceive();
    void loop();
    void sendData(String data){ webSocketClient.sendData(data); }

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
