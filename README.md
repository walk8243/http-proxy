# walk8243-proxy
一つのサーバ内で複数のNodeサーバを立ち上げるためのプロキシサーバを作成

## GETTING STARTED
### `git clone`の場合
`/data/proxy.config.yml`の内容を任意に書き換えて以下のコマンドを実行してください。
書き換えはこのモジュールの **[Options](https://www.npmjs.com/package/http-proxy#options)** を参考にしてください。
差異は、`proxyType` のみです。
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
const proxys = proxy.generateProxyConfig({
  'fuga.hoge': {
    proxyType: 'redirect',
    Location: 'www.fuga.hoge'
  },
  'www.fuga.hoge': {
    proxyType: reverseProxy,
    target: {
      host: 'localhost',
      port: 8080,
    }
  }
});

http
  .createServer((req, res) => {
    if(!proxys.hasOwnProperty(req.headers.host)) return res.sendStatus(404);
    proxy.httpProxyServer(req, res, proxys)
  }).listen(80);
```

## LICENSE
`walk8243-proxy` is released under the [ISC LICENSE](https://github.com/walk8243/http-proxy/blob/master/LICENSE.md)
