import React from 'react';
import ReactDOM from 'react-dom';

export default VibrateOnTouch = (Wrapper, alsoOnTouchEnd) => React.createClass({
  vibrate(){
    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if("vibrate" in navigator){
      navigator.vibrate(50);
    }
    return false;
  },
  componentDidMount(){
    ReactDOM.findDOMNode(this.refs.child).addEventListener("touchstart", this.vibrate);
    if(alsoOnTouchEnd){
      ReactDOM.findDOMNode(this.refs.child).addEventListener("touchend", this.vibrate);
    }
  },
  componentWillUnmount(){
    ReactDOM.findDOMNode(this.refs.child).removeEventListener("touchstart", this.vibrate);
    if(alsoOnTouchEnd){
      ReactDOM.findDOMNode(this.refs.child).removeEventListener("touchend", this.vibrate);
    }
  },
  render(){
    return <Wrapper {...this.props} ref="child"/>
  }
});
