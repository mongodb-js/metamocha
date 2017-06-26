var Mocha = require('mocha')
  , Suite = Mocha.Suite
  , Runner = Mocha.Runner
  , Test = Mocha.Test
  , fs = require('fs')
  , path = require('path')
  , recursiveReadSync = require('recursive-readdir-sync')
  , metadata_ui = require('../metadata_ui');


var argv = require('optimist')
    .usage('Usage: $0 -t [target] -k [filter key] -v [filter value]')
    .demand(['t'])
    .argv;

// Instantiate new Mocha instance
var mocha = new Mocha({ui: 'metadata_ui'});

if (fs.lstatSync(argv.t).isDirectory()) {
  // Load the tests from the directory
  recursiveReadSync(argv.t).filter(function(file) {
    // Filter out the non-js files
    return file.substr(-3) === '.js';
  }).forEach(function(file) {
    mocha.addFile(file);
  });
} else {
  mocha.addFile(argv.t);
}

// Load files
mocha.loadFiles();

// If we have k and v arguments, filter the tests based on those metadata
if (argv.k && argv.v) {
  console.log(typeof argv.v);
  var rootSuite = mocha.suite;
  rootSuite.suites.forEach(function(suite) {
    suite.tests = suite.tests.filter(function(test) {
      return test.metadata && test.metadata[argv.k] && test.metadata[argv.k] === argv.v;
    });
  }); 
}

// Run the tests
mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  })

  process.exit();
})

