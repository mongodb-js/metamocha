const expect = require('chai').expect;

describe('test-level metadata', () => {
  // Original, no metadata
  it('should not appear on regular "it" tests', () => {
    let test = it('should split on a delimiter', () => {
      const parts = '1,2,3'.split(',');
      expect(parts).to.eql(['1', '2', '3']);
    });
    expect(test.metadata).to.be.undefined;
  });

  // Metadata as 2nd parameter
  it('should appear when specified as the 2nd parameter', () => {
    let test = it('should split on a delimiter, with metadata as 2nd parameter',
      { requires: {topology: 'single'} }, () => {
        const parts = '1,2,3'.split(',');
        expect(parts).to.eql(['1', '2', '3']);
      });
    expect(test.metadata).to.eql({requires: {topology: 'single'}});
  });


  // Integra-style metadata
  it('should appear when sending an Integra-style object', () => {
    let test = it('should split on a delimiter, with metadata presented Integra-style', {
      metadata: { requires: { topology: [ 'single' ] } },

      test: function() {
        const parts = '1,2,3'.split(',');
        expect(parts).to.eql(['1', '2', '3']);
      }
    });
    expect(test.metadata).to.eql({ requires: { topology: [ 'single' ] } });
  });
});

// Passing metadata on the suite level
describe('suite-level metadata', {
  metadata: { requires: { topology: 'single' } },

  tests: function() {
    it('should appear on tests that don\'t specify their own metadata', () => {
      let test;
      describe('metadata suite', {
        metadata: { requires: { topology: 'single' } },

        tests: function() {
          test = it('should split on a delimiter, with metadata passed on through the suite', () => {
            const parts = '1,2,3'.split(',');
            expect(parts).to.eql(['1', '2', '3']);
          });
        }
      });
      expect(test.metadata).to.eql({ requires: { topology: 'single' } });
    });

    it('should have similar fields overwritten by test-level metadata (Integra-style)', () => {
      let test;
      describe('metadata suite', {
        metadata: { requires: { topology: 'single', version: '2.5.8' } },

        tests: function() {
          test = it('should split on a delimiter, with suite metadata overwritten', {
            metadata: { requires: { topology: 'replset' } },

            test: function() {
              const parts = '1,2,3'.split(',');
              expect(parts).to.eql(['1', '2', '3']);
            }
          });
        }
      });
      expect(test.metadata).to.eql({ requires: { topology: 'replset', version: '2.5.8' } });
    });

    it('should have similar fields overwritten by test-level metadata (second parameter style)', () => {
      let test;
      describe('metadata suite', {
        metadata: { requires: { topology: 'single', version: '2.5.8' } },

        tests: function() {
          test = it('should split on a delimiter, with suite metadata overwritten',
            { requires: { topology: 'sharded'} }, function() {
              const parts = '1,2,3'.split(',');
              expect(parts).to.eql(['1', '2', '3']);
            });
        }
      });
      expect(test.metadata).to.eql({ requires: { topology: 'sharded', version: '2.5.8' } });
    });
  }
});

// Validating input
describe('tests and suites', () => {
  it('should error if the first parameter isn\'t a string', () => {
    let badTest = function() {
      it(0, () => {
        const parts = '1,2,3'.split(',');
        expect(parts).to.eql(['1', '2', '3']);
      });
    };
    let badSuite = function() {
      describe(0, () => {});
    };
    expect(badTest).to.throw();
    expect(badSuite).to.throw();
  });

  it('should error if the second parameter isn\'t a function or an object', () => {
    let badTest = function() {
      it('should fail', 'no function');
    };
    let badSuite = function() {
      describe('failing suite', 'no function');
    };
    expect(badTest).to.throw();
    expect(badSuite).to.throw();
  });

  it('should error if, when given a third argument, the second argument isn\'t an object or the third argument isn\'t a function', () => {
    let firstBadTest = function() {
      it('should fail once', 'no object', () => {});
    };
    let secondBadTest = function() {
      it('should fail also', { a: 1 }, 'no function');
    };
    let firstBadSuite = function() {
      describe('first failing suite', 'no object', () => {});
    };
    let secondBadSuite = function() {
      describe('second failing suite', { a: 1 }, 'no function');
    };
    expect(firstBadTest).to.throw();
    expect(secondBadTest).to.throw();
    expect(firstBadSuite).to.throw();
    expect(secondBadSuite).to.throw();
  });

  it('should error if more than three arguments are given', () => {
    let badTest = function() {
      it('should fail', { a: 1 }, () => {}, 'extra argument');
    };
    let badSuite = function() {
      describe('failing suite', { a: 1 }, () => {}, 'extra argument');
    };
    expect(badTest).to.throw();
    expect(badSuite).to.throw();
  });
});
