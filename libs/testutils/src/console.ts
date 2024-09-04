import { vi, beforeEach, afterEach } from 'vitest';

export const mockConsoleWarn = () => {
  const originalConsoleWarn = console.warn;
  const mockConsoleWarn = vi.fn();

  beforeEach(() => {
    console.warn = mockConsoleWarn;
    mockConsoleWarn.mockClear();
  });
  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  return mockConsoleWarn;
};
export const mockConsoleError = () => {
  const originalConsoleError = console.error;
  const mockConsoleError = vi.fn();

  beforeEach(() => {
    console.error = mockConsoleError;
    mockConsoleError.mockClear();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  return mockConsoleError;
};
