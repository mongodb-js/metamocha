'use strict';

/**
 * Module dependencies.
 */
var Mocha = require('mocha'),
    Suite = require('mocha/lib/suite'),
    Test = require('mocha/lib/test');

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
    context.shows = function(title, obj) {
      var suite = Suite.create(suites[0], title);
      suite.pending = Boolean(obj.pending);
      suite.file = file;
      suites.unshift(suite);
      suite.metadata = obj.metadata || {};
      if (typeof obj.tests === 'function') {
        obj.tests.call(suite);
        suites.shift();
      } else if (typeof obj.tests === 'undefined' && !suite.pending) {
        throw new Error('Suite "' + suite.fullTitle() + '" was defined but no callback was supplied. Supply a callback or explicitly skip the suite.');
      }
      return suite;
    }

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function (title, fn) {
      
      return common.suite.create({
        title: title,
        file: file,
        fn: fn
      });
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
      return common.suite.skip({
        title: title,
        file: file,
        fn: fn
      });
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function (title, fn) {
      return common.suite.only({
        title: title,
        file: file,
        fn: fn
      });
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function () {
      var title, metadata, fn;

      title = arguments[0];
      if (arguments.length == 2) {
        if (typeof arguments[1] === 'object') {
          metadata = arguments[1].metadata;
          fn = arguments[1].test;
        } else if (typeof arguments[1] === 'function') {
          fn = arguments[1];
        }
      } else if (arguments.length == 3) { // Metadata as a param: it(title, meta, fn)
        metadata = arguments[1];
        fn = arguments[2];
      }

      var suite = suites[0];
      if (suite.isPending()) {
        fn = null;
      }
      var test = new Test(title, fn);
      test.file = file;
      suite.addTest(test);
      test.metadata = metadata || suite.metadata;
      return test;
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
