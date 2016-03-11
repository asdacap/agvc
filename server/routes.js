
FlowRouter.route('/', {
  name: 'dashboard',
  action: function(params, queryParams) {
    ReactLayout.render(Dashboard);
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
