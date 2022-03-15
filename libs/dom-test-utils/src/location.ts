interface LocationMocks {
  mockGetLocation: jest.MockedFunction<() => URL>;
  mockSetLocation: jest.MockedFunction<(newLocation: string) => void>;
  mockAssign: jest.MockedFunction<typeof globalThis.location.assign>;
  mockReload: jest.MockedFunction<typeof globalThis.location.reload>;
}
export const mockLocation = (
  initialUrl = 'http://localhost/page?search#hash'
): LocationMocks => {
  const originalLocation = globalThis.location;
  const mockGetLocation: LocationMocks['mockGetLocation'] = jest.fn();
  const mockSetLocation: LocationMocks['mockSetLocation'] = jest.fn();
  const mockAssign: LocationMocks['mockAssign'] = jest.fn();
  const mockReload: LocationMocks['mockReload'] = jest.fn();

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
