'use strict';

var Metamocha = require('../lib/metamocha');

// Instantiate new Metamocha
var metamocha = new Metamocha();

// Recursively add files from directory
metamocha.addFolder('test/');

// Apply a filter
metamocha.addFilter({
  filter: function(test) {
    return (test.metadata && test.metadata.a && test.metadata.a === 1);
  }
});

// Run
metamocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
