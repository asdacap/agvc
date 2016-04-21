import React from 'react';

export default DrawRateLimiter = (Wrapped, rate) => React.createClass({
  shouldComponentUpdate(nextProps, nextState){
    if(this.previousTime === undefined){
      this.previousTime = new Date();
    }
    let currentTime = new Date();
    if(currentTime.getTime() - this.previousTime.getTime() > rate){
      return true;
    }
    return false;
  },
  render(){
    this.previousTime = new Date();
    return <Wrapped {...this.props} />;
  }
});
