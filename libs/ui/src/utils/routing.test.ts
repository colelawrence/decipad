import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useHasRouter } from './routing';

describe('useHasRouter', () => {
  it('returns false if there is no router', () => {
    const {
      result: { current },
    } = renderHook(useHasRouter);
    expect(current).toBe(false);
  });

  it('returns true if there is a router', () => {
    const {
      result: { current },
    } = renderHook(useHasRouter, { wrapper: MemoryRouter });
    expect(current).toBe(true);
  });
});
