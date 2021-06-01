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
