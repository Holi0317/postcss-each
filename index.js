var postcss   = require('postcss');
var vars      = require('postcss-simple-vars');
var list      = postcss.list;

var SEPARATOR = /\s+in\s+/;

function checkParams(params) {
  if (!SEPARATOR.test(params)) return 'Missed "in" keyword in @each';

  var params = params.split(SEPARATOR);
  var name   = params[0].trim();
  var values = params[1].trim();

  if (!name.match(/\$[_a-zA-Z]?\w+/)) return 'Missed variable name in @each';
  if (!values.match(/(\w+\,?\s?)+/)) return 'Missed values list in @each';

  return null;
}

function paramsList(params) {
  var params    = params.split(SEPARATOR);
  var vars      = params[0].split(',');
  var valueName = vars[0];
  var indexName = vars[1];

  return {
    valueName:  valueName.replace('$', '').trim(),
    indexName:  indexName && indexName.replace('$', '').trim(),
    values:     list.comma(params[1])
  };
}

function processRules(rule, params) {
  var values = {};

  rule.eachAtRule('each', processEach);

  rule.nodes.forEach(function(node) {
    params.values.forEach(function(value, index) {
      var clone = node.clone();
      var proxy = postcss.rule({ nodes: [clone] });

      values[params.valueName] = value;
      if (params.indexName) values[params.indexName] = index;

      vars({ only: values })(proxy);

      rule.parent.insertBefore(rule, clone);
    });

    node.removeSelf();
  });
}

function processEach(rule) {
  var params = ' ' + rule.params + ' ';
  var error = checkParams(params);
  if (error) throw rule.error(error);

  var params = paramsList(params);
  processRules(rule, params);
  rule.removeSelf();
}

module.exports = postcss.plugin('postcss-each', function(opts) {
  opts = opts || {};

  return function(css) {
    css.eachAtRule('each', processEach);
  };

});
