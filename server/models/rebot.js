
Robots = new Mongo.Collection("robots");
Robots.attachBehaviour("timestampable");

var RobotCommandSchema = new SimpleSchema({
  command: {
    type: String,
    optional: false
  },
  droppable: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    optional: false
  }
});

var RobotSchema = new SimpleSchema({
  robotId: {
    type: String,
    optional: false,
    index: true,
    unique: true
  },
  commandQueue: {
    type: [RobotCommandSchema]
  }
});

Robots.attachSchema(RobotSchema);

Meteor.methods({
  addRobot(props){
    _.extend(props, {
      commandQueue: []
    });

    Robots.insert(props);
  },
  sendCommand(robotId, command, droppable){
    if(droppable === undefined){
      droppable = false;
    }
    var robot = Robots.findOne({robotId: robotId});

    if(robot === undefined){
      console.log("Robot not found. robotId: "+robotId);
      return;
    }

    robot.commandQueue.push({
      command: command,
      droppable: droppable,
      createdAt: new Date()
    });

    Robots.update(robot._id, robot);
  }
});

if(Meteor.isServer){
  Meteor.publish("robots", function(){
    return Robots.find({});
  });
}
