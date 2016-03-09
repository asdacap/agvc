
/* User to switch the Client class the origincal WebSocketClient accept.
 * Inherited by ConnectionManager, which pass itself to WebSocketClient
 */
class SocketInterface : public Stream{
public:
  virtual bool connected();
  virtual bool stop();
};
