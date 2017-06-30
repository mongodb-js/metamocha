const expect = require('chai').expect;

describe('A test with multiple specified topologies', function() {
  it('should generate more than one test', function() {
    var tests = it('should have multiple topologies', {
      metadata: { topology: ['single', 'replset'] },

      test: function(_metadata) {
        expect(_metadata.topology).to.be.an('array');
      }
    });
    expect(tests).to.have.lengthOf(2);
    var topologies = tests.map(function(test) {
      return test.metadata.topology;
    });
    expect(topologies).to.eql(['single', 'replset']);
  });
});