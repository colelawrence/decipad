import { render } from '@testing-library/react';
import { BlockDragHandle } from './BlockDragHandle';

describe('when the menu is open', () => {
  it('renders the menu items', () => {
    const { queryAllByRole, rerender } = render(<BlockDragHandle />);
    expect(queryAllByRole('menuitem')).toHaveLength(0);

    rerender(<BlockDragHandle menuOpen />);
    expect(queryAllByRole('menuitem')).not.toHaveLength(0);
  });
});
