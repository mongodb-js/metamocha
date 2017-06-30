'use strict';

/**
 * Module dependencies.
 */
var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test = require('mocha/lib/test'),
    dcopy = require('deep-copy');

/**
 * @param {Suite} suite Root suite.
 */
module.exports = Mocha.interfaces['metadata_ui'] =  function (suite) {
  var suites = [suite];

  suite.on('pre-require', function (context, file, mocha) {
    var common = require('mocha/lib/interfaces/common')(suites, context, mocha);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    // Suite level metadata

    // Helper function for suite creation
    var _create = function (opts) {
      // Parsing the arguments passed in to find out what kind of suite is being made
      var title, metadata, fn;
      title = opts.args[0];
      if (opts.args.length == 2) {
        if (typeof opts.args[1] === 'object') {
          metadata = opts.args[1].metadata;
          fn = opts.args[1].tests;
        } else if (typeof opts.args[1] === 'function') {
          fn = opts.args[1];
        }
      } else if (opts.args.length == 3) { // Metadata as a param: it(title, meta, fn)
        metadata = opts.args[1];
        fn = opts.args[2];
      }

      // Creating the Suite object
      var suite = Suite.create(suites[0], title);
      suite.pending = Boolean(opts.pending);
      suite.file = file;
      suites.unshift(suite);
      if (opts.isOnly) {
        suite.parent._onlySuites = suite.parent._onlySuites.concat(suite);
        mocha.options.hasOnly = true;
      }
      suite.metadata = metadata || {};
      if (typeof fn === 'function') {
        fn.call(suite);
        suites.shift();
      } else if (typeof fn === 'undefined' && !suite.pending) {
        throw new Error('Suite "' + suite.fullTitle() + '" was defined but no callback was supplied. Supply a callback or explicitly skip the suite.');
      }

      return suite;
    }

    var _split_topology = function(title, fn, meta) {
      var split_tests = meta.topology.map(function(top) {
        var test = new Test(title, fn);
        test.metadata = dcopy(meta);
        test.metadata.topology = top;
        return test;
      });
      return split_tests;
    }

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function () {
      return _create({
        args: arguments
      });
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
      return _create({
        args: arguments,
        pending: true
      });
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function (title, fn) {
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

    context.it = context.specify = function () {
      var title, input_metadata, input_fn, fn;

      title = arguments[0];
      if (arguments.length == 2) {
        if (typeof arguments[1] === 'object') {
          input_metadata = arguments[1].metadata;
          input_fn = arguments[1].test;
        } else if (typeof arguments[1] === 'function') {
          input_fn = arguments[1];
        }
      } else if (arguments.length == 3) { // Metadata as a param: it(title, meta, fn)
        input_metadata = arguments[1];
        input_fn = arguments[2];
      }

      var suite = suites[0];
      if (suite.isPending()) {
        fn = null;
      }
      var test_metadata = input_metadata || suite.metadata;
      fn = input_fn.bind(null, (test_metadata));
      if (test_metadata && test_metadata.topology && Array.isArray(test_metadata.topology)) {
        var tests = _split_topology(title, fn, test_metadata).map(function(test) {
          test.file = file;
          suite.addTest(test);
          return test;
        });
        return tests;
      } else {
        var test = new Test(title, fn);
        test.metadata = test_metadata;
        test.file = file;
        suite.addTest(test);
        return test;
      }
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function (title, fn) {
      return common.test.only(mocha, context.it(title, fn));
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function (title) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function (n) {
      context.retries(n);
    };
  });
};
