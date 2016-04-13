
#ifndef DEBOUNCE
#define DEBOUNCE

template<class T>
class Debounce{
public:
  T oldValue;
  long lastTime;
  long debounceTime;
  void (*callee)(T);
  Debounce(void (*callee)(T), long debounceTime){
    this->callee = callee;
    this->debounceTime = debounceTime;
    lastTime = 0;
  }

  void call(T val){
    long current = millis();
    if(val == oldValue){
      if((current-lastTime) > debounceTime){
        lastTime = current;
        callee(val);
      }
    }else{
      lastTime = current;
      oldValue = val;
      callee(val);
    }
  }
};

#endif
