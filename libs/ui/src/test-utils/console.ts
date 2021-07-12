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
