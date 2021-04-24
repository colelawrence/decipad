'use strict';

/* eslint-env jest */

const test = require('./utils/test-with-sandbox');
const box = require('./utils/call-sandbox');

test('/test', () => {
  it('GET /test/a', () => {
    expect.assertions(1);
    return box.get('/test/a').catch((err) => {
      expect(err).toMatchObject({ statusCode: 404 });
    });
  });

  it('POST /test', () => {
    return box.post('/test?a=b');
  });

  it('waits a bit', () => timeout(1000));

  it('GET /test/a', async () => {
    const result = await box.get('/test/a');
    expect(result.body).toMatchObject({
      key: 'a',
      value: 'b',
    });
  });
});

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
