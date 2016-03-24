Package.describe({
  name: 'asdacap:agvc-reading',
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
  api.use('mongo');
  api.use('underscore');
  api.use('zimme:collection-timestampable');
  api.use('aldeed:collection2');
  api.use('ecmascript');
  api.use('asdacap:agvc-model');
  api.use('asdacap:agvc-machine-interface');

  api.addFiles('agvc-reading.js');
  api.addFiles('reading.js');
  api.export('Readings');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('asdacap:agvc-reading');
  api.addFiles('agvc-reading-tests.js');
});
