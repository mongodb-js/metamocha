'use strict';

/**
 * Module dependencies.
 */
let Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test = require('mocha/lib/test'),
    dmerge = require('deepmerge');

/**
 * @param {Suite} suite Root suite.
 */
module.exports = Mocha.interfaces.metadata_ui =  function(suite) {
  let suites = [suite];

  suite.on('pre-require', function(context, file, mocha) {
    const common = require('mocha/lib/interfaces/common')(suites, context, mocha);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    // Suite level metadata

    // Helper function for suite creation
    const _create = function(opts) {
      // Parsing the arguments passed in to find out what kind of suite is being made
      let title, metadata, fn;
      title = opts.args[0];
      if (opts.args.length === 2) {
        if (typeof opts.args[1] === 'object') {
          metadata = opts.args[1].metadata;
          fn = opts.args[1].tests;
        } else if (typeof opts.args[1] === 'function') {
          fn = opts.args[1];
        }
      } else if (opts.args.length === 3) { // Metadata as a param: it(title, meta, fn)
        metadata = opts.args[1];
        fn = opts.args[2];
      }

      // Creating the Suite object
      let newSuite = Suite.create(suites[0], title);
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
      let title, metadata, fn;

      title = arguments[0];
      if (arguments.length === 2) {
        if (typeof arguments[1] === 'object') {
          metadata = arguments[1].metadata;
          fn = arguments[1].test;
        } else if (typeof arguments[1] === 'function') {
          fn = arguments[1];
        }
      } else if (arguments.length === 3) { // Metadata as a param: it(title, meta, fn)
        metadata = arguments[1];
        fn = arguments[2];
      }

      let testSuite = suites[0];
      if (testSuite.isPending()) {
        fn = null;
      }
      let test = new Test(title, fn);
      test.file = file;
      testSuite.addTest(test);
      if (testSuite.metadata && metadata) {
        let combinedMetadata = dmerge(testSuite.metadata, metadata);
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
