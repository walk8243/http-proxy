const converter = require('./converter'),
      func      = require('./func'),
      response  = require('./response');

const defaultProxyConfig = {
        reverseProxy: {},
        redirect: {},
      },
      proxy = {
        proxyConfigFile: __dirname+'/../data/proxy.config.yml',
        defaultProxyConfig: defaultProxyConfig,
        setProxyConfig,
        generateProxyConfig,
        httpProxyServer,
      };

function setProxyConfig(proxys, defaultConfig = proxy.defaultProxyConfig) {
  for(const key in proxys) delete proxys[key];
  Object.assign(proxys, proxy.generateProxyConfig(func.readYamlData(proxy.proxyConfigFile), defaultConfig));
}

function generateProxyConfig(proxyConfig, defaultConfig = proxy.defaultProxyConfig) {
  const proxys = {};
  for(const key in proxyConfig) {
    const thisProxyConfig = func.deepCopy(proxyConfig[key]);
    switch(thisProxyConfig.proxyType) {
      case 'proxy': case 'reverseProxy': case undefined:
        try {
          proxys[key] = converter.convertProxy(thisProxyConfig, defaultConfig.reverseProxy);
        } catch(error) {
          console.error(`'${key}' couldn't be set ProxyConfig. Please check 'proxy.config.js'.`);
          console.error(error);
        }
        break;
      case 'redirect':
        try {
          proxys[key] = converter.convertRedirect(thisProxyConfig);
        } catch(error) {
          console.error(`'${key}' couldn't be set ProxyConfig. Please check 'proxy.config.js'.`);
          console.error(error);
        }
        break;
      default: break;
    }
  }
  return proxys;
}

function httpProxyServer(req, res, proxys) {
  try {
    if(!req.hasOwnProperty('headers')) throw new TypeError(`'req' don't have 'headers' property.`);
    if(!req.headers.hasOwnProperty('host')) throw new TypeError(`'req.headers' don't have 'host' property.`);
    if(!proxys.hasOwnProperty(req.headers.host)) throw new TypeError(`'proxys' don't have '${req.headers.host}' property.`);
    const thisProxy = proxys[req.headers.host];
    switch(thisProxy.type) {
      case 'proxy':
        thisProxy.value.web(req, res);
        break;
      case 'redirect':
        for(const key in thisProxy.value) res.setHeader(key, thisProxy.value[key]);
        res.writeHead(302, { Location: `http://${thisProxy.Location}${req.url}` });
        res.end();
        break;
      default:
        response.sendStatus(res, 404);
        break;
    }
  } catch(error) {
    console.error(error);
    response.sendStatus(res, 500);
  }
}

module.exports = proxy;
