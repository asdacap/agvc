Package.describe({
  name: 'asdacap:agvc-location',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Package containing Location model and other location representation, like a map.',
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
  api.use('react');
  api.use('zimme:collection-timestampable');
  api.use('aldeed:collection2');
  api.use('asdacap:agvc-machine-interface', 'server');
  api.addFiles('agvc-location.js');
  api.addFiles('map.js');
  api.addFiles('components.jsx');
  api.addFiles('rfid-reader.js', 'server');
  api.export('AllMachineMap');
  api.export('MapView');
  api.export('LocationLogs');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('asdacap:agvc-location');
  api.addFiles('agvc-location-tests.js');
});
