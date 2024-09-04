import { beforeEach, afterEach, vi } from 'vitest';

export const mockLocation = (
  initialUrl = 'http://localhost/page?search#hash'
) => {
  const originalLocation = globalThis.location;
  const mockGetLocation = vi.fn();
  const mockSetLocation = vi.fn();
  const mockAssign = vi.fn();
  const mockReload = vi.fn();

  beforeEach(() => {
    mockGetLocation.mockReset().mockReturnValue(new URL(initialUrl));
    mockSetLocation.mockClear();
    mockAssign.mockClear();
    mockReload.mockClear();

    // @ts-expect-error location is not optional but will be re-defined shortly
    delete globalThis.location;
    class MockUrl extends URL {
      assign = mockAssign;
      reload = mockReload;
    }
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      enumerable: true,
      get: () => new MockUrl(mockGetLocation().href),
      set: mockSetLocation,
    });
  });
  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      enumerable: true,
      value: originalLocation,
    });
  });

  return { mockGetLocation, mockSetLocation, mockAssign, mockReload };
};
