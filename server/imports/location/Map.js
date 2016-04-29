import Resources from '../Resources';
import Point from 'point-at-length';

// This map represent how to transfer the location representation to visual cuues
// on the screen. Point is represented by a coordinate. Path is represented by
// SVG path description
let Map = {
  points: [{
    id: "point_1",
    visualX: 0,
    visualY: 0
  },{
    id: "point_2",
    visualX: 0,
    visualY: 200
  }],
  paths: [{
    id: "rightCircle",
    svgPathD: "m 615.7446,139.02153 c 0,0 31.72974,6.27952 59.13271,-4.70965 27.40293,-10.98921 87.97793,-50.23632 148.55293,-34.53751 60.575,15.69885 153.1048,57.33665 181.72486,161.69822 28.8453,105.18233 49.0615,242.45044 -49.03676,375.20263 -72.4349,98.02285 -196.6878,143.25787 -285.2886,161.71611",
    machineSpeed: 300
  },{
    id: "leftCircle",
    svgPathD: "m 662.05299,800.10253 c -41.94595,8.73862 -49.94037,8.33593 -66.62324,7.83149 C 543.50836,806.3641 363.22565,759.26761 306.97746,666.64436 249.52762,572.04239 178.61618,384.06496 197.36558,282.02244 216.11498,179.97987 237.7489,142.3026 311.30424,109.33505 c 84.5356,-37.88894 102.40056,-32.96763 186.05173,-6.2796 83.65116,26.68806 87.97797,39.24719 121.14998,37.67731",
    machineSpeed: 300
  }]
};

if(Settings.use_bigger_map){
  Map = {
    paths: [
      {
        id: "horizontalRight",
        svgPathD: "m 1079.1359,629.01643 0,-14.91512 c 0,-55.4 -44.6,-100 -100.00004,-100 -110.68789,0.42315 -260.43265,0.97677 -425.56594,1.3513",
        machineSpeed: 500
      },
      {
        id: "horizontalLeft",
        svgPathD: "m 552.55977,514.44246 c -104.70221,0.23747 -215.59085,0.40294 -326.63295,0.41751 -58.2974,1.30245 -101.58669,-31.51767 -100.87241,-94.98034 l -0.62458,-82.53075",
        machineSpeed: 500
      },
      {
        id: "verticalRight",
        svgPathD: "m 552.56361,148.64046 133.75748,0 c 33.24,0 60,26.76001 60,60.00001 0,0 0.80159,52.84707 1.42857,122.96359 0.62698,70.11651 97.17146,73.51203 98.59636,150.7178 1.42489,77.20577 1.65162,163.92782 1.65162,163.92782 0.33272,55.399 44.6,100 100,100 l 32.14841,0 c 55.39995,0 99.99995,-44.6 99.99995,-100 l 0,-17.23324",
        machineSpeed: 500
      },
      {
        id: "verticalLeft",
        svgPathD: "m 125.43998,338.35904 -0.73223,-96.75498 c 0,-31.83348 26.76552,-57.63961 59.78246,-57.63961 33.01694,0 59.78246,25.80613 59.78246,57.63961 l 1.17121,107.08915 c -1.08076,32.60944 23.51966,60.02807 54.94658,61.24123 31.42692,1.21317 57.7796,-24.23855 58.86036,-56.84799 l 0.1329,-58.62525 0,-85.82073 c 0,-33.24 26.76,-60.00001 60,-60.00001 l 132.16973,0",
        machineSpeed: 500
      }
    ]
  };

  Map.extraSVG = Resources.map_extra;

};

Map.getPath = function(pathId){
  return _.find(Map.paths, p => p.id == pathId);
}

Map.getPoint = function(pointId){
  return _.find(Map.points, p => p.id == pointId);
}

Map.paths.forEach(path => {
  if(Meteor.isClient){
    var pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("d", path.svgPathD);
    path.length = pathEl.getTotalLength();
  }else{
    var pts = Point(path.svgPathD);
    path.length = pts.length;
  }
});

export default Map
