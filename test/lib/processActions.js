const assert  = require('assert'),
      pmx     = require('pmx'),
      sinon   = require('sinon');
const processActions = require('../../lib/processActions');

describe('lib/processActions', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(processActions), [ 'setPm2Action' ]);
    assert.equal(typeof processActions.setPm2Action, 'function');
  });

  describe('setPm2Action', () => {
    let stubPmxAction;
    const fakes = sinon.fake(),
          fakeReply = sinon.fake(),
          dummyActionName = 'action-name',
          dummyParameter = 'parameter';
    before(() => {
      stubPmxAction = sinon.stub(pmx, 'action');
    });
    after(() => {
      stubPmxAction.restore();
    });
    afterEach(() => {
      stubPmxAction.reset();
      fakes.resetHistory();
      fakeReply.resetHistory();
    });

    describe('正常系', () => {
      it('パラメータが2つの場合', () => {
        processActions.setPm2Action(dummyActionName, fakes);
        assert.ok(fakes.calledOnce);
        stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
        stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
        assert.equal(fakes.callCount, 1 + fakeReply.callCount);
        assert.deepEqual(fakes.args, [ [], [], [] ]);
        assert.ok(fakeReply.calledTwice);
        assert.deepEqual(fakeReply.getCall(0).args, [ { action: 'action-name', paramater: 'parameter' } ]);
        assert.deepEqual(fakeReply.getCall(1).args, fakeReply.getCall(0).args);
      });
      it('パラメータが3つの場合', () => {
        processActions.setPm2Action(dummyActionName, fakes, dummyParameter);
        assert.ok(fakes.calledOnce);
        stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
        assert.equal(fakes.callCount, 1 + fakeReply.callCount);
        assert.deepEqual(fakes.args, [ [ dummyParameter ], [ dummyParameter ] ]);
        assert.ok(fakeReply.calledOnce);
        assert.deepEqual(fakeReply.getCall(0).args, [ { action: 'action-name', paramater: 'parameter' } ]);
      });
      it('パラメータが4つの場合', () => {
        processActions.setPm2Action(dummyActionName, fakes, dummyParameter, dummyParameter);
        assert.ok(fakes.calledOnce);
        stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
        assert.equal(fakes.callCount, 1 + fakeReply.callCount);
        assert.deepEqual(fakes.args, [ [ dummyParameter, dummyParameter ], [ dummyParameter, dummyParameter ] ]);
        assert.ok(fakeReply.calledOnce);
        assert.deepEqual(fakeReply.getCall(0).args, [ { action: 'action-name', paramater: 'parameter' } ]);
      });
    });
    describe('異常系', () => {
      it('1回目でエラー', () => {
        const fakeThrow = sinon.stub().throws();
        try {
          processActions.setPm2Action(dummyActionName, fakeThrow);
          stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(fakeThrow.calledOnce);
          assert.ok(fakeReply.notCalled);
        }
      });
      it('2回目でエラー', () => {
        const fakeSecondThrow = sinon.stub();
        fakeSecondThrow
          .onSecondCall().throws()
          .returns('aaa');
        try {
          processActions.setPm2Action(dummyActionName, fakeSecondThrow);
          stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
          assert.fail();
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(fakeSecondThrow.calledTwice);
          assert.ok(fakeReply.notCalled);
        }
      });
      it('3回目でエラー', () => {
        const fakeThirdThrow = sinon.stub();
        fakeThirdThrow
          .onThirdCall().throws()
          .returns('aaa');
        try {
          processActions.setPm2Action(dummyActionName, fakeThirdThrow);
          stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
          stubPmxAction.callArgWith(1, dummyParameter, fakeReply);
          assert.fail();
        } catch(error) {
          assert.equal(error.name, 'Error');
          assert.equal(error.message, 'Error');
          assert.ok(fakeThirdThrow.calledThrice);
          assert.ok(fakeReply.calledOnce);
        }
      });
    });
  });
});
