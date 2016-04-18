
#ifndef DEBOUNCE
#define DEBOUNCE

template<class T>
class Debounce{
public:
  T oldValue;
  int oldIntValue;
  long lastTime;
  long debounceTime;
  void (*callee)(T);
  Debounce(void (*callee)(T), long debounceTime){
    this->callee = callee;
    this->debounceTime = debounceTime;
    lastTime = 0;
    oldIntValue = 0;
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

  // Compare int value instead of the value
  // This should reduce cpu cycle usage
  void call(T val, int intVal){
    long current = millis();
    if(intVal == oldIntValue){
      if((current-lastTime) > debounceTime){
        lastTime = current;
        callee(val);
      }
    }else{
      lastTime = current;
      oldIntValue = intVal;
      callee(val);
    }
  }
};

#endif
