import React from 'react';

export default NoRerenderContainer = (Wrapped, alwaysNo, skipProps, log) => {
  if(skipProps === undefined){
    skipProps = [];
  }
  return React.createClass({
    shouldComponentUpdate(nextProps, nextState){
      if(alwaysNo) return false;
      let allSame = true;
      _.keys(nextProps).forEach(key => {
        if(key == "children") return;
        if(skipProps.indexOf(key) != -1) return;
        if(this.props[key] != nextProps[key]) {
          console.log("different "+key);
          allSame = false;
        }
      });
      if(log){
        console.log("Returning "+!allSame);
      }
      return !allSame;
    },
    render(){
      if(log){
        console.log("Rendering");
      }
      return <Wrapped {...this.props} />;
    }
  })
};
