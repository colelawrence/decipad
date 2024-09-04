import { beforeEach, expect, describe, afterEach, it } from 'vitest';
import { mockLocation } from '@decipad/dom-test-utils';
import type { Flag } from '.';
import {
  isFlagEnabled,
  disable,
  reset,
  getOverrides,
  getQueryStringOverrides,
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
  expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(false);
});
it('disables flags without an environment', () => {
  process.env.NODE_ENV = undefined;
  expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(false);
});
describe('in production builds', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });
  const { mockGetLocation } = mockLocation();

  it('disables flags', () => {
    mockGetLocation.mockReturnValue(new URL('https://app.decipad.com'));
    expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(false);
  });
  it.each([
    'http://localhost:1234',
    'https://dev.decipad.com',
    'https://decipadstaging.com',
  ])('enables flags if hosted on %s', (host) => {
    mockGetLocation.mockReturnValue(new URL(host));
    expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(true);
  });
});

describe('in test', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('disable', () => {
    it('disables a flag', () => {
      disable('DEVELOPER_TOOLBAR');
      expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(false);
    });

    it('changes the overrides identity', () => {
      const prevOverrides = getOverrides();
      disable('DEVELOPER_TOOLBAR');
      expect(getOverrides()).not.toBe(prevOverrides);
    });
  });

  describe('reset', () => {
    it('undoes disable', () => {
      disable('DEVELOPER_TOOLBAR');
      expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(false);

      reset();
      expect(isFlagEnabled('DEVELOPER_TOOLBAR')).toBe(true);
    });

    it('changes the overrides identity', () => {
      const prevOverrides = getOverrides();
      reset();
      expect(getOverrides()).not.toBe(prevOverrides);
    });
  });

  it('(meta test) query string flags are disabled in tests', () => {
    const qsOverrides = getQueryStringOverrides();
    const oneQsOverrideFlag = Object.keys(qsOverrides).at(0);
    if (oneQsOverrideFlag) {
      // Only run this test when there is at least one QS flag
      expect(isFlagEnabled(oneQsOverrideFlag as Flag)).toBe(false);
    }
  });
});
