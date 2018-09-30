const clone = require('rfdc')({ proto: true });

const func = {
  copy,
  deepCopy,
};

function copy(obj) {
  return Object.assign({}, obj);
}

function deepCopy(obj) {
  return clone(obj);
}

module.exports = func;
