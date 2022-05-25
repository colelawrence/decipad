import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle atom', () => {
  it('emits change event', async () => {
    const handleChange = jest.fn();
    render(<Toggle onChange={handleChange} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('changes the circle position when active', () => {
    const { rerender } = render(<Toggle />);

    const leftPosition = getComputedStyle(screen.getByRole('checkbox')).left;

    rerender(<Toggle active />);

    const newPosition = getComputedStyle(screen.getByRole('checkbox')).left;
    expect(newPosition).not.toEqual(leftPosition);
  });
});
