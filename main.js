const http  = require('http');
const processActions  = require('./lib/processActions'),
      proxy = require('./lib/proxy'),
      response  = require('./lib/response');
const defaultReverseProxyConfig = {
        target: {
          host: '127.0.0.1',
          port: 3000,
        },
      },
      proxys = {};

processActions.setPm2Action('update-proxy', proxy.setProxyConfig, proxys, { reverseProxy: defaultReverseProxyConfig });

http.createServer((req, res) => {
  if(!proxys.hasOwnProperty(req.headers.host)) return response.sendStatus(res, 404);

  proxy.httpProxyServer(req, res, proxys);
}).listen(80);
