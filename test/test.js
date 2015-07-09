var postcss = require('postcss');
var assert  = require('assert');

var plugin = require('../');

function test(input, expected, opts, done) {
  var result = postcss([plugin(opts)]).process(input).css;
  assert.equal(result, expected);
};

describe('postcss-each', function() {

  it('expects valid syntax', function() {
    var missedIn = function() {
      test('@each $icon foo, bar {}');
    };

    var missedVar = function() {
      test('@each in foo, bar {}');
    };

    var missedValues = function() {
      test('@each $icon in {}');
    };

    assert.throws(missedIn, /Missed "in" keyword in @each/);
    assert.throws(missedVar, /Missed variable name in @each/);
    assert.throws(missedValues, /Missed values list in @each/);
  });

  it('iterates through given values', function() {
    var input     = '@each $icon in foo, bar { .icon-$(icon) {' +
                    'background: url("$(icon).png"); } }';
    var expected  = '.icon-foo {\n    background: url("foo.png")\n}\n' +
                    '.icon-bar {\n    background: url("bar.png")\n}';
    test(input, expected);
  });

  it('iterates through one value', function() {
    var input     = '@each $icon in foo { .icon-$(icon) {' +
                    'background: url("$(icon).png"); } }';
    var expected  = '.icon-foo {\n    background: url("foo.png")\n}';
    test(input, expected);
  });

  it('iterates short names', function() {
    var input     = '@each $i in foo { .icon-$(i) {' +
                    'background: url("$(i).png"); } }';
    var expected  = '.icon-foo {\n    background: url("foo.png")\n}';
    test(input, expected);
  });

  it('iterates value and index', function() {
    var input     = '@each $val, $i in foo, bar { .icon-$(val) {' +
                    'background: url("$(val)_$(i).png"); } }';
    var expected  = '.icon-foo {\n    background: url("foo_0.png")\n}\n' +
                    '.icon-bar {\n    background: url("bar_1.png")\n}';
    test(input, expected);
  });

  it('respects multiple selectors', function() {
    var input     = '@each $icon in foo, bar { .icon-$(icon), .$(icon)' +
                    '{ background: url("$(icon).png"); } }';
    var expected  = '.icon-foo, .foo {\n    background: url("foo.png")\n}\n' +
                    '.icon-bar, .bar {\n    background: url("bar.png")\n}';
    test(input, expected);
  });

  it('respects properties with `in` substring', function() {
    var input     = '@each $icon in print, bar { .$(icon)' +
                    '{ background: url("$(icon).png"); } }';
    var expected  = '.print {\n    background: url("print.png")\n}\n' +
                    '.bar {\n    background: url("bar.png")\n}';
    test(input, expected);
  });

  it('respects multiline expressions', function() {
    var input     = '@each $icon\nin foo { .$(icon)' +
                    '{ background: url("$(icon).png"); } }';
    var expected  = '.foo {\n    background: url("foo.png")\n}';
    test(input, expected);
  });

  it('respects multiple properties', function() {
    var input     = '@each $icon in foo, bar { .icon-$(icon) {' +
                    'background: url("$(icon).png");' +
                    'content: "$(icon)";' +
                    '}}';
    var expected  = '.icon-foo {\n    background: url("foo.png");\n' +
                                 '    content: "foo"\n}\n' +
                    '.icon-bar {\n    background: url("bar.png");\n' +
                                 '    content: "bar"\n}';
    test(input, expected);
  });

  it('doesn\'t replace other variables', function() {
    var input     = '@each $icon in foo, bar { .icon-$(icon), .$(icon)' +
                    '{ background: url("$(bg).png"); } }';
    var expected  = '.icon-foo, .foo {\n    background: url("$(bg).png")\n}\n' +
                    '.icon-bar, .bar {\n    background: url("$(bg).png")\n}';
    test(input, expected);
  });

});

it('performs nested iteration', function() {
  var input     = '@each $icon in foo, bar { .icon-$(icon) {' +
                  '@each $thing in abc, xyz { border: $(thing); }' +
                  '} }';
  var expected  = '.icon-foo {\n    border: abc;\n    border: xyz\n}\n' +
                  '.icon-bar {\n    border: abc;\n    border: xyz\n}';
  test(input, expected);
});
