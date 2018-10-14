const assert  = require('assert'),
      fs      = require('fs'),
      jsYaml  = require('js-yaml'),
      sinon   = require('sinon');
const func  = require('../../lib/func');

describe('lib/func', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(func), [ 'copy', 'deepCopy', 'readYamlData' ]);
    assert.equal(typeof func.copy, 'function');
    assert.equal(typeof func.deepCopy, 'function');
    assert.equal(typeof func.readYamlData, 'function');
  });

  describe('copy', () => {
    const dummyObj = {
      one: '1',
      two: '2',
      three: '3',
    };
    it('別物としてコピーされているかどうか', () => {
      const result = func.copy(dummyObj);
      assert.deepEqual(result, dummyObj);
      assert.ok(result !== dummyObj);
    });
  });
  describe('deepCopy', () => {
    const dummyObj = {
      one: '1',
      two: '2',
      three: {
        one: '31',
        two: '32',
      },
    };
    it('別物としてコピーされているかどうか', () => {
      const result = func.deepCopy(dummyObj);
      assert.deepEqual(result, dummyObj);
      assert.ok(result !== dummyObj);
    });
  });

  describe('readYamlData', () => {
    let stubFsReadFileSync,
        stubJsYamlSafeLoad;
    const returnsFsReadFileSync = 'fs.readFileSync',
          returnsJsYamlSafeLoad = 'jsYaml.safeLoad';
    before(() => {
      stubFsReadFileSync = sinon.stub(fs, 'readFileSync');
      stubJsYamlSafeLoad = sinon.stub(jsYaml, 'safeLoad');
    });
    after(() => {
      stubFsReadFileSync.restore();
      stubJsYamlSafeLoad.restore();
    });
    beforeEach(() => {
      stubFsReadFileSync.returns(returnsFsReadFileSync);
      stubJsYamlSafeLoad.returns(returnsJsYamlSafeLoad);
    });

    it('正しい順序で正しくYamlファイルが読み込まれているか', () => {
      const dummyYamlFile = 'dummy yaml';
      const result = func.readYamlData(dummyYamlFile);
      assert.strictEqual(result, returnsJsYamlSafeLoad);
      assert.ok(stubFsReadFileSync.calledOnce);
      assert.deepEqual(stubFsReadFileSync.getCall(0).args, [ dummyYamlFile, 'utf-8' ]);
      assert.ok(stubJsYamlSafeLoad.calledOnce);
      assert.deepEqual(stubJsYamlSafeLoad.getCall(0).args, [ returnsFsReadFileSync ]);
      assert.ok(stubJsYamlSafeLoad.calledAfter(stubFsReadFileSync));
    });
  });
});
