import Map from './Map';
import React from 'react';
import DrawRateLimiter from '../components/DrawRateLimiter';

// Draw the map
var MapView = function(){

  let extra = "";
  if(Map.extraSVG !== undefined){
    extra = Map.extraSVG;
  }

  return <g>
    <g>{ Map.paths.map((p,idx) => <path d={p.svgPathD} stroke="black" strokeWidth="5" fill="none" key={idx} />) }</g>
    <g dangerouslySetInnerHTML={{ __html: extra }} ></g>
  </g>;
};

MapView = DrawRateLimiter(MapView, 1000);

export default MapView;
