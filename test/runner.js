var Mocha = require('mocha')
  , Suite = Mocha.Suite
  , Runner = Mocha.Runner
  , Test = Mocha.Test
  , fs = require('fs')
  , path = require('path')
  , metadata_ui = require('./metadata_ui');


var argv = require('optimist')
    .usage('Usage: $0 -t [target]')
    .demand(['t'])
    .argv;

// Instantiate new Mocha instance
var mocha = new Mocha({ui: 'metadata_ui'});

// Add the test file
mocha.addFile(argv.t);

// Run the tests
mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  })

  process.exit();
})

