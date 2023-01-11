import { mockLocation } from '@decipad/dom-test-utils';
import {
  isFlagEnabled,
  disable,
  reset,
  getOverrides,
  getQueryStringOverrides,
  Flag,
} from '.';

const originalNodeEnv = process.env.NODE_ENV;
beforeEach(() => {
  process.env.NODE_ENV = 'unknown';
});
afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

it('disables flags in unknown environments', () => {
  process.env.NODE_ENV = 'unknown';
  expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);
});
it('disables flags without an environment', () => {
  process.env.NODE_ENV = undefined;
  expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);
});
it.each(['test', 'development'])('enables flags in %s', (nodeEnv) => {
  process.env.NODE_ENV = nodeEnv;
  expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(true);
});
describe('in production builds', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });
  const { mockGetLocation } = mockLocation();

  it('disables flags', () => {
    mockGetLocation.mockReturnValue(new URL('https://alpha.decipad.com'));
    expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);
  });
  it.each([
    'http://localhost:1234',
    'https://dev.decipad.com',
    'https://420.dev.decipad.com',
  ])('enables flags if hosted on %s', (host) => {
    mockGetLocation.mockReturnValue(new URL(host));
    expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(true);
  });
});

describe('in test', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('disable', () => {
    it('disables a flag', () => {
      disable('PERSISTENT_EXAMPLE');
      expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);
    });

    it('changes the overrides identity', () => {
      const prevOverrides = getOverrides();
      disable('PERSISTENT_EXAMPLE');
      expect(getOverrides()).not.toBe(prevOverrides);
    });
  });

  describe('reset', () => {
    it('undoes disable', () => {
      disable('PERSISTENT_EXAMPLE');
      expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);

      reset();
      expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(true);
    });

    it('changes the overrides identity', () => {
      const prevOverrides = getOverrides();
      reset();
      expect(getOverrides()).not.toBe(prevOverrides);
    });
  });

  describe('the Jest environment configuration', () => {
    test('[leaves a modified state]', () => {
      disable('PERSISTENT_EXAMPLE');
      expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(false);
    });

    it('automatically resets between tests', () => {
      expect(isFlagEnabled('PERSISTENT_EXAMPLE')).toBe(true);
    });
  });

  it('(meta test) query string flags are disabled in tests', () => {
    const qsOverrides = getQueryStringOverrides();
    const oneQsOverrideFlag = Object.keys(qsOverrides).at(0);
    if (oneQsOverrideFlag) {
      // Only run this test when there is at least one QS flag
      // eslint-disable-next-line jest/no-conditional-expect
      expect(isFlagEnabled(oneQsOverrideFlag as Flag)).toBe(false);
    }
  });
});
