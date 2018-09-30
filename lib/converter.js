const httpProxy = require('http-proxy');

const converter = {
  convertProxy,
  convertRedirect,
};

function convertProxy(option = {}, defaultOption = {}) {
  const proxy = {};
  proxy.type = 'proxy';
  proxy.value = httpProxy.createProxy(Object.assign({}, defaultOption, option));
  return proxy;
};

function convertRedirect(option) {
  if(!option.hasOwnProperty('Location')) throw new TypeError(`'Location' property is required.`);

  const proxy = {};
  proxy.type = 'redirect';
  if(option.hasOwnProperty('proxyType')) delete option.proxyType;
  proxy.Location = option.Location;
  delete option.Location;
  const responseHeaders = {};
  for(const configName in option) responseHeaders[configName] = option[configName];
  proxy.value = responseHeaders;
  return proxy;
}


module.exports = converter;
