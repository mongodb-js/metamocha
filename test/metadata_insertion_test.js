const expect = require('chai').expect;

describe('test-level metadata', () => {
  // Original, no metadata
  // it: string * fn -> fn 
  it('should not appear on regular "it" tests', () => {
      var test = it('should split on a delimiter', () => {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
      });
      expect(test.metadata).to.be.undefined;
  });

  // Metadata as 2nd parameter
  // they: string * object * fn -> fn
  it('should appear when specified as the 2nd parameter in "they"', () => {
      var test = it('should split on a delimiter, with metadata as 2nd parameter', 
        { requires: {topology: 'single'} }, () => {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
      });
      expect(test.metadata).to.eql({requires: {topology: 'single'}});
  });


  // Integra-style metadata
  // theys: string * object -> fn
  it('should appear when sending an object with "theys"', () => {
    var test = it('should split on a delimiter, with metadata presented Integra-style', {
        metadata: { requires: { topology: [ 'single' ] } },
      
        test: function () {
          const parts = '1,2,3'.split(',');
          expect(parts).to.eql(['1', '2', '3']);
        }
      });
    expect(test.metadata).to.eql({ requires: { topology: [ 'single' ] } });
  })

  // Metadata immediately preceding (might not work?)
  // metadata({ requires: { topology: [ 'single' ] } })
  // it('should split on a delimiter',() => {
  //     const parts = '1,2,3'.split(',');
  //     expect(parts).to.eql(['1', '2', '3']);
  // });
});

// Passing metadata on the suite level
shows('suite-level metadata', {
  metadata: { requires: { topology: 'single' } },

  tests: function() {
    it('should appear on tests that don\'t specify their own metadata', () => {
      var test;
      var suite = 
        shows('metadata suite', {
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

    it('should get overwritten by test-level metadata (Integra-style)', () => {
      var test;
      var suite = 
        shows('metadata suite', {
          metadata: { requires: { topology: 'single' } },

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
      expect(test.metadata).to.eql({ requires: { topology: 'replset' } });
    });

    it('should get overwritten by test-level metadata (second parameter style)', () => {
      var test;
      var suite = 
        shows('metadata suite', {
          metadata: { requires: { topology: 'single' } },

          tests: function() {
            test = it('should split on a delimiter, with suite metadata overwritten',
              { requires: { topology: 'sharded' } }, function () {
                const parts = '1,2,3'.split(',');
                expect(parts).to.eql(['1', '2', '3']);
            });
          }
        });
      expect(test.metadata).to.eql({ requires: { topology: 'sharded' } });
    });
  }
});