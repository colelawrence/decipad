import { render, screen } from '@testing-library/react';
import { brand500 } from '../../primitives';
import { ColorPicker } from './ColorPicker';

describe('Color picker', () => {
  it('renders the color prop as the background', () => {
    render(<ColorPicker color={brand500} selected={false} />);
    expect(getComputedStyle(screen.getByRole('option')).backgroundColor).toBe(
      brand500.rgb
    );
  });
});
