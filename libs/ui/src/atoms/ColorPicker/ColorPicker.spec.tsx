import { render } from '@testing-library/react';
import { brand500 } from '../../primitives';
import { ColorPicker } from './ColorPicker';

describe('Color picker', () => {
  it('renders the color prop as the background', () => {
    const { getByRole } = render(
      <ColorPicker color={brand500} selected={false} />
    );
    expect(getComputedStyle(getByRole('option')).backgroundColor).toBe(
      brand500.rgb
    );
  });
});
