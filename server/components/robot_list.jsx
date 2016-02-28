

RobotList = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    Meteor.subscribe("robots");
    return {
      robots: Robots.find({}),
      openForm: this.state.openForm.get()
    }
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  render(){
    return <div className="robot-lists">
      <h2>Robot Lists</h2>
      { this.data.openForm ? <RobotForm toggleForm={this.toggleForm} /> : <a className="btn" onClick={this.toggleForm}>New Form</a> }
      <ul className="collection">
        { this.data.robots.map(function(item){ return <RobotListItem robot={item} />; }) }
      </ul>
    </div>;
  }
});

RobotListItem = React.createClass({
  render(){
    return <li>
      <span className="robotId">Robot id: {this.props.robot.robotId}</span>
      <span>Command Queue: </span>
      <ul>
        { this.props.robot.commandQueue.map(function(command){
          return <li>{command.command}</li>;
        }) }
      </ul>
    </li>;
  }
});

RobotForm = React.createClass({
  addRobot(e){
    e.preventDefault();

    var robotId = React.findDOMNode(this.refs.robotIdInput).value.trim();
    Meteor.call("addRobot",{
      robotId: robotId
    });
    this.props.toggleForm();
  },
  render(){
    return <div>
      <h3>Robot FOrm</h3>
      <form onSubmit={this.addRobot}>
        <input type="text" ref="robotIdInput" placeholder="Type new robot id" />
        <button className="btn">Save</button>
        <a className="btn" onClick={this.props.toggleForm}>Close</a>
      </form>
    </div>;
  }
});
