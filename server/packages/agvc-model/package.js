
Package.describe({
  name: 'asdacap:agvc-model',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Model for the avgc',
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
  api.use('mongo');
  api.use('zimme:collection-timestampable');
  api.use('aldeed:collection2');

  api.addFiles('reading.js');
  api.addFiles('machine.js');
  api.addFiles('message_log_model.js');
  api.export('MessageLogs');
  api.export('Machines');
  api.export('Readings');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('asdacap:agvc-model');
  api.addFiles('agvc-model-tests.js');
});
