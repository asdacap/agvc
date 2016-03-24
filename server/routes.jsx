
FlowRouter.route('/', {
  name: 'dashboard',
  action: function(params, queryParams) {
    ReactLayout.render(Dashboard, params);
  }
});

FlowRouter.route('/machine/:machineId', {
  name: 'machine',
  action: function(params, queryParams) {
    ReactLayout.render(MachinePage, params);
  }
});

FlowRouter.route('/message_logs', {
  name: 'message_logs',
  action: function(params, queryParams) {
    ReactLayout.render(MessageLogPage);
  }
});

FlowRouter.triggers.enter([setDocumentHead]);

function setDocumentHead(){
  DocHead.setTitle("Machine Monitor");
  DocHead.addMeta({ name: "viewport", content: "width=device-width, initial-scale=1" });
  DocHead.addLink({ rel: "stylesheet", type: "text/css", href: "'https://fonts.googleapis.com/css?family=Roboto:400,300,500'" });
}
