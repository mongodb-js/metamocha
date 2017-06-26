const expect = require('chai').expect;

shows('1=1', {
  metadata: {a: 1},

  tests: function() {
    it('should equal true', () => {
       expect(1).to.eql(1);
    });
  }
});

shows('1=2', {
  metadata: {a: 2},

  tests: function() {
    it('should equal false', () => {
      expect(1).to.not.eql(2);
    });
  }
});