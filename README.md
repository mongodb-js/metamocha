# metamocha
Node.js module to add metadata to your Mocha tests

## Installation
First, install the module from npm 
```
npm install metamocha
```

If you're using Mocha in your project programatically, you can include `metamocha` like so:
```javascript
var Mocha = require('mocha');
var metadata_ui = require('metamocha');

var mocha = new Mocha({ ui: 'metadata_ui' });

// Your test running code here
```

## Usage
### Add metadata to your tests

Metamocha implements a custom UI extended from the 'bdd' interface. Metadata, in the form of an object, can be passed to tests themselves in two ways.
```javascript
// Standard 'it' test, with no metadata
it('should have no metadata', () => {

});

// Test with metadata passed as the second argument
it('should have metadata', { a: 1 }, () => {
    
});

// Test with metadata passed in an alternate object-based syntax
it('should also have metadata', {
    metadata: { a: 1 },

    test: function() {

    }
});
```

### Add metadata to your suites
Metadata can also be passed to tests through the suite level. By default, any tests will inherit their suite's metadata if it's present. If a test has its own metadata, it'll override any metadata passed in through the suite.
```javascript
// Suite metadata passed as the second argument
describe('a suite with metadata', { a: 1 }, () => {
  it('should pass its metadata on to its tests', () => {
    // This test should have metadata { a : 1 }
  }); 

  it('should have its metadata overriten by test-level metadata', {
    metadata: { a: 2 },

    test: function() {
      // This test should have metadata { a: 2 }
    }
  });
});

// Suite metadata passed in an alternate object-based syntax
describe('another suite with metadata', {
  metadata: { a: 1 },

  tests: function() {
    it('should still pass its metadata along', () => {
      // This test should have metadata { a: 1 }
    });
  }
}); 
```

### Have tests reference their own metadata
A test's metadata is contained within its `Context`, so you can access it with `this.metadata` inside the test run.
```javascript
it('should be able to access its own metadata', {
  metadata: { a: 1 },

  test: function() {
    expect(this.metadata).to.eql({ a: 1 });
  }
});
```
