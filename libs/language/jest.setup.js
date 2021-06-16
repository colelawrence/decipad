import isoFetch from 'isomorphic-fetch';
import parseDataUrl from 'data-urls';
// import { ReadableStream } from "web-streams-polyfill/ponyfill";

// Rounded equality -- for functional tests not to care about rounding errors
function doesRoundEqual(received, closeTo) {
  if (Array.isArray(received)) {
    return received.every((item, i) => doesRoundEqual(item, closeTo[i]));
  } else {
    return Math.round(received) === Math.round(closeTo);
  }
}

expect.extend({
  toRoundEqual(received, closeTo) {
    const pass = doesRoundEqual(received, closeTo);
    const message = () =>
      `Expected ${JSON.stringify(received)} ${
        pass ? 'to' : 'not to'
      } be close to ${closeTo}`;

    return { message, pass };
  },
});

function fetch(resource, init) {
  if (typeof resource === 'string' && resource.startsWith('data:')) {
    const result = parseDataUrl(resource);

    return Promise.resolve(
      new Response(result.body, {
        status: 200,
        headers: new Headers({
          'Content-Type': result.mimeType.toString(),
        }),
      })
    );
  }
  return isoFetch(resource, init);
}

global.fetch = fetch;
