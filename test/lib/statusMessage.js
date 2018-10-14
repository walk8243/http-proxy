const assert  = require('assert');
const statusMessages  = require('../../lib/statusMessage');

describe('lib/statusMessage', () => {
  it('内容確認', () => {
    assert.equal(typeof statusMessages, 'object');
    assert.ok(Object.keys(statusMessages).length >= 20);
    for(const key in statusMessages) {
      assert.ok(typeof key === 'number' || typeof key === 'string');
      assert.strictEqual(typeof statusMessages[key], 'string');
    }
  });
});
