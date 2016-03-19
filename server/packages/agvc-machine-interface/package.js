Package.describe({
  name: 'asdacap:agvc-machine-interface',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('underscore');
  api.use('webapp');
  api.use('asdacap:agvc-model');
  api.addFiles('agvc-machine-interface.js', 'server');
  api.addFiles('tcp_interface.js', 'server');
  api.addFiles('websocket_interface.js', 'server');
  api.export('startMachineTCPListener', 'server');
  api.export('startMachineWebSocketListener', 'server');
});

Npm.depends({
  "websocket-driver": "0.6.4",
  "split": "1.0.0",
  "is-running": "2.0.0"
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('asdacap:agvc-machine-interface');
  api.addFiles('agvc-machine-interface-tests.js');
});
