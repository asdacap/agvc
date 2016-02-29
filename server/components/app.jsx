var AppCanvas = MUI.AppCanvas;

App = React.createClass({
  render() {
    return <AppCanvas>
        <MachineList />
        <MessageList />
      </AppCanvas>;
  }
});
