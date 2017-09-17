'use strict';

var Metamocha = require('../lib/metamocha');

// Instantiate new Metamocha
var metamocha = new Metamocha();

// Add files from directory
metamocha.lookupFiles('test');

// Apply a filter
metamocha.addFilter(function(test) {
  return test.hasOwnProperty('metadata');
});

// Set up configuration
var config = { a: 1 };

// Run
metamocha.run(config, function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
