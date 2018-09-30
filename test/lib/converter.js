const assert  = require('assert'),
      httpProxy = require('http-proxy'),
      sinon   = require('sinon');
const converter = require('../../lib/converter');

describe('lib/converter', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(converter), [ 'convertProxy', 'convertRedirect' ]);
    assert.equal(typeof converter.convertProxy, 'function');
    assert.equal(typeof converter.convertRedirect, 'function');
  });

  describe('convertProxy', () => {
    let stubHttpProxyCreateProxy,
        stubObjectAssign;
    const dummyReturnObjectAssign = { stub: 'objectAssign' };
    before(() => {
      stubHttpProxyCreateProxy = sinon.stub(httpProxy, 'createProxy');
      stubObjectAssign = sinon.stub(Object, 'assign');
    });
    after(() => {
      stubHttpProxyCreateProxy.restore();
      stubObjectAssign.restore();
    });
    beforeEach(() => {
      stubHttpProxyCreateProxy.callsFake(() => 'ok');
      stubObjectAssign.returns(dummyReturnObjectAssign);
    });
    afterEach(() => {
      stubHttpProxyCreateProxy.reset();
      stubObjectAssign.reset();
    });


    it('正常系', () => {
      const args = [ { arg: 'option' }, { arg: 'defaultOption' } ];
      const result = converter.convertProxy(...args);
      assert.deepEqual(result, { type: 'proxy', value: 'ok' });
      assert.ok(stubHttpProxyCreateProxy.calledOnce);
      assert.deepEqual(stubHttpProxyCreateProxy.getCall(0).args, [ dummyReturnObjectAssign ]);
      assert.ok(stubObjectAssign.calledOnce);
      assert.deepEqual(stubObjectAssign.getCall(0).args, [ {}, args[1], args[0] ]);
    });
    describe('異常系', () => {
      it('httpProxy.createProxy is throws', () => {
        stubHttpProxyCreateProxy.throws();
        const args = [ { arg: 'option' }, { arg: 'defaultOption' } ];
        try {
          converter.convertProxy(...args);
          assert.fail();
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(stubHttpProxyCreateProxy.calledOnce);
          assert.deepEqual(stubHttpProxyCreateProxy.getCall(0).args, [ dummyReturnObjectAssign ]);
          assert.ok(stubObjectAssign.calledOnce);
          assert.deepEqual(stubObjectAssign.getCall(0).args, [ {}, args[1], args[0] ]);
        }
      });
      it('Object.assign is throws', () => {
        stubObjectAssign.throws();
        const args = [ { arg: 'option' }, { arg: 'defaultOption' } ];
        try {
          converter.convertProxy(...args);
          assert.fail();
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(stubHttpProxyCreateProxy.notCalled);
          assert.ok(stubObjectAssign.calledOnce);
          assert.deepEqual(stubObjectAssign.getCall(0).args, [ {}, args[1], args[0] ]);
        }
      });
    });
  });

  describe('convertRedirect', () => {
    const dummyHost = 'fuga.com',
          dummyValue = {
            target1: 'target1',
            target2: 'target2',
          };
    describe('正常系', () => {
      it('proxyTypeが格納されている場合', () => {
        const args = {
          proxyType: 'redirect',
          Location: dummyHost,
          ...dummyValue,
        };
        const result = converter.convertRedirect(args);
        assert.equal(result.type, 'redirect');
        assert.equal(result.Location, dummyHost);
        assert.deepEqual(result.value, dummyValue);
      });
      it('proxyTypeが格納されていない場合', () => {
        const args = {
          Location: dummyHost,
          ...dummyValue,
        };
        const result = converter.convertRedirect(args);
        assert.equal(result.type, 'redirect');
        assert.equal(result.Location, dummyHost);
        assert.deepEqual(result.value, dummyValue);
      });
      it('valueに格納されるものが存在しない場合', () => {
        const args = {
          proxyType: 'redirect',
          Location: dummyHost,
        };
        const result = converter.convertRedirect(args);
        assert.equal(result.type, 'redirect');
        assert.equal(result.Location, dummyHost);
        assert.deepEqual(result.value, {});
      });
    });
    describe('異常系', () => {
      let spyObjectHasOwnProperty;
      before(() => {
        spyObjectHasOwnProperty = sinon.spy(Object.prototype, 'hasOwnProperty');
      });
      after(() => {
        spyObjectHasOwnProperty.restore();
      });
      afterEach(() => {
        spyObjectHasOwnProperty.resetHistory();
      });


      it('Locationが存在しない', () => {
        try {
          converter.convertRedirect({});
        } catch(error) {
          assert.equal(error.name, 'TypeError');
          assert.equal(error.message, `'Location' property is required.`);
          assert.ok(spyObjectHasOwnProperty.calledOnce);
        }
      });
    });
  });
});
