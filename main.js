const http  = require('http');
const proxy = require('./lib/proxy'),
      response  = require('./lib/response');
const defaultReverseProxyConfig = {
        target: {
          host: '127.0.0.1',
          port: 3000,
        },
      },
      proxyConfig = {
        'walk8243.com': {
          proxyType: 'redirect',
          Location: 'www.walk8243.com',
        },
        'www.walk8243.com': {
          proxyType: 'reverseProxy',
          target: {
            host: '127.0.0.1',
            port: 3000,
          }
        },
      },
      proxys = proxy.setProxyConfig(proxyConfig, { reverseProxy: defaultReverseProxyConfig });

http.createServer((req, res) => {
  if(!proxys.hasOwnProperty(req.headers.host)) return response.sendStatus(res, 404);

  proxy.httpProxyServer(req, res, proxys);
}).listen(8080);
