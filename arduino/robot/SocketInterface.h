
class SocketInterface : public Stream{
public:
  virtual bool connected();
  virtual bool stop();
};
