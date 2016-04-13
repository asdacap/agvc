
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
    svgPathD: "m 507.17317,189.02153 c 0,0 31.72974,6.27952 59.13271,-4.70965 27.40293,-10.98921 87.97793,-50.23632 148.55293,-34.53751 60.575,15.69885 153.1048,57.33665 181.72487,161.69822 28.8453,105.18233 49.0615,242.45044 -49.03677,375.20263 -72.4349,98.02285 -196.6878,143.25787 -285.2886,161.71611",
    machineSpeed: 300
  },{
    id: "leftCircle",
    svgPathD: "m 553.48156,850.10253 c -41.94595,8.73862 -49.94037,8.33593 -66.62324,7.83149 C 434.93693,856.3641 254.65422,809.26761 198.40603,716.64436 140.95619,622.04239 70.044748,434.06496 88.794148,332.02244 107.54355,229.97987 129.17747,192.3026 202.73281,159.33505 c 84.5356,-37.88894 102.40056,-32.96763 186.05173,-6.2796 83.65116,26.68806 87.97797,39.24719 121.14998,37.67731",
    machineSpeed: 300
  }]
};

Map.getPath = function(pathId){
  return _.find(Map.paths, p => p.id == pathId);
}

Map.getPoint = function(pointId){
  return _.find(Map.points, p => p.id == pointId);
}
