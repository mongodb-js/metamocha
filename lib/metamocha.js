var Mocha = require('mocha'),
    Context = require('mocha').Context,
    path = require('path'),
    fs = require('fs');

/**
 * Metamocha Test Runner
 */
var Metamocha = function(opts) {
  require('./metadata_ui');

  var mochaOpts = opts || {};
  if (!mochaOpts.ui) {
    mochaOpts.ui = 'metadata_ui';
  } else {
    console.warn('Warning: Metadata in tests depends on the metadataUi or extensions of that UI');
  }

  this.mocha = new Mocha(mochaOpts);
  this.files = [];
  this.filters = [];
};

/**
 * Load files and generate Test objects
 */
Metamocha.prototype.loadFiles = function() {
  var self = this;

  this.files.forEach(function(file) {
    self.mocha.addFile(file);
  });
  this.mocha.loadFiles();
  if (this.filters.length) {
    this.applyFilters();
  }
  return this;
};

/**
 * Add single file to the list of test files 
 */
Metamocha.prototype.addFile = function(file) {
  this.files.push(file);
  return this;
};

/**
 * Add files contained in one directory to the list of test files
 */
Metamocha.prototype.addFolder = function(dir) {
  var self = this;

  if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
    throw new Error('Input must be a directory: ' + dir);
  }

  fs.readdirSync(dir).filter(function(file) {
    return path.extname(file) === '.js';
  }).forEach(function(file) {
    self.addFile(path.join(dir, file));
  });
};


/**
 * Recursively add files in a test directory to the list of test files
 */
Metamocha.prototype.addFolderRec = function(dir) {
  var self = this;

  if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
    throw new Error('Input must be a directory: ' + dir);
  }

  fs.readdirSync(dir).forEach(function(file) {
    if (fs.lstatSync(path.join(dir, file)).isDirectory()) {
      self.addFolderRec(path.join(dir, file));
    } else if (path.extname(file) === '.js') {
      self.addFile(path.join(dir, file));
    }
  });
};

/**
 * Add filter to the list of filters
 */
Metamocha.prototype.addFilter = function(filter) {
  if (typeof filter !== 'function' && typeof filter !== 'object') {
    throw new Error('Type of filter must either be a function or an object');
  }
  if (typeof filter === 'object' && (!filter.filter || typeof filter.filter !== 'function')) {
    throw new Error('Object filters must have a function named filter');
  }

  if (typeof filter === 'function') {
    this.filters.push({filter: filter});
  } else {
    this.filters.push(filter);
  }
  return this;
};

/**
 * Apply the filters in the list to the tests
 */
Metamocha.prototype.applyFilters = function() {
  var self = this;
  var rootSuite = this.mocha.suite;

  rootSuite.suites.forEach(function(suite) {
    suite.tests = suite.tests.filter(function(test) {
      return self.filters.some(function(filterObj) {
        return filterObj.filter(test);
      });
    });
  });
  return this;
};

/**
 * Run the tests
 */ 
Metamocha.prototype.run = function(configuration, done) {
  // Monkey patch to allow for configuration to be added with the context
  Context.prototype.runnable = function(runnable) {
    if (!arguments.length) {
      return this._runnable;
    }

    if (runnable && runnable.metadata) {
      this.metadata = runnable.metadata;
    }

    this.test = this._runnable = runnable;
    this.configuration = configuration;
    return this;
  };

  if (this.files.length) {
    this.loadFiles();
  }

  this.mocha.run(done);
};

exports = module.exports = Metamocha;
