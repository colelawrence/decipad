expect.extend({
  toHaveType(received, expectedType) {
    const pass = received.type === expectedType;
    if (pass) {
      return {
        message: () => `expected ${received} to have type ${expectedType}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to have type ${expectedType}`,
      pass: false,
    };
  },
});

expect.extend({
  toHaveChildrenText(received, expectedTexts) {
    if (expectedTexts.length !== received.length) {
      return {
        message: () =>
          `expected received array to have length ${expectedTexts.length}, but got ${received.length}`,
        pass: false,
      };
    }

    for (let i = 0; i < received.length; i++) {
      const element = received[i];
      if (
        !element.children ||
        !Array.isArray(element.children) ||
        element.children[0].text !== expectedTexts[i]
      ) {
        return {
          message: () =>
            `expected element at index ${i} to have text '${
              expectedTexts[i]
            }', but got '${
              element.children ? element.children[0].text : 'undefined'
            }'`,
          pass: false,
        };
      }
    }

    return {
      message: () => 'all elements have the expected children text',
      pass: true,
    };
  },
});
