export const mockConsoleWarn = () => {
  const originalConsoleWarn = console.warn;
  const mockConsoleWarn: jest.MockedFunction<typeof console.warn> = jest.fn();

  beforeEach(() => {
    console.warn = jest.fn();
    mockConsoleWarn.mockClear();
  });
  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  return mockConsoleWarn;
};
export const mockConsoleError = () => {
  const originalConsoleError = console.error;
  const mockConsoleError: jest.MockedFunction<typeof console.error> = jest.fn();

  beforeEach(() => {
    console.error = jest.fn();
    mockConsoleError.mockClear();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  return mockConsoleError;
};
