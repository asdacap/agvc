
// This map represent how to transfer the location representation to visual cuues
// on the screen. Point is represented by a coordinate. Path is represented by
// SVG path description
export default Map = {
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
    svgPathD: "m 512.88746,264.73582 c 0,0 31.72974,6.27952 59.13271,-4.70965 27.40293,-10.98921 87.97793,-50.23632 148.55293,-34.53751 60.575,15.69885 153.1048,57.33665 181.72487,161.69822 28.8453,105.18233 49.0615,242.45044 -49.03677,375.20263 -72.4349,98.02285 -196.6878,143.25787 -285.2886,161.71611",
    machineSpeed: 300
  },{
    id: "leftCircle",
    svgPathD: "m 546.3387,927.24539 c -41.94595,8.73862 -49.94037,8.33593 -66.62324,7.83149 C 427.79407,933.50696 247.51136,886.41047 191.26317,793.78722 133.81333,699.18525 62.901891,511.20782 81.651291,409.1653 100.40069,307.12273 122.03461,269.44546 195.58995,236.47791 c 84.5356,-37.88894 102.40056,-32.96763 186.05173,-6.2796 83.65116,26.68806 87.97797,39.24719 121.14998,37.67731",
    machineSpeed: 300
  }]
};

Map.getPath = function(pathId){
  return _.find(Map.paths, p => p.id == pathId);
}

Map.getPoint = function(pointId){
  return _.find(Map.points, p => p.id == pointId);
}
