/* eslint-env node,browser */
/* eslint-disable import/no-extraneous-dependencies */
import stringify from 'json-stringify-safe';
import isoFetch from 'isomorphic-fetch';
import parseDataUrl from 'data-urls';
/* eslint-enable import/no-extraneous-dependencies */
import { DateValue } from './src/value/Value';
import { stringifyDate } from './src/date';
import { isNode } from './src/utils';
import { prettyPrintAST } from './src';

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
      `Expected ${stringify(received)} ${
        pass ? 'to' : 'not to'
      } be close to ${closeTo}`;

    return { message, pass };
  },
});

// Snapshot serializer for interpreter values
expect.addSnapshotSerializer({
  test: (v) => v instanceof DateValue,
  print: (date) =>
    `DateValue(${date.specificity} ${stringifyDate(
      date.moment,
      date.specificity
    )})`,
});

expect.addSnapshotSerializer({
  test: (v) => v && typeof v === 'object' && isNode(v),
  print: (node, _print, indent) => prettyPrintAST(node, indent),
});

expect.addSnapshotSerializer({
  test: (v) => v != null && typeof v.errType === 'string',
  print: ({ errType, ...errData }, print) => {
    if (errData[errType] != null && Object.keys(errData).length === 1) {
      return `ErrSpec:${errType}(${print(errData[errType])})`;
    } else {
      const errDataString = Object.entries(errData)
        .map(([key, value]) => `"${key}" => ${print(value)}`)
        .join(', ');

      return `ErrSpec:${errType}(${errDataString})`;
    }
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
