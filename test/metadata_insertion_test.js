const expect = require('chai').expect;

describe('test-level metadata', () => {
  // Original, no metadata
  it('should not appear on regular "it" tests', () => {
      var test = it('should split on a delimiter', () => {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
      });
      expect(test.metadata).to.be.undefined;
  });

  // Metadata as 2nd parameter
  it('should appear when specified as the 2nd parameter', () => {
      var test = it('should split on a delimiter, with metadata as 2nd parameter', 
        { requires: {topology: 'single'} }, () => {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
      });
      expect(test.metadata).to.eql({requires: {topology: 'single'}});
  });


  // Integra-style metadata
  it('should appear when sending an Integra-style object', () => {
    var test = it('should split on a delimiter, with metadata presented Integra-style', {
        metadata: { requires: { topology: [ 'single' ] } },
      
        test: function () {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
        }
      });
    expect(test.metadata).to.eql({ requires: { topology: [ 'single' ] } });
  })
});

// Passing metadata on the suite level
describe('suite-level metadata', {
  metadata: { requires: { topology: 'single' } },

  tests: function() {
    it('should appear on tests that don\'t specify their own metadata', () => {
      var test;
      var suite = 
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
      var test;
      var suite = 
        describe('metadata suite', {
          metadata: { requires: { topology: 'single', version: '2.5.8' } },

          tests: function() {
            test = it('should split on a delimiter, with suite metadata overwritten', {
              metadata: { requires: { topology: 'replset' } },
            
              test: function () {
                const parts = '1,2,3'.split(',');
                expect(parts).to.eql(['1', '2', '3']);
              }
            });
          }
        });
      expect(test.metadata).to.eql({ requires: { topology: 'replset', version: '2.5.8' } });
    });

    it('should have similar fields overwritten by test-level metadata (second parameter style)', () => {
      var test;
      var suite = 
        describe('metadata suite', {
          metadata: { requires: { topology: 'single', version: '2.5.8' } },

          tests: function() {
            test = it('should split on a delimiter, with suite metadata overwritten',
              { requires: { topology: 'sharded'} }, function () {
                const parts = '1,2,3'.split(',');
                expect(parts).to.eql(['1', '2', '3']);
            });
          }
        });
      expect(test.metadata).to.eql({ requires: { topology: 'sharded', version: '2.5.8' } });
    });
  }
});