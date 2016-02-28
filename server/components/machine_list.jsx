

MachineList = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    Meteor.subscribe("machines");
    return {
      machines: Machines.find({}),
      openForm: this.state.openForm.get()
    }
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  render(){
    return <div className="machine-lists">
      <h2>Machine Lists</h2>
      { this.data.openForm ? <MachineForm toggleForm={this.toggleForm} /> : <a className="btn" onClick={this.toggleForm}>New Form</a> }
      <ul className="collection">
        { this.data.machines.map(function(item){ return <MachineListItem machine={item} />; }) }
      </ul>
    </div>;
  }
});

MachineListItem = React.createClass({
  render(){
    return <li>
      <span className="machineId">Machine id: {this.props.machine.machineId}</span>
      <span>Command Queue: </span>
      <ul>
        { this.props.machine.commandQueue.map(function(command){
          return <li>{command.command}</li>;
        }) }
      </ul>
    </li>;
  }
});

MachineForm = React.createClass({
  addMachine(e){
    e.preventDefault();

    var machineId = React.findDOMNode(this.refs.machineIdInput).value.trim();
    Meteor.call("addMachine",{
      machineId: machineId
    });
    this.props.toggleForm();
  },
  render(){
    return <div>
      <h3>Machine FOrm</h3>
      <form onSubmit={this.addMachine}>
        <input type="text" ref="machineIdInput" placeholder="Type new machine id" />
        <button className="btn">Save</button>
        <a className="btn" onClick={this.props.toggleForm}>Close</a>
      </form>
    </div>;
  }
});
