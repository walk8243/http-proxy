const assert  = require('assert'),
      fs      = require('fs'),
      httpMocks = require('node-mocks-http'),
      sinon   = require('sinon');
const converter = require('../../lib/converter'),
      func  = require('../../lib/func'),
      proxy = require('../../lib/proxy'),
      response  = require('../../lib/response');

describe('lib/proxy', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(proxy), [ 'proxyConfigFile', 'defaultProxyConfig', 'setProxyConfig', 'generateProxyConfig', 'httpProxyServer' ]);
    assert.equal(typeof proxy.proxyConfigFile, 'string');
    assert.equal(typeof proxy.defaultProxyConfig, 'object');
    assert.equal(typeof proxy.setProxyConfig, 'function');
    assert.equal(typeof proxy.generateProxyConfig, 'function');
    assert.equal(typeof proxy.httpProxyServer, 'function');
  });

  describe('proxyConfigFile', () => {
    it('ファイルの存在確認', () => {
      try {
        const stats = fs.statSync(proxy.proxyConfigFile);
        assert.ok(stats.isFile());
      } catch(error) {
        assert.fail(error);
      }
    });
  });

  describe('setProxyConfig', () => {
    let stubFuncReadYamlData,
        stubProxyGenerateProxyConfig;
    const dummyYamlData = { dummy: 'yaml data' },
          dummyProxyConfig = { dummy: 'proxy config' },
          dummyDefaultProxyConfig = { dummy: 'default proxy config' };
    before(() => {
      stubFuncReadYamlData = sinon.stub(func, 'readYamlData');
      stubProxyGenerateProxyConfig = sinon.stub(proxy, 'generateProxyConfig');
    });
    after(() => {
      stubFuncReadYamlData.restore();
      stubProxyGenerateProxyConfig.restore();
    });
    beforeEach(() => {
      stubFuncReadYamlData.returns(dummyYamlData);
      stubProxyGenerateProxyConfig.returns(dummyProxyConfig);
    });
    afterEach(() => {
      stubFuncReadYamlData.reset();
      stubProxyGenerateProxyConfig.reset();
    });

    describe('正常系', () => {
      it('第二引数なし', () => {
        const target = {};
        proxy.setProxyConfig(target);
        assert.deepEqual(target, dummyProxyConfig);
        assert.ok(stubFuncReadYamlData.calledOnce);
        assert.deepEqual(stubFuncReadYamlData.getCall(0).args, [ proxy.proxyConfigFile ]);
        assert.ok(stubProxyGenerateProxyConfig.calledOnce);
        assert.deepEqual(stubProxyGenerateProxyConfig.getCall(0).args, [ { dummy: 'yaml data' }, proxy.defaultProxyConfig ]);
        assert.ok(stubProxyGenerateProxyConfig.calledAfter(stubFuncReadYamlData));
      });
      it('第二引数あり', () => {
        const target = {};
        proxy.setProxyConfig(target, dummyDefaultProxyConfig);
        assert.deepEqual(target, dummyProxyConfig);
        assert.ok(stubFuncReadYamlData.calledOnce);
        assert.deepEqual(stubFuncReadYamlData.getCall(0).args, [ proxy.proxyConfigFile ]);
        assert.ok(stubProxyGenerateProxyConfig.calledOnce);
        assert.deepEqual(stubProxyGenerateProxyConfig.getCall(0).args, [ { dummy: 'yaml data' }, dummyDefaultProxyConfig ]);
        assert.ok(stubProxyGenerateProxyConfig.calledAfter(stubFuncReadYamlData));
      });
    });
  });

  describe('generateProxyConfig', () => {
    let stubFuncDeepCopy,
        stubConverterConvertProxy,
        stubConverterConvertRedirect;
    before(() => {
      stubFuncDeepCopy = sinon.stub(func, 'deepCopy');
      stubConverterConvertProxy = sinon.stub(converter, 'convertProxy');
      stubConverterConvertRedirect = sinon.stub(converter, 'convertRedirect');
    });
    after(() => {
      stubFuncDeepCopy.restore();
      stubConverterConvertProxy.restore();
      stubConverterConvertRedirect.restore();
    });
    beforeEach(() => {
      stubFuncDeepCopy.returnsArg(0);
      stubConverterConvertProxy.callsFake(() => 'ReverseProxy');
      stubConverterConvertRedirect.callsFake(() => 'Redirect');
    });
    afterEach(() => {
      stubFuncDeepCopy.reset();
      stubConverterConvertProxy.reset();
      stubConverterConvertRedirect.reset();
    });

    describe('正常系', () => {
      it('proxyTypeを指定しない', () => {
        const args = [ { target: {} } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, { target: 'ReverseProxy' });
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertProxy.calledOnce);
        assert.deepEqual(stubConverterConvertProxy.getCall(0).args, [ args[0].target, {} ]);
      });
      it('proxyTypeにproxyを指定', () => {
        const args = [ { target: { proxyType: 'proxy' } } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, { target: 'ReverseProxy' });
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertProxy.calledOnce);
        assert.deepEqual(stubConverterConvertProxy.getCall(0).args, [ args[0].target, {} ]);
      });
      it('proxyTypeにreverseProxyを指定', () => {
        const args = [ { target: { proxyType: 'reverseProxy' } } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, { target: 'ReverseProxy' });
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertProxy.calledOnce);
        assert.deepEqual(stubConverterConvertProxy.getCall(0).args, [ args[0].target, {} ]);
      });
      it('proxyTypeにredirectを指定', () => {
        const args = [ { target: { proxyType: 'redirect' } } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, { target: 'Redirect' });
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertRedirect.calledOnce);
        assert.deepEqual(stubConverterConvertRedirect.getCall(0).args, [ args[0].target ]);
      });
      it('proxyConfigに複数存在', () => {
        const args = [ { target1: {}, target2: { proxyType: 'proxy' }, target3: { proxyType: 'reverseProxy' }, target4: { proxyType: 'redirect' } } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, { target1: 'ReverseProxy', target2: 'ReverseProxy', target3: 'ReverseProxy', target4: 'Redirect' });
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertProxy.calledThrice);
        assert.deepEqual(stubConverterConvertProxy.args, [ [ args[0].target1, {} ], [ args[0].target2, {} ], [ args[0].target3, {} ] ]);
        assert.ok(stubConverterConvertRedirect.calledOnce);
        assert.deepEqual(stubConverterConvertRedirect.args, [[ args[0].target4 ]]);
      });
      it('proxyTypeに候補以外を指定', () => {
        const args = [ { target1: { proxyType: 'aaa' }, target2: { proxyType: 'bbb' } } ];
        const result = proxy.generateProxyConfig(args[0]);
        assert.deepEqual(result, {});
        assert.equal(stubFuncDeepCopy.callCount, Object.keys(args[0]).length);
        assert.ok(stubConverterConvertProxy.notCalled);
        assert.ok(stubConverterConvertRedirect.notCalled);
      });
    });
    describe('異常系', () => {
      let stubConsoleError;
      before(() => {
        stubConsoleError = sinon.stub(console, 'error').callsFake(() => {});
      });
      after(() => {
        stubConsoleError.restore();
      });
      beforeEach(() => {
        stubConverterConvertProxy.throws();
        stubConverterConvertRedirect.throws();
      });
      afterEach(() => {
        stubConsoleError.resetHistory();
      });

      it('func.deepCopy is throws', () => {
        stubFuncDeepCopy.throws();
        try {
          proxy.generateProxyConfig({ target: {} });
          assert.fail();
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(stubFuncDeepCopy.called);
          assert.ok(stubConverterConvertProxy.notCalled);
          assert.ok(stubConverterConvertRedirect.notCalled);
        }
      });
      it('converter.convertProxy is throws', () => {
        stubConverterConvertProxy.throws();
        proxy.generateProxyConfig({ target: { proxyType: 'proxy' } });
        assert.ok(stubFuncDeepCopy.called);
        assert.ok(stubConverterConvertProxy.called);
        assert.ok(stubConverterConvertRedirect.notCalled);
        assert.ok(stubConsoleError.calledTwice);
        assert.deepEqual(stubConsoleError.getCall(0).args, [ `'target' couldn't be set ProxyConfig. Please check 'proxy.config.js'.` ]);
        assert.equal(stubConsoleError.getCall(1).args.length, 1);
        assert.equal(stubConsoleError.getCall(1).args[0].name, 'Error');
        assert.equal(stubConsoleError.getCall(1).args[0].message, 'Error');
      });
      it('converter.convertRedirect is throws', () => {
        stubConverterConvertRedirect.throws();
        proxy.generateProxyConfig({ target: { proxyType: 'redirect' } });
        assert.ok(stubFuncDeepCopy.called);
        assert.ok(stubConverterConvertProxy.notCalled);
        assert.ok(stubConverterConvertRedirect.called);
        assert.ok(stubConsoleError.calledTwice);
        assert.deepEqual(stubConsoleError.getCall(0).args, [ `'target' couldn't be set ProxyConfig. Please check 'proxy.config.js'.` ]);
        assert.equal(stubConsoleError.getCall(1).args.length, 1);
        assert.equal(stubConsoleError.getCall(1).args[0].name, 'Error');
        assert.equal(stubConsoleError.getCall(1).args[0].message, 'Error');
      });
    });
  });

  describe('httpProxyServer', () => {
    let dummyReq,
        dummyRes;
    const fakeWeb = sinon.fake();
    const dummyHost = 'fuga.com',
          dummyProxyValue = {
            type: 'proxy',
            value: {
              web: fakeWeb,
            },
          },
          dummyRedirectValue = {
            type: 'redirect',
            Location: 'hoge.com',
            value: {
              aaa: 'fuga',
              bbb: 'hoge',
            },
          },
          dummyOtherValue = {
            type: 'other',
          };
    beforeEach(() => {
      dummyReq = httpMocks.createRequest({
        url: '/',
        headers: {
          host: dummyHost,
        },
      });
      dummyRes = httpMocks.createResponse();
    });

    describe('正常系', () => {
      it('proxyTypeがproxyの場合', () => {
        proxy.httpProxyServer(dummyReq, dummyRes, { [dummyHost]: dummyProxyValue });
        assert.equal(dummyRes.statusCode, 200);
        assert.ok(fakeWeb.calledOnce);
      });
      it('proxyTypeがredirectの場合', () => {
        const spys = [
          sinon.spy(dummyRes, 'setHeader'),
          sinon.spy(dummyRes, 'writeHead'),
          sinon.spy(dummyRes, 'end')
        ];
        proxy.httpProxyServer(dummyReq, dummyRes, { [dummyHost]: dummyRedirectValue });
        assert.equal(dummyRes.statusCode, 302);
        assert.equal(dummyRes.setHeader.callCount, Object.keys(dummyRedirectValue.value).length);
        assert.ok(dummyRes.writeHead.calledOnce);
        assert.ok(dummyRes.end.calledOnce);
        assert(dummyRes.getHeader('Location') != `http://${dummyReq.headers.host}${dummyReq.url}`);
        assert(dummyRes.getHeader('Location') == `http://${dummyRedirectValue.Location}${dummyReq.url}`);
        assert.deepEqual(dummyRes.setHeader.args, Object.entries(dummyRedirectValue.value));
        for(const spy of spys) { spy.restore(); }
      });
      it('proxyTypeがそれ以外の場合', () => {
        sinon.spy(response, 'sendStatus');
        proxy.httpProxyServer(dummyReq, dummyRes, { [dummyHost]: dummyOtherValue });
        assert.equal(dummyRes.statusCode, 404);
        assert.ok(response.sendStatus.calledOnce);
        assert.deepEqual(response.sendStatus.getCall(0).args, [ dummyRes, 404 ]);
        response.sendStatus.restore();
      });
    });
    describe('異常系', () => {
      let stubConsoleError,
          spyResponseSendStatus;
      before(() => {
        stubConsoleError = sinon.stub(console, 'error').callsFake(() => {});
        spyResponseSendStatus = sinon.spy(response, 'sendStatus');
      });
      after(() => {
        stubConsoleError.restore();
        spyResponseSendStatus.restore();
      });
      afterEach(() => {
        stubConsoleError.resetHistory();
        spyResponseSendStatus.resetHistory();
      });

      it('requestがheadersプロパティを持っていない', () => {
        delete dummyReq.headers;
        proxy.httpProxyServer(dummyReq, dummyRes, {});
        assert.equal(dummyRes.statusCode, 500);
        assert.ok(stubConsoleError.calledOnce);
        assert.equal(stubConsoleError.getCall(0).args[0].name, 'TypeError');
        assert.equal(stubConsoleError.getCall(0).args[0].message, `'req' don't have 'headers' property.`);
        assert.ok(spyResponseSendStatus.calledOnce);
      });
      it('request.headersがhostプロパティを持っていない', () => {
        delete dummyReq.headers.host;
        proxy.httpProxyServer(dummyReq, dummyRes, {});
        assert.equal(dummyRes.statusCode, 500);
        assert.ok(stubConsoleError.calledOnce);
        assert.equal(stubConsoleError.getCall(0).args[0].name, 'TypeError');
        assert.equal(stubConsoleError.getCall(0).args[0].message, `'req.headers' don't have 'host' property.`);
        assert.ok(spyResponseSendStatus.calledOnce);
      });
      it('proxysがアクセスしたホストをプロパティとして持っていない', () => {
        proxy.httpProxyServer(dummyReq, dummyRes, {});
        assert.equal(dummyRes.statusCode, 500);
        assert.ok(stubConsoleError.calledOnce);
        assert.equal(stubConsoleError.getCall(0).args[0].name, 'TypeError');
        assert.equal(stubConsoleError.getCall(0).args[0].message, `'proxys' don't have '${dummyReq.headers.host}' property.`);
        assert.ok(spyResponseSendStatus.calledOnce);
      });
    });
  });
});
