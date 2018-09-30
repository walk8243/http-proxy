# walk8243-http-proxy
一つのサーバ内で複数のNodeサーバを立ち上げるためのプロキシサーバを作成

## GETTING STARTED
### `git clone`の場合
```main.js
const http = require('http');
const proxy = require('./lib/proxy');
const proxys = proxy.setProxyConfig({
  'fuga.hoge': {
    proxyType: 'redirect',
    Location: 'www.fuga.hoge'
  },
  'www.fuga.hoge': {
    target: {
      host: 'localhost',
      port: 8080,
    }
  }
});

http
  .createServer((req, res) => proxy.httpProxyServer(req, res, proxys))
  .listen(80);
```

```
# root権限を持っていない場合
sudo npm start

# root権限を持ってる場合
npm start
```

### `npm install`の場合
```main.js
const http = require('http'),
      proxy = require('walk8243-http-proxy');
const proxys = proxy.setProxyConfig({
  'fuga.hoge': {
    proxyType: 'redirect',
    Location: 'www.fuga.hoge'
  },
  'www.fuga.hoge': {
    target: {
      host: 'localhost',
      port: 8080,
    }
  }
});

http
  .createServer((req, res) => proxy.httpProxyServer(req, res, proxys))
  .listen(80);
```

## LICENSE
`walk8243-http-proxy` is released under the [ISC LICENSE](https://github.com/walk8243/http-proxy/blob/master/LICENSE.md)
