const clone   = require('rfdc')({ proto: true }),
      fs      = require('fs'),
      jsYaml  = require('js-yaml');

const func = {
  copy,
  deepCopy,
  readYamlData,
};

function copy(obj) {
  return Object.assign({}, obj);
}

function deepCopy(obj) {
  return clone(obj);
}

function readYamlData(filepath, encoding = 'utf-8') {
  return jsYaml.safeLoad(fs.readFileSync(filepath, encoding));
}

module.exports = func;
