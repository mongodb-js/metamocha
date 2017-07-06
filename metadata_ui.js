'use strict';

/**
 * Module dependencies.
 */
var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test = require('mocha/lib/test'),
    dmerge = require('deepmerge');

/**
 * @param {Suite} suite Root suite.
 */
module.exports = Mocha.interfaces.metadata_ui =  function(suite) {
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha) {
    var common = require('mocha/lib/interfaces/common')(suites, context, mocha);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    // Suite level metadata

    // Helper function for suite creation
    var _create = function(opts) {
      // Parsing the arguments passed in to find out what kind of suite is being made
      var title, metadata, fn;

      if (opts.args.length < 2) {
        throw new Error('Not enough arguments passed.');
      }
      if (typeof opts.args[0] !== 'string') {
        throw new Error('First argument of a suite must be a string.');
      }
      title = opts.args[0];
      if (opts.args.length === 2) { // No metadata, describe(title, fn), or metadata as an object, describe(title, obj)
        if (typeof opts.args[1] === 'object') {
          if (opts.args[1].metadata && typeof opts.args[1] === 'object'
            && opts.args[1].tests && typeof opts.args[1].tests === 'function') {
            metadata = opts.args[1].metadata;
            fn = opts.args[1].tests;
          } else {
            throw new Error('If passing an object as the second parameter, it must be of the form { metadata: <obj>, tests: <fn> }');
          }
        } else if (typeof opts.args[1] === 'function') {
          fn = opts.args[1];
        } else {
          throw new Error('Incorrect suite usage. Must be either "describe(<string>, { <object>, <function> })"" or "describe(<string>, <function)"');
        }
      } else if (opts.args.length === 3) { // Metadata as a param: describe(title, meta, fn)
        if (opts.args[1] && typeof opts.args[1] === 'object'
          && opts.args[2] && typeof opts.args[2] === 'function') {
          metadata = opts.args[1];
          fn = opts.args[2];
        } else {
          throw new Error('If passing three parameters, they must be of the form "describe(<string>, <object>, <function>)"');
        }
      } else if (opts.args.length > 3) {
        throw new Error('Too many arguments passed.');
      }

      // Creating the Suite object
      var newSuite = Suite.create(suites[0], title);
      newSuite.pending = Boolean(opts.pending);
      newSuite.file = file;
      suites.unshift(newSuite);
      if (opts.isOnly) {
        newSuite.parent._onlySuites = newSuite.parent._onlySuites.concat(newSuite);
        mocha.options.hasOnly = true;
      }
      newSuite.metadata = metadata || {};
      if (typeof fn === 'function') {
        fn.call(newSuite);
        suites.shift();
      } else if (typeof fn === 'undefined' && !newSuite.pending) {
        throw new Error('Suite "' + newSuite.fullTitle() + '" was defined but no callback was supplied. Supply a callback or explicitly skip the suite.');
      }

      return newSuite;
    };

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function() {
      return _create({
        args: arguments
      });
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
      return _create({
        args: arguments,
        pending: true
      });
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn) {
      return _create({
        args: arguments,
        isOnly: true
      });
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function() {
      var title, metadata, fn;

      if (arguments.length < 2) {
        throw new Error('Not enough arguments passed.');
      }
      if (typeof arguments[0] !== 'string') {
        throw new Error('First argument of a test must be a string.');
      }
      title = arguments[0];
      if (arguments.length === 2) { // No metadata, it(title, fn), or metadata as an object, it(title, obj)
        if (typeof arguments[1] === 'object') {
          if (arguments[1].metadata && typeof arguments[1] === 'object'
            && arguments[1].test && typeof arguments[1].test === 'function') {
            metadata = arguments[1].metadata;
            fn = arguments[1].test;
          } else {
            throw new Error('If passing an object as the second parameter, it must be of the form { metadata: <obj>, tests: <fn> }');
          }
        } else if (typeof arguments[1] === 'function') {
          fn = arguments[1];
        } else {
          throw new Error('Incorrect suite usage. Must be either "it(<string>, { <object>, <function> })"" or "it(<string>, <function)"');
        }
      } else if (arguments.length === 3) { // Metadata as a param: it(title, meta, fn)
        if (arguments[1] && typeof arguments[1] === 'object'
          && arguments[2] && typeof arguments[2] === 'function') {
          metadata = arguments[1];
          fn = arguments[2];
        } else {
          throw new Error('If passing three parameters, they must be of the form "it(<string>, <object>, <function>)"');
        }
      } else if (arguments.length > 3) {
        throw new Error('Too many arguments passed.');
      }

      var testSuite = suites[0];
      if (testSuite.isPending()) {
        fn = null;
      }
      var test = new Test(title, fn);
      test.file = file;
      testSuite.addTest(test);
      if (testSuite.metadata && metadata) {
        var combinedMetadata = dmerge(testSuite.metadata, metadata);
        test.metadata = combinedMetadata;
      } else if (testSuite.metadata && !metadata) {
        test.metadata = testSuite.metadata;
      } else {
        test.metadata = metadata;
      }
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title, fn) {
      return common.test.only(mocha, context.it(title, fn));
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function(n) {
      context.retries(n);
    };
  });
};
