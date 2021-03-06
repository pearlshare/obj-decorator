var assert    = require('assert');
var _         = require('lodash');
var decorator = require('../index');


var origData = {
  name: 'Oliver Brooks',
  dontShow: 'superSecret',
  sillyNameForDescription: 'Writing coffeescript at the moment!',
  createdAt: new Date(),
  ohNoAFunction: function() {
    return "Don't want functions in our output do we?";
  },
  contactDetails: [
    {
      type: 'phone',
      value: 'myPhoneNumber'
    },
    {
      type: 'email',
      value: 'myEmailAddress'
    }
  ],
  otherArray: [
    'fish',
    1,
    function() {
      return 'function output'
    },
    {object: 'pig'}
  ]
};

describe('obj-decorator', function() {
  var testData;

  beforeEach(function() {
    testData = _.clone(origData);
  });

  context('default', function() {

    it('should strip out keys which have functions for values', function() {
      var out = decorator()(testData);
      assert.equal(out.ohNoAFunction, undefined);
    });

    it('should return undefined if no object is given', function() {
      var out = decorator()();
      assert.equal(out, undefined);
    });
  });

  context('restricted', function() {
    var out;

    beforeEach(function() {
      out = decorator({
        restricted: ['dontShow']
      })(testData);
    });

    it('should not contain the dontshow key', function() {
      assert.equal(out.dontShow, undefined);
    });

    it('should not remove any other keys', function() {
      assert.equal(out.name, origData.name);
    });
  });

  context('key transforms', function() {
    var out;

    before(function() {
      out = decorator({
        keyTransforms: {sillyNameForDescription: 'description'}
      })(testData);
    });

    it('should not contain the dontshow key', function() {
      assert.equal(out.description, origData.sillyNameForDescription);
    })

    it('should not change other keys', function() {
      assert.equal(out.name, origData.name);
    });
  });

  context('value transforms', function() {
    var out;

    before(function() {
      out = decorator({
        valueTransforms: {
          createdAt: function(v) {
            return v.getTime();
          }
        }
      })(testData);
    });

    it('should tranform the created at date to a time stamp', function() {
      assert.equal(out.createdAt, origData.createdAt.getTime());
    });

    it('should not change other values', function() {
      assert.equal(out.name, origData.name);
    });
  });

  context('nested arrays', function() {
    var decorate;

    before(function() {
      decorate = decorator({
        restricted: ['type']
      });
    });

    it('should remove type from the nested objects', function() {
      out = decorate(testData);
      assert(!out.contactDetails[0].hasOwnProperty('type'));
    });

    it('should remove functions', function() {
      out = decorate(testData);
      assert.equal(out.otherArray.length, 3);
    });

    it('should remove functions', function() {
      out = decorate(testData);
      assert.equal(out.otherArray.length, 3);
    });
  });

  context('circular refs', function() {
    var decorate;

    before(function() {
      decorate = decorator({
        valueTransforms: {
          "two": function(v) {
            return v+3;
          }
        }
      });
    });

    it('should deal with circular refs', function() {
      var obj = [
        {two: 2}
      ]
      obj.push(obj);

      out = decorate(obj);
      assert.equal(obj[0].two, 5);
      assert.equal(obj[1][0].two, 5);
    });

  });
});


