import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle atom', () => {
  it('emits change event', async () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Toggle onChange={handleChange} />);

    await userEvent.click(getByRole('button'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('changes the circle position when active', () => {
    const { rerender, getByRole } = render(<Toggle />);

    const leftPosition = getComputedStyle(getByRole('checkbox')).left;

    rerender(<Toggle active />);

    const newPosition = getComputedStyle(getByRole('checkbox')).left;
    expect(newPosition).not.toEqual(leftPosition);
  });
});
