
#ifndef GLOBAL_LISTENER
#define GLOBAL_LISTENER

// Other module call this module for any change of state
// This module should be implemented at the end of machine.ino
// to delegate to other module
namespace GlobalListener{
  void onConnect();
}

#endif
