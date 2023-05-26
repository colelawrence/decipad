import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  // Mock localStorage
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    mockStorage = {};
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
    Storage.prototype.getItem = jest.fn((key) => mockStorage[key] || null);
  });

  it('uses initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('reads existing value from localStorage', () => {
    mockStorage.test = JSON.stringify('stored');
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    expect(result.current[0]).toBe('stored');
  });

  it('writes value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(mockStorage.test).toBe(JSON.stringify('new-value'));
    expect(result.current[0]).toBe('new-value');
  });

  it('updates when localStorage changes', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test',
          oldValue: 'old',
          newValue: JSON.stringify('new-value'),
        })
      );
    });

    expect(result.current[0]).toBe('new-value');
  });
});
