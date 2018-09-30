const assert  = require('assert');
const func = require('../../lib/func');

describe('lib/func', () => {
  it('内容確認', () => {
    assert.deepEqual(Object.keys(func), [ 'copy', 'deepCopy' ]);
    assert.equal(typeof func.copy, 'function');
    assert.equal(typeof func.deepCopy, 'function');
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
});
