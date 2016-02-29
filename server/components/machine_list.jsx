

MachineList = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState(){
    var openForm = new ReactiveVar(false);
    return { openForm };
  },
  getMeteorData(){
    var handle = Meteor.subscribe("machines");
    return {
      machines: Machines.find({}).fetch(),
      openForm: this.state.openForm.get()
    }
  },
  toggleForm(){
    this.state.openForm.set(!this.data.openForm);
  },
  render(){
    return <div className="machine-lists">
      <hr />
      <h2>Machine Lists</h2>
      <ul className="row">
        { this.data.machines.map(function(item){ return <MachineListItem machine={item} key={item._id}/>; }) }
      </ul>
      { this.data.openForm ? <MachineForm toggleForm={this.toggleForm} /> : <a className="btn" onClick={this.toggleForm}><i className="fa fa-plus" /></a> }
    </div>;
  }
});

MachineListItem = React.createClass({
  ping(){
    Meteor.call("sendCommand", this.props.machine.machineId, "ping");
  },
  render(){
    return <li className="col s4 m3 l2">
      <div className="card">
        <div className="card-content">
          <span className="card-title machineId">{this.props.machine.machineId}</span>
          {
            this.props.machine.online ? <span className="label success">Online</span> : <span className="label success">Offline</span>
          }
          <p>
            <p>Command Queue: </p>
            <ul className="collection">
              { this.props.machine.commandQueue.map(function(command){
                return <li className="collection-item">{command.command}</li>;
              }) }
            </ul>
          </p>
          <a className="btn" onClick={this.ping}>Ping</a>
        </div>
      </div>
    </li>;
  }
});

MachineForm = React.createClass({
  componentDidMount(){
    $(React.findDOMNode(this.refs.modal)).openModal();
  },
  addMachine(e){
    e.preventDefault();

    var machineId = React.findDOMNode(this.refs.machineIdInput).value.trim();
    Meteor.call("addMachine",{
      machineId: machineId
    });

    this.close();
  },
  close(){
    $(React.findDOMNode(this.refs.modal)).closeModal({
      complete: this.props.toggleForm
    });
  },
  render(){
    return <div className="modal" ref="modal">
      <div className="modal-content">
        <h3>Machine FOrm</h3>
        <form onSubmit={this.addMachine}>
          <input type="text" ref="machineIdInput" placeholder="Type new machine id" />
          <button className="btn">Save</button>
          <a className="btn" onClick={this.close}>Close</a>
        </form>
      </div>
    </div>;
  }
});
