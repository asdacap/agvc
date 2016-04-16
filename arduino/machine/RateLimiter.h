
#ifndef RATE_LIMITER
#define RATE_LIMITER

// A class that helps with limiting the rate of doing something
// call isItOK to determine of it is ok according to the rate limit to do something
class RateLimiter{
public:
  long prevCount;
  long interval;
  RateLimiter(long interval): interval(interval){
    prevCount = millis()/interval;
  }
  bool isItOK(){
    long newCount = millis()/interval;
    if(newCount == prevCount) return false;
    prevCount = newCount;
    return true;
  }
};

#endif
