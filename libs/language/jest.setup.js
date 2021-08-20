/* eslint-disable import/no-extraneous-dependencies */
import isoFetch from 'isomorphic-fetch';
import parseDataUrl from 'data-urls';
/* eslint-enable import/no-extraneous-dependencies */
import { Date as IDate, TimeQuantity } from './src/interpreter/Value';
import { stringifyDate } from './src/date';
import { InferError } from './src/type';

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

// Snapshot serializer for interpreter values
expect.addSnapshotSerializer({
  test: (v) => v instanceof IDate,
  print: (date) =>
    `DeciDate(${date.specificity} ${stringifyDate(
      date.getData(),
      date.specificity
    )})`,
});

expect.addSnapshotSerializer({
  test: (v) => v instanceof InferError,
  print: ({ spec: { errType, ...errData } }) => {
    const errDataString = Object.entries(errData)
      .map(([key, value]) => `"${key}" => ${JSON.stringify(value)}`)
      .join(', ');

    return `InferError.${errType}(${errDataString})`;
  },
});

expect.addSnapshotSerializer({
  test: (v) => v instanceof TimeQuantity,
  print: ({ timeUnits }) =>
    `TimeQuantity({ ${[...timeUnits.entries()]
      .map(([unitName, quantity]) => `${unitName}: ${quantity}`)
      .join(', ')} })`,
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
