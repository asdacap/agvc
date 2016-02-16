if (Meteor.isClient) {
  Meteor.startup(function () {
    React.render(<App />, document.getElementById("render-target"))
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log("Doing something");
  });
}
