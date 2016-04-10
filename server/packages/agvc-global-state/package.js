Package.describe({
  name: 'asdacap:agvc-global-state',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Global state models for agvc. Global state is model shared by all clients.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use('ecmascript');
  api.use('mongo');

  api.addFiles('agvc-global-state.js');
  api.addFiles('server-time.js');

  api.export('GlobalStates');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('asdacap:agvc-global-state');
  api.addFiles('agvc-global-state-tests.js');
});
