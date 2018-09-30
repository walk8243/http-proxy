const assert  = require('assert'),
      httpMocks = require('node-mocks-http'),
      sinon   = require('sinon');
const response  = require('../../lib/response'),
      statusMessages  = require('../../data/statusMessage');

describe('lib/response', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(response), [ 'sendStatus' ]);
    assert.equal(typeof response.sendStatus, 'function');
  });

  describe('sendStatus', () => {
    let dummyRes;
    beforeEach(() => {
      dummyRes = httpMocks.createResponse();
    });

    describe('正常系', () => {
      let spyResWriteHead,
          spyResEnd;
      beforeEach(() => {
        spyResWriteHead = sinon.spy(dummyRes, 'writeHead');
        spyResEnd = sinon.spy(dummyRes, 'end');
      });
      afterEach(() => {
        spyResWriteHead.restore();
        spyResEnd.restore();
      });
  
      for(const code of [ '200', '302', '404', '500' ]) {
        it(`statusCode: ${code}`, () => {
          response.sendStatus(dummyRes, code);
          assert.ok(spyResWriteHead.calledOnce);
          assert.ok(spyResEnd.calledOnce);
          assert.ok(spyResWriteHead.getCall(0).calledBefore(spyResEnd.getCall(0)));
          assert.deepEqual(spyResWriteHead.getCall(0).args, [ code, statusMessages[code] ]);
          assert.deepEqual(spyResEnd.getCall(0).args, []);
          assert.equal(dummyRes.statusCode, code);
          assert.equal(dummyRes.statusMessage, statusMessages[code]);
        });
      }
    });
    describe('異常系', () => {
      let stubResWriteHead,
          stubResEnd;
      beforeEach(() => {
        stubResWriteHead = sinon.stub(dummyRes, 'writeHead').callThrough();
        stubResEnd = sinon.stub(dummyRes, 'end').callThrough();
      });
      afterEach(() => {
        stubResWriteHead.restore();
        stubResEnd.restore();
      });
  
      it('res.writeHead is throws', () => {
        stubResWriteHead.throws();
        const code = 500;
        try {
          response.sendStatus(dummyRes, code);
          assert.fail();
        } catch(error) {
          assert.ok(error instanceof Error);
          assert.equal(error.name, 'Error')
          assert.equal(error.message, 'Error')
          assert.ok(stubResWriteHead.calledOnce);
          assert.ok(stubResEnd.notCalled);
          assert.deepEqual(stubResWriteHead.getCall(0).args, [ code, statusMessages[code] ]);
        }
      });
      it('res.end is throws', () => {
        stubResEnd.throws();
        const code = 500;
        try {
          response.sendStatus(dummyRes, code);
          assert.fail();
        } catch(error) {
          assert.ok(error instanceof Error);
          assert.equal(error.name, 'Error')
          assert.equal(error.message, 'Error')
          assert.ok(stubResWriteHead.calledOnce);
          assert.ok(stubResEnd.calledOnce);
          assert.deepEqual(stubResWriteHead.getCall(0).args, [ code, statusMessages[code] ]);
          assert.deepEqual(stubResEnd.getCall(0).args, []);
        }
      });
    });
  });
});
