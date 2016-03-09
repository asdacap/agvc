#include "WebSocketClient.h"
#include "settings.h"
#include "wifi_hq/WiFlyHQ.h"
#include "altsoftserial/AltSoftSerial.h"

// For namespace
template <class SerialType>
class ConnectionManager : public SocketInterface {

  public:

    char serverHost[50];
    long lastTCPConnectAttempt = -1;
    bool ledON = true;
    bool wasConnected = false;
    bool handshaking = false;
    SerialType *serial;
    WiFly wifly;
    WebSocketClient webSocketClient;
    int loopcount = 0;

    void setup(SerialType *serial);
    void loopTCPConnectivityCheck();
    void onWebSocketConnected();
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

#include "ConnectionManagerImpl.h"
