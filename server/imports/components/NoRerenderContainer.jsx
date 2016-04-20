import React from 'react';

export default NoRerenderContainer = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    alwaysNo: React.PropTypes.bool
  },
  shouldComponentUpdate(nextProps, nextState){
    if(this.props.alwaysNo) return false;
    let allSame = true;
    _.keys(nextProps).forEach(key => {
      if(key == "children") return;
      if(this.props[key] != nextProps[key]) allSame = false;
    });
    return !allSame;
  },
  render(){
    let filteredProps = _.extend({}, this.props);
    filteredProps.children = null;
    return React.cloneElement(this.props.children, filteredProps);
  }
});
