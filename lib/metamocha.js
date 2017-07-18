var Mocha = require('mocha'),
    metadataUi = require('./metadata_ui'), // eslint-disable-line no-unused-vars
    path = require('path'),
    recursiveReadSync = require('recursive-readdir-sync'),
    fs = require('fs');

/**
 * Metamocha Test Runner
 */
var Metamocha = function() {
  this.mocha = new Mocha({ui: 'metadata_ui'});
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

  if (fs.lstatSync(dir).isDirectory()) {
    fs.readdirSync(dir).filter(function(file) {
      return file.substr(-3) === '.js';
    }).forEach(function(file) {
      self.files.push(path.join(dir, file));
    });
  } else {
    throw new Error('Input must be a directory');
  }
};


/**
 * Recursively add files in a test directory to the list of test files
 */
Metamocha.prototype.addFolderRec = function(dir) {
  var self = this;

  if (fs.lstatSync(dir).isDirectory()) {
    recursiveReadSync(dir).filter(function(file) {
      return file.substr(-3) === '.js';
    }).forEach(function(file) {
      self.files.push(file);
    });
  } else {
    throw new Error('Input must be a directory');
  }
};

/**
 * Add filter to the list of filters
 */
Metamocha.prototype.addFilter = function(filter) {
  this.filters.push(filter);
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
Metamocha.prototype.run = function(done) {
  if (this.files.length) {
    this.loadFiles();
  }
  this.mocha.run(done);
};

exports = module.exports = Metamocha;
