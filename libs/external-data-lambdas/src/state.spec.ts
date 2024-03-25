import { OAuthState, decodeState, encodeState } from './state';

describe('encodeState', () => {
  it('throws if `redirect_url` is not URL', () => {
    const state: OAuthState = {
      completionUrl: 'not a url',
      externalDataId: 'id',
    };

    expect(() => encodeState(state)).toThrowErrorMatchingInlineSnapshot(`
      "state did not parse successfully: [
        {
          "validation": "url",
          "code": "invalid_string",
          "message": "Invalid url",
          "path": [
            "completionUrl"
          ]
        }
      ]"
    `);
  });

  it('returns correct base64 encoding', () => {
    const state: OAuthState = {
      completionUrl: 'https://hello.world',
      externalDataId: 'id',
    };

    const base64 = Buffer.from(JSON.stringify(state)).toString('base64');

    expect(encodeState(state)).toStrictEqual(base64);
  });
});

describe('decodeState', () => {
  it('throws if random string', () => {
    expect(() => decodeState('not base 64')).toThrowErrorMatchingInlineSnapshot(
      `"Could not parse JSON from state"`
    );
  });

  it('throws if incorrect object as base64', () => {
    const base64 = Buffer.from(JSON.stringify({ incorrect: 'obj' })).toString(
      'base64'
    );

    expect(() => decodeState(base64)).toThrowErrorMatchingInlineSnapshot(`
      "state did not parse successfully: [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "completionUrl"
          ],
          "message": "Required"
        },
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "externalDataId"
          ],
          "message": "Required"
        }
      ]"
    `);
  });

  it('returns object containing state from correctly encoded string', () => {
    const base64 = Buffer.from(
      JSON.stringify({
        completionUrl: 'https://hello.world',
        externalDataId: 'id',
      } satisfies OAuthState)
    ).toString('base64');

    expect(decodeState(base64)).toMatchObject({
      completionUrl: 'https://hello.world',
      externalDataId: 'id',
    });
  });
});
