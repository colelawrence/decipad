import { evalUnsafeCode } from './evalUnsafeCode';

describe('evalUnsafeCode', () => {
  describe('functionality', () => {
    it('works with simple math', async () => {
      // eslint-disable-next-line no-template-curly-in-string
      const result = await evalUnsafeCode('`four = ${2 + 2}`');
      expect(result).toBe('four = 4');
    });
  });

  describe('safety rules', () => {
    enforceProductionEnv();
    const accessError = new Error('eval is only available for developers');

    it('should be disabled in production', async () =>
      expect(evalUnsafeCode('2 + 2')).rejects.toThrow(accessError));
  });
});

function enforceProductionEnv() {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = 'production';

    Object.defineProperty(window, 'location', {
      value: new URL('https://alpha.decipad.com'),
    });
  });
  afterEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = originalNodeEnv;

    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });
  });
}
